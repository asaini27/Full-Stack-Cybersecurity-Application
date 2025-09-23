import re
from datetime import datetime
from typing import Dict, Any

# Combined Log Format:
# 127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326 "ref" "ua"

LOG_PATTERN = re.compile(
    r'^(?P<ip>\S+)\s\S+\s\S+\s\[(?P<ts>[^\]]+)\]\s"(?P<method>\S+)\s(?P<path>\S+)\s(?P<proto>\S+)"\s(?P<status>\d{3})\s(?P<size>\S+)(?:\s"(?P<ref>.*?)"\s"(?P<ua>.*?)")?'
)

TS_FORMAT = "%d/%b/%Y:%H:%M:%S %z"

def parse_line(line: str) -> Dict[str, Any] | None:
    m = LOG_PATTERN.match(line.strip())
    if not m:
        return None
    d = m.groupdict()
    try:
        ts = datetime.strptime(d["ts"], TS_FORMAT)
    except Exception:
        return None
    size = int(d["size"]) if d["size"].isdigit() else 0
    return {
        "ip": d["ip"],
        "timestamp": ts.isoformat(),
        "method": d["method"],
        "path": d["path"],
        "status": int(d["status"]),
        "bytes": size,
        "ua": d.get("ua") or "",
        "ref": d.get("ref") or "",
    }
