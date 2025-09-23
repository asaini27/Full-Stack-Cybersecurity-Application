import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("APP_USERNAME", "admin")
PASSWORD = os.getenv("APP_PASSWORD", "password")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
LOG_FORMAT = os.getenv("LOG_FORMAT", "combined")  # combined | zscaler
BURST_THRESHOLD = int(os.getenv("BURST_THRESHOLD", "100"))
RARE_MIN_SUPPORT = int(os.getenv("RARE_MIN_SUPPORT", "2"))

os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Dev-friendly

# Local helpers
def check_basic_auth(req) -> bool:
    # DEV-ONLY: expects "Authorization: Basic username:password"
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Basic "):
        return False
    try:
        token = auth.split(" ", 1)[1]
        user, pw = token.split(":", 1)
        return user == USERNAME and pw == PASSWORD
    except Exception:
        return False

from anomalies import detect_anomalies, build_timeline

@app.route("/api/ping")
def ping():
    return {"ok": True}

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    if data.get("username") == USERNAME and data.get("password") == PASSWORD:
        return jsonify({"ok": True})
    return jsonify({"ok": False}), 401

@app.route("/api/upload", methods=["POST"])
def upload():
    if not check_basic_auth(request):
        return jsonify({"error": "unauthorized"}), 401
    if "file" not in request.files:
        return jsonify({"error": "no file"}), 400
    f = request.files["file"]
    path = os.path.join(UPLOAD_DIR, f.filename)
    f.save(path)

    # Parse rows
    rows = []
    with open(path, "r", encoding="utf-8", errors="ignore") as fh:
        if LOG_FORMAT == "zscaler":
            from parser_zscaler import parse_lines as zparse
            for rec in zparse(fh):
                rows.append(rec)
        else:
            from parser import parse_line
            for line in fh:
                rec = parse_line(line)
                if rec:
                    rows.append(rec)

    # Analysis
    timeline = build_timeline(rows)
    anomalies = detect_anomalies(rows, burst_threshold=BURST_THRESHOLD, rare_min_support=RARE_MIN_SUPPORT)

    # Summary
    summary = {
        "total": len(rows),
        "unique_ips": len({r["ip"] for r in rows}),
        "error_rate": round(sum(1 for r in rows if 500 <= r["status"] <= 599) / max(1, len(rows)), 4),
        "top_paths": _top_n(rows, "path"),
        "top_ips": _top_n(rows, "ip"),
        "status_hist": _hist(rows, "status"),
    }

    return jsonify({
        "ok": True,
        "summary": summary,
        "timeline": timeline,
        "anomalies": anomalies,
        "preview": rows[:50],
    })

def _top_n(rows, key, k=5):
    from collections import Counter
    return Counter([r[key] for r in rows]).most_common(k)

def _hist(rows, key):
    from collections import Counter
    c = Counter([r[key] for r in rows])
    return {str(k): v for k, v in c.items()}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
