"""Dinner Wizard app server: accounts, synced folders, static files.
Does not touch Line & Dock.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import smtplib
import sqlite3
import time
import uuid
from email.message import EmailMessage
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, session

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("DATA_DIR") or (ROOT / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
SQLITE_PATH = DATA_DIR / "users.db"
DATABASE_URL = os.environ.get("DATABASE_URL") or ""
APP_BASE = os.environ.get("APP_BASE") or "https://dinner-wizard-app.onrender.com"

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ITERATIONS = 210_000


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


def init_db() -> None:
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
            created_at REAL NOT NULL
        )
        """
    )
    if DATABASE_URL.startswith("postgres"):
        cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_hash TEXT")
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS password_resets (
                email TEXT NOT NULL,
                token_hash TEXT NOT NULL,
                expires_at DOUBLE PRECISION NOT NULL
            )
            """
        )
    else:
        cols = [row[1] for row in cur.execute("PRAGMA table_info(users)").fetchall()]
        if "recovery_hash" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN recovery_hash TEXT")
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS password_resets (
                email TEXT NOT NULL,
                token_hash TEXT NOT NULL,
                expires_at REAL NOT NULL
            )
            """
        )
        conn.commit()
    cur.close()
    conn.close()


init_db()


def fetch_user_by_email(email: str):
    conn, p = db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, password_hash, plan, store_json, recovery_hash FROM users WHERE email = " + p,
        (email,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row


def fetch_user_by_id(uid: str):
    conn, p = db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email, password_hash, plan, store_json, recovery_hash FROM users WHERE id = " + p,
        (uid,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row


def row_map(row):
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    if hasattr(row, "keys"):
        return {k: row[k] for k in row.keys()}
    keys = ["id", "email", "password_hash", "plan", "store_json", "recovery_hash"]
    return dict(zip(keys, row))


def public_user(row) -> dict:
    r = row_map(row)
    return {
        "id": r["id"],
        "email": r["email"],
        "plan": r["plan"] or "free",
        "hasRecovery": bool(r.get("recovery_hash")),
    }


def require_user():
    uid = session.get("uid")
    if not uid:
        return None
    return row_map(fetch_user_by_id(uid))


def new_recovery_code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    raw = "".join(secrets.choice(alphabet) for _ in range(8))
    return "DW-" + raw[:4] + "-" + raw[4:]


def send_reset_email(to_email: str, token: str) -> bool:
    host = os.environ.get("SMTP_HOST") or ""
    user = os.environ.get("SMTP_USER") or ""
    password = os.environ.get("SMTP_PASSWORD") or ""
    if not host or not user or not password:
        print("SMTP not configured; skip reset email", flush=True)
        return False
    port = int(os.environ.get("SMTP_PORT") or "587")
    sender = os.environ.get("SMTP_FROM") or user
    link = APP_BASE.rstrip("/") + "/?email=" + to_email + "&reset_token=" + token
    msg = EmailMessage()
    msg["Subject"] = "DINNER WIZARD password reset"
    msg["From"] = sender
    msg["To"] = to_email
    msg.set_content(
        "Reset your Dinner Wizard password:\n\n"
        + link
        + "\n\nThis link expires in 1 hour. If you did not ask, ignore this.\n"
    )
    try:
        with smtplib.SMTP(host, port, timeout=20) as smtp:
            smtp.starttls()
            smtp.login(user, password)
            smtp.send_message(msg)
        return True
    except Exception as exc:
        print("SMTP send failed:", type(exc).__name__, flush=True)
        return False


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
    if fetch_user_by_email(email):
        return jsonify({"error": "That email already has an account. Sign in."}), 409
    uid = str(uuid.uuid4())
    recovery = new_recovery_code()
    conn, p = db()
    cur = conn.cursor()
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
    return jsonify(
        {
            "user": {"id": uid, "email": email, "plan": "free", "hasRecovery": True},
            "store": {},
            "recoveryCode": recovery,
        }
    )


@app.post("/api/login")
def login():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email") or "").strip().lower()
    password = str(body.get("password") or "")
    row = row_map(fetch_user_by_email(email))
    if not row or not check_password(password, row["password_hash"]):
        return jsonify({"error": "Email or password is wrong."}), 401
    session.permanent = True
    session["uid"] = row["id"]
    store = {}
    try:
        store = json.loads(row["store_json"] or "{}")
    except json.JSONDecodeError:
        store = {}
    return jsonify({"user": public_user(row), "store": store})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/me")
def me():
    user = require_user()
    if not user:
        return jsonify({"user": None}), 200
    store = {}
    try:
        store = json.loads(user["store_json"] or "{}")
    except json.JSONDecodeError:
        store = {}
    return jsonify({"user": public_user(user), "store": store})


@app.put("/api/me/store")
def save_store():
    user = require_user()
    if not user:
        return jsonify({"error": "Sign in first."}), 401
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"error": "Bad folder payload."}), 400
    payload = json.dumps(body)
    if len(payload) > 750_000:
        return jsonify({"error": "Folder data is too large."}), 413
    conn, p = db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET store_json = " + p + " WHERE id = " + p, (payload, user["id"]))
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "plan": user["plan"]})


@app.post("/api/me/password")
def change_password():
    user = require_user()
    if not user:
        return jsonify({"error": "Sign in first."}), 401
    body = request.get_json(silent=True) or {}
    old = str(body.get("oldPassword") or "")
    new = str(body.get("newPassword") or "")
    if not check_password(old, user["password_hash"]):
        return jsonify({"error": "Current password is wrong."}), 401
    if len(new) < 8:
        return jsonify({"error": "New password must be at least 8 characters."}), 400
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
    conn, p = db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET recovery_hash = " + p + " WHERE id = " + p, (hash_password(recovery), user["id"]))
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
        return jsonify({"error": 'Type CLOSE to confirm.'}), 400
    if not check_password(password, user["password_hash"]):
        return jsonify({"error": "Password is wrong."}), 401
    conn, p = db()
    cur = conn.cursor()
    cur.execute("DELETE FROM password_resets WHERE email = " + p, (user["email"],))
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
    if EMAIL_RE.match(email):
        row = row_map(fetch_user_by_email(email))
        if row:
            token = secrets.token_urlsafe(24)
            conn, p = db()
            cur = conn.cursor()
            cur.execute("DELETE FROM password_resets WHERE email = " + p, (email,))
            cur.execute(
                "INSERT INTO password_resets (email, token_hash, expires_at) VALUES (" + ",".join([p] * 3) + ")",
                (email, hash_password(token), time.time() + 3600),
            )
            if not DATABASE_URL.startswith("postgres"):
                conn.commit()
            cur.close()
            conn.close()
            mailed = send_reset_email(email, token)
    return jsonify(
        {
            "ok": True,
            "mailed": mailed,
            "message": (
                "If that email has an account, we sent a reset link."
                if mailed
                else "If email sending is off, use your recovery code (DW-XXXX-XXXX) with a new password below."
            ),
        }
    )


@app.post("/api/reset")
def reset_password():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email") or "").strip().lower()
    new = str(body.get("newPassword") or "")
    token = str(body.get("token") or "").strip()
    recovery = str(body.get("recoveryCode") or "").strip().upper()
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Enter the account email."}), 400
    if len(new) < 8:
        return jsonify({"error": "New password must be at least 8 characters."}), 400
    row = row_map(fetch_user_by_email(email))
    if not row:
        return jsonify({"error": "Could not reset that account."}), 400
    ok = False
    if recovery:
        ok = check_password(recovery, row.get("recovery_hash") or "")
    if token and not ok:
        conn, p = db()
        cur = conn.cursor()
        cur.execute(
            "SELECT token_hash, expires_at FROM password_resets WHERE email = " + p + " ORDER BY expires_at DESC",
            (email,),
        )
        resets = cur.fetchall()
        now = time.time()
        for item in resets:
            mapped = row_map(item) if not isinstance(item, (list, tuple)) else None
            if mapped:
                th, exp = mapped.get("token_hash"), mapped.get("expires_at")
            else:
                th, exp = item[0], item[1]
            if exp and float(exp) >= now and check_password(token, th):
                ok = True
                break
        if ok:
            cur.execute("DELETE FROM password_resets WHERE email = " + p, (email,))
        if not DATABASE_URL.startswith("postgres"):
            conn.commit()
        cur.close()
        conn.close()
    if not ok:
        return jsonify({"error": "Recovery code or reset link is wrong or expired."}), 400
    conn, p = db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET password_hash = " + p + " WHERE id = " + p, (hash_password(new), row["id"]))
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()
    return jsonify({"ok": True})


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
    print("DINNER WIZARD app server on", port, flush=True)
    app.run(host="0.0.0.0", port=port, debug=False)
