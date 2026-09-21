"""Dinner Wizard app server: accounts, synced folders, static files.
Does not touch Line & Dock.
"""
from __future__ import annotations

import json
import os
import re
import secrets
import sqlite3
import hashlib
import hmac
import time
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, session

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("DATA_DIR") or (ROOT / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
SQLITE_PATH = DATA_DIR / "users.db"
DATABASE_URL = os.environ.get("DATABASE_URL") or ""

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
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
        conn.close()
    else:
        cur.close()
        conn.close()


init_db()


def fetch_user_by_email(email: str):
    conn, p = db()
    cur = conn.cursor()
    cur.execute("SELECT id, email, password_hash, plan, store_json FROM users WHERE email = " + p, (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row


def fetch_user_by_id(uid: str):
    conn, p = db()
    cur = conn.cursor()
    cur.execute("SELECT id, email, password_hash, plan, store_json FROM users WHERE id = " + p, (uid,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row


def row_map(row):
    if row is None:
        return None
    if isinstance(row, dict):
        return row
    keys = ["id", "email", "password_hash", "plan", "store_json"]
    if hasattr(row, "keys"):
        return {k: row[k] for k in row.keys()}
    return dict(zip(keys, row))


def public_user(row) -> dict:
    r = row_map(row)
    return {"id": r["id"], "email": r["email"], "plan": r["plan"] or "free"}


def require_user():
    uid = session.get("uid")
    if not uid:
        return None
    return row_map(fetch_user_by_id(uid))


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
    conn, p = db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (id, email, password_hash, plan, store_json, created_at) VALUES ("
        + ",".join([p] * 6)
        + ")",
        (uid, email, hash_password(password), "free", "{}", time.time()),
    )
    if not DATABASE_URL.startswith("postgres"):
        conn.commit()
    cur.close()
    conn.close()
    session.permanent = True
    session["uid"] = uid
    return jsonify({"user": {"id": uid, "email": email, "plan": "free"}, "store": {}})


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


SKIP_PREFIX = ("/api/", "/ping", "/health")


@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def static_files(path: str):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    target = (ROOT / path).resolve()
    if ROOT not in target.parents and target != ROOT:
        return "Not found", 404
    if target.suffix.lower() in {'.db', '.key', '.pyc'}:
        return "Not found", 404
    if target.is_file():
        return send_from_directory(target.parent, target.name)
    index = ROOT / "index.html"
    return send_from_directory(index.parent, index.name)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8765"))
    print("DINNER WIZARD app server on", port, flush=True)
    app.run(host="0.0.0.0", port=port, debug=False)
