from collections import defaultdict, deque, Counter
from datetime import datetime, timedelta
from typing import List, Dict, Any

def _parse_ts(ts: str) -> datetime:
    # Accept ISO with timezone "YYYY-MM-DDTHH:MM:SS+HH:MM" or "+HHMM"
    if len(ts) >= 6 and ts[-3] == ":":
        ts = ts[:-3] + ts[-2:]
    return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S%z")

def detect_anomalies(rows: List[Dict[str, Any]], burst_threshold=100, rare_min_support=2):
    anomalies = []

    # Global stats
    path_count = Counter()
    ip_errors = Counter()
    total_errors = 0

    for r in rows:
        path_count[r["path"]] += 1
        if 500 <= r["status"] <= 599:
            ip_errors[r["ip"]] += 1
            total_errors += 1

    total = max(1, len(rows))
    err_rate = total_errors / total

    # 1) Burst detection per IP over 60s sliding window
    by_ip_window: Dict[str, deque] = defaultdict(deque)
    for r in rows:
        ts = _parse_ts(r["timestamp"])
        dq = by_ip_window[r["ip"]]
        dq.append(ts)
        while dq and (ts - dq[0]) > timedelta(seconds=60):
            dq.popleft()
        count = len(dq)
        if count > burst_threshold:
            confidence = min(0.99, 0.5 + (count - burst_threshold) / (burst_threshold * 2))
            anomalies.append({
                "type": "BURST_IP",
                "ip": r["ip"],
                "timestamp": r["timestamp"],
                "explanation": f"{count} requests from {r['ip']} within 60s window",
                "confidence": round(confidence, 2),
                "row": r,
            })

    # 2) Rare paths
    for r in rows:
        cnt = path_count[r["path"]]
        if cnt <= rare_min_support:
            confidence = 0.5 if cnt == rare_min_support else 0.8  # 1 time -> higher
            anomalies.append({
                "type": "RARE_PATH",
                "timestamp": r["timestamp"],
                "path": r["path"],
                "explanation": f"Path '{r['path']}' seen {cnt} time(s)",
                "confidence": confidence,
                "row": r,
            })

    # 3) Error spikes
    if err_rate > 0.10:  # global > 10%
        anomalies.append({
            "type": "GLOBAL_ERROR_SPIKE",
            "explanation": f"Global 5xx rate {err_rate:.1%} (>10%)",
            "confidence": min(0.99, 0.6 + err_rate),
        })
    for ip, ecount in ip_errors.items():
        if ecount >= 5 and err_rate > 0.05:
            anomalies.append({
                "type": "IP_ERROR_SPIKE",
                "ip": ip,
                "explanation": f"{ecount} server errors from {ip}",
                "confidence": min(0.95, 0.5 + ecount / 20),
            })

    return anomalies

def build_timeline(rows: List[Dict[str, Any]]):
    buckets = defaultdict(list)
    for r in rows:
        t = _parse_ts(r["timestamp"]).replace(second=0)
        buckets[t].append(r)
    out = []
    for t in sorted(buckets.keys()):
        group = buckets[t]
        out.append({
            "minute": t.isoformat(),
            "count": len(group),
            "top_ips": _topk([g["ip"] for g in group]),
            "top_paths": _topk([g["path"] for g in group]),
            "errors": sum(1 for g in group if 500 <= g["status"] <= 599),
        })
    return out

def _topk(items, k=3):
    return Counter(items).most_common(k)

