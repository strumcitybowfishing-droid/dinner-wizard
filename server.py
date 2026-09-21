"""Dinner Wizard app server: Supabase auth + folder storage + static files.
Does not touch Line & Dock.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, session

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("DATA_DIR") or (ROOT / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
SQLITE_PATH = DATA_DIR / "users.db"
DATABASE_URL = os.environ.get("DATABASE_URL") or ""
SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "https://odnhnrgpqhodmjjekctj.supabase.co").rstrip("/")
SUPABASE_SERVICE_ROLE = os.environ.get("SUPABASE_SERVICE_ROLE") or ""
APP_BASE = os.environ.get("APP_BASE") or "https://dinner-wizard-app.onrender.com"

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ITERATIONS = 210_000
USE_SUPABASE = bool(SUPABASE_SERVICE_ROLE)


def _secret_from_disk() -> str:
    path = DATA_DIR / "secret.key"
    if path.exists():
        return path.read_text(encoding="utf-8").strip()
    key = secrets.token_hex(32)
    path.write_text(key, encoding="utf-8")
    return key


app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get("SECRET_KEY") or _secret_from_disk()
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("RENDER") == "true"
app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 24 * 180


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), ITERATIONS)
    return salt + "$" + dk.hex()


def check_password(password: str, stored: str) -> bool:
    if not stored:
        return False
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    guess = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), ITERATIONS).hex()
    return hmac.compare_digest(guess, digest)


def new_recovery_code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    raw = "".join(secrets.choice(alphabet) for _ in range(8))
    return "DW-" + raw[:4] + "-" + raw[4:]


def sb(method: str, path: str, data=None, raw: bytes | None = None, content_type: str = "application/json"):
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE,
        "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE,
        "Content-Type": content_type,
    }
    body = raw
    if data is not None and raw is None:
        body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(SUPABASE_URL + path, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=25) as res:
            payload = res.read()
            if not payload:
                return res.status, {}
            try:
                return res.status, json.loads(payload.decode("utf-8"))
            except json.JSONDecodeError:
                return res.status, payload
    except urllib.error.HTTPError as exc:
        err = exc.read()
        parsed = {}
        try:
            parsed = json.loads(err.decode("utf-8"))
        except Exception:
            parsed = {"error": err.decode("utf-8", "replace")[:400]}
        return exc.code, parsed


def sb_user_public(user: dict) -> dict:
    meta = user.get("user_metadata") or {}
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "plan": meta.get("plan") or "free",
        "hasRecovery": bool(meta.get("recovery_hash")),
    }


def sb_get_user_by_email(email: str):
    status, data = sb("GET", "/auth/v1/admin/users?page=1&per_page=200")
    users = (data or {}).get("users") if isinstance(data, dict) else []
    email = email.lower()
    for user in users or []:
        if str(user.get("email") or "").lower() == email:
            return user
    return None


def sb_get_user(uid: str):
    status, data = sb("GET", "/auth/v1/admin/users/" + uid)
    if status >= 400:
        return None
    return data


def sb_read_store(uid: str) -> dict:
    status, data = sb("GET", "/storage/v1/object/kitchen/" + uid + ".json")
    if status >= 400:
        return {}
    if isinstance(data, dict):
        return data
    return {}


def sb_write_store(uid: str, payload: dict) -> None:
    headers_ok = {
        "apikey": SUPABASE_SERVICE_ROLE,
        "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE,
        "Content-Type": "application/json",
        "x-upsert": "true",
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        SUPABASE_URL + "/storage/v1/object/kitchen/" + uid + ".json",
        data=body,
        headers=headers_ok,
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=25).read()
    except urllib.error.HTTPError:
        req = urllib.request.Request(
            SUPABASE_URL + "/storage/v1/object/kitchen/" + uid + ".json",
            data=body,
            headers=headers_ok,
            method="PUT",
        )
        urllib.request.urlopen(req, timeout=25).read()


# ---- sqlite fallback (local, no Supabase env) ----

def db():
    if DATABASE_URL.startswith("postgres"):
        import psycopg2
        url = DATABASE_URL
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://") :]
        conn = psycopg2.connect(url, sslmode="require")
        conn.autocommit = True
        return conn, "%s"
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn, "?"


def init_local_db() -> None:
    if USE_SUPABASE:
        return
    conn, p = db()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            plan TEXT NOT NULL DEFAULT 'free',
            store_json TEXT NOT NULL DEFAULT '{}',
            created_at REAL NOT NULL,
            recovery_hash TEXT
        )
        """
    )
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()


init_local_db()


def row_map(row):
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    if hasattr(row, "keys"):
        return {k: row[k] for k in row.keys()}
    keys = ["id", "email", "password_hash", "plan", "store_json", "recovery_hash"]
    return dict(zip(keys, row))


def require_user():
    uid = session.get("uid")
    if not uid:
        return None
    if USE_SUPABASE:
        user = sb_get_user(uid)
        if not user or user.get("id") != uid:
            return None
        return user
    conn, p = db()
    cur = conn.cursor()
    cur.execute("SELECT id, email, password_hash, plan, store_json, recovery_hash FROM users WHERE id = " + p, (uid,))
    row = row_map(cur.fetchone())
    cur.close()
    conn.close()
    return row


@app.get("/ping")
@app.get("/health")
def ping():
    return "DINNER WIZARD OK", 200, {"Content-Type": "text/plain; charset=utf-8"}


@app.post("/api/signup")
def signup():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Enter a real email address."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400
    recovery = new_recovery_code()
    if USE_SUPABASE:
        if sb_get_user_by_email(email):
            return jsonify({"error": "That email already has an account. Sign in."}), 409
        status, created = sb(
            "POST",
            "/auth/v1/admin/users",
            {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"plan": "free", "recovery_hash": hash_password(recovery)},
            },
        )
        if status >= 400:
            msg = (created or {}).get("msg") or (created or {}).get("error") or "Could not create account."
            return jsonify({"error": str(msg)}), 400
        uid = created.get("id")
        session.permanent = True
        session["uid"] = uid
        return jsonify({"user": sb_user_public(created), "store": {}, "recoveryCode": recovery})
    # local fallback omitted path uses sqlite
    conn, p = db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = " + p, (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "That email already has an account. Sign in."}), 409
    uid = str(uuid.uuid4())
    cur.execute(
        "INSERT INTO users (id, email, password_hash, plan, store_json, created_at, recovery_hash) VALUES ("
        + ",".join([p] * 7)
        + ")",
        (uid, email, hash_password(password), "free", "{}", time.time(), hash_password(recovery)),
    )
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()
    session.permanent = True
    session["uid"] = uid
    return jsonify({"user": {"id": uid, "email": email, "plan": "free", "hasRecovery": True}, "store": {}, "recoveryCode": recovery})


@app.post("/api/login")
def login():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")
    if USE_SUPABASE:
        status, data = sb(
            "POST",
            "/auth/v1/token?grant_type=password",
            {"email": email, "password": password},
        )
        if status >= 400:
            return jsonify({"error": "Email or password is wrong."}), 401
        user = data.get("user") or {}
        uid = user.get("id")
        session.permanent = True
        session["uid"] = uid
        return jsonify({"user": sb_user_public(user), "store": sb_read_store(uid)})
    conn, p = db()
    cur = conn.cursor()
    cur.execute("SELECT id, email, password_hash, plan, store_json, recovery_hash FROM users WHERE email = " + p, (email,))
    row = row_map(cur.fetchone())
    cur.close()
    conn.close()
    if not row or not check_password(password, row["password_hash"]):
        return jsonify({"error": "Email or password is wrong."}), 401
    session.permanent = True
    session["uid"] = row["id"]
    store = {}
    try:
        store = json.loads(row["store_json"] or "{}")
    except json.JSONDecodeError:
        store = {}
    return jsonify({"user": {"id": row["id"], "email": row["email"], "plan": row["plan"], "hasRecovery": bool(row.get("recovery_hash"))}, "store": store})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/me")
def me():
    user = require_user()
    if not user:
        return jsonify({"user": None}), 200
    if USE_SUPABASE:
        return jsonify({"user": sb_user_public(user), "store": sb_read_store(user["id"])})
    store = {}
    try:
        store = json.loads(user["store_json"] or "{}")
    except json.JSONDecodeError:
        store = {}
    return jsonify({"user": {"id": user["id"], "email": user["email"], "plan": user.get("plan") or "free", "hasRecovery": bool(user.get("recovery_hash"))}, "store": store})


@app.put("/api/me/store")
def save_store():
    user = require_user()
    if not user:
        return jsonify({"error": "Sign in first."}), 401
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"error": "Bad folder payload."}), 400
    if len(json.dumps(body)) > 750_000:
        return jsonify({"error": "Folder data is too large."}), 413
    if USE_SUPABASE:
        sb_write_store(user["id"], body)
        return jsonify({"ok": True, "plan": (user.get("user_metadata") or {}).get("plan") or "free"})
    conn, p = db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET store_json = " + p + " WHERE id = " + p, (json.dumps(body), user["id"]))
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "plan": user.get("plan")})


@app.post("/api/me/password")
def change_password():
    user = require_user()
    if not user:
        return jsonify({"error": "Sign in first."}), 401
    body = request.get_json(silent=True) or {}
    old = str(body.get("oldPassword") or "")
    new = str(body.get("newPassword") or "")
    if len(new) < 8:
        return jsonify({"error": "New password must be at least 8 characters."}), 400
    if USE_SUPABASE:
        status, data = sb("POST", "/auth/v1/token?grant_type=password", {"email": user.get("email"), "password": old})
        if status >= 400:
            return jsonify({"error": "Current password is wrong."}), 401
        st, upd = sb("PUT", "/auth/v1/admin/users/" + user["id"], {"password": new})
        if st >= 400:
            return jsonify({"error": (upd or {}).get("msg") or "Could not update password."}), 400
        return jsonify({"ok": True})
    if not check_password(old, user["password_hash"]):
        return jsonify({"error": "Current password is wrong."}), 401
    conn, p = db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET password_hash = " + p + " WHERE id = " + p, (hash_password(new), user["id"]))
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()
    return jsonify({"ok": True})


@app.post("/api/me/recovery")
def issue_recovery():
    user = require_user()
    if not user:
        return jsonify({"error": "Sign in first."}), 401
    recovery = new_recovery_code()
    hashed = hash_password(recovery)
    if USE_SUPABASE:
        meta = dict(user.get("user_metadata") or {})
        meta["recovery_hash"] = hashed
        sb("PUT", "/auth/v1/admin/users/" + user["id"], {"user_metadata": meta})
        return jsonify({"recoveryCode": recovery})
    conn, p = db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET recovery_hash = " + p + " WHERE id = " + p, (hashed, user["id"]))
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()
    return jsonify({"recoveryCode": recovery})


@app.post("/api/me/close")
def close_account():
    user = require_user()
    if not user:
        return jsonify({"error": "Sign in first."}), 401
    body = request.get_json(silent=True) or {}
    password = str(body.get("password") or "")
    confirm = str(body.get("confirm") or "").strip().upper()
    if confirm != "CLOSE":
        return jsonify({"error": "Type CLOSE to confirm."}), 400
    if USE_SUPABASE:
        status, data = sb("POST", "/auth/v1/token?grant_type=password", {"email": user.get("email"), "password": password})
        if status >= 400:
            return jsonify({"error": "Password is wrong."}), 401
        sb("DELETE", "/storage/v1/object/kitchen/" + user["id"] + ".json")
        sb("DELETE", "/auth/v1/admin/users/" + user["id"])
        session.clear()
        return jsonify({"ok": True})
    if not check_password(password, user["password_hash"]):
        return jsonify({"error": "Password is wrong."}), 401
    conn, p = db()
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE id = " + p, (user["id"],))
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()
    session.clear()
    return jsonify({"ok": True})


@app.post("/api/forgot")
def forgot():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email") or "").strip().lower()
    mailed = False
    if USE_SUPABASE and EMAIL_RE.match(email):
        status, data = sb(
            "POST",
            "/auth/v1/recover?redirect_to=" + urllib.parse.quote(APP_BASE.rstrip("/") + "/", safe=""),
            {"email": email},
        )
        mailed = status < 400
    return jsonify(
        {
            "ok": True,
            "mailed": mailed,
            "message": (
                "If that email has an account, check it for a Dinner Wizard reset link."
                if mailed
                else "Use your recovery code (DW-XXXX-XXXX) with a new password if you saved one."
            ),
        }
    )


@app.post("/api/reset")
def reset_password():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email") or "").strip().lower()
    new = str(body.get("newPassword") or "")
    recovery = str(body.get("recoveryCode") or "").strip().upper()
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Enter the account email."}), 400
    if len(new) < 8:
        return jsonify({"error": "New password must be at least 8 characters."}), 400
    if USE_SUPABASE:
        user = sb_get_user_by_email(email)
        if not user:
            return jsonify({"error": "Could not reset that account."}), 400
        meta = user.get("user_metadata") or {}
        if not check_password(recovery, meta.get("recovery_hash") or ""):
            return jsonify({"error": "Recovery code is wrong."}), 400
        st, upd = sb("PUT", "/auth/v1/admin/users/" + user["id"], {"password": new})
        if st >= 400:
            return jsonify({"error": (upd or {}).get("msg") or "Could not reset."}), 400
        return jsonify({"ok": True})
    return jsonify({"error": "Could not reset that account."}), 400


@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def static_files(path: str):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    target = (ROOT / path).resolve()
    if ROOT not in target.parents and target != ROOT:
        return "Not found", 404
    if target.suffix.lower() in {".db", ".key", ".pyc"}:
        return "Not found", 404
    if target.is_file():
        return send_from_directory(target.parent, target.name)
    index = ROOT / "index.html"
    return send_from_directory(index.parent, index.name)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8765"))
    print("DINNER WIZARD app server on", port, "supabase=" + str(USE_SUPABASE), flush=True)
    app.run(host="0.0.0.0", port=port, debug=False)
