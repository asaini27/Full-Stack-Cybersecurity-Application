import csv
from datetime import datetime
from typing import Dict, Any, Iterable

# Adjust field names to match your export (example below).
# Example headers: time,src_ip,user,url,action,status,bytes

def parse_lines(fh) -> Iterable[Dict[str, Any]]:
    reader = csv.DictReader(fh)
    for row in reader:
        ts_raw = row.get("time") or row.get("timestamp")
        if not ts_raw:
            continue
        try:
            ts = ts_raw
            # Normalize timezone like 2024-06-01T12:00:05-07:00 -> -0700
            if len(ts) >= 6 and ts[-3] == ":":
                ts = ts[:-3] + ts[-2:]
            dt = datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S%z")
        except Exception:
            continue
        try:
            status = int(row.get("status", "0"))
        except:
            status = 0
        try:
            size = int(row.get("bytes", "0"))
        except:
            size = 0

        yield {
            "ip": row.get("src_ip", ""),
            "timestamp": dt.isoformat(),
            "method": row.get("action", "GET"),
            "path": row.get("url", ""),
            "status": status,
            "bytes": size,
            "ua": "",
            "ref": "",
        }

