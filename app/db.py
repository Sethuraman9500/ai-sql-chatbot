import os
import asyncpg
from typing import Any
from app.schema_cache import get_cached_schema, set_cached_schema

_pool: asyncpg.Pool | None = None

async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        # Support both DATABASE_URL (Render) and individual vars (local)
        database_url = os.getenv("DATABASE_URL")
        
        if database_url:
            # Render style (URL format)
            # Handle supabase postgres URL properly
            conn_str = database_url.replace("postgres://", "postgresql://")
            _pool = await asyncpg.create_pool(conn_str, min_size=1, max_size=5)
        else:
            # Local dev style
            _pool = await asyncpg.create_pool(
                host=os.getenv("DB_HOST", "localhost"),
                port=int(os.getenv("DB_PORT", 5432)),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                min_size=1,
                max_size=5,
            )
    return _pool

async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None

async def fetch_schema() -> str:
    cached = get_cached_schema()
    if cached:
        return cached

    pool = await get_pool()
    query = """
        SELECT
            c.table_name,
            c.column_name,
            c.data_type,
            tc.constraint_type
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu
            ON c.table_name = kcu.table_name
            AND c.column_name = kcu.column_name
            AND c.table_schema = kcu.table_schema
        LEFT JOIN information_schema.table_constraints tc
            ON kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema = tc.table_schema
        WHERE c.table_schema = 'public'
        ORDER BY c.table_name, c.ordinal_position
    """
    rows = await pool.fetch(query)
    
    tables: dict[str, list[str]] = {}
    for row in rows:
        tname = row["table_name"]
        col = row["column_name"]
        dtype = row["data_type"]
        pk_flag = " PK" if row["constraint_type"] == "PRIMARY KEY" else ""
        tables.setdefault(tname, []).append(f"{col} {dtype}{pk_flag}")

    lines = [f"table: {t} ({', '.join(cols)})" for t, cols in tables.items()]
    schema_str = "\n".join(lines)
    set_cached_schema(schema_str)
    return schema_str

async def run_query(sql: str) -> list[dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql)
        return [dict(r) for r in rows]