import time
from typing import Optional

_cache: dict = {}
TTL_SECONDS = 300

def get_cached_schema() -> Optional[str]:
    entry = _cache.get("schema")
    if entry and (time.time() - entry["ts"]) < TTL_SECONDS:
        return entry["value"]
    return None

def set_cached_schema(schema_str: str) -> None:
    _cache["schema"] = {"value": schema_str, "ts": time.time()}