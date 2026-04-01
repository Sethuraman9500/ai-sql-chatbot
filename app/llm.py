import os
import json
import httpx
from typing import Any

# Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")  # "ollama" or "openrouter"
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")

SQL_SYSTEM_PROMPT = """You are a PostgreSQL expert. Generate a single SELECT query.
Rules:
- Output ONLY raw SQL, no markdown, no backticks, no explanation
- Use only SELECT statements
- If cannot answer with schema, output exactly: CANNOT_ANSWER
- Limit to 100 rows unless asked for more
- Use exact table/column names from schema
- Join tables correctly using foreign keys"""

ANSWER_SYSTEM_PROMPT = """You are a helpful music store analyst. Explain query results in plain English.
- Be concise (1-3 sentences)
- Format numbers nicely (1,234 not 1234)
- If empty results, say so clearly"""

async def generate_sql(schema: str, question: str) -> str:
    prompt = f"""Schema:
{schema}

Question: {question}

SQL:"""
    return await _chat(SQL_SYSTEM_PROMPT, prompt)

async def fix_sql(schema: str, question: str, broken_sql: str, error: str) -> str:
    prompt = f"""Schema: {schema}
Question: {question}
Broken SQL: {broken_sql}
Error: {error}

Fixed SQL:"""
    return await _chat(SQL_SYSTEM_PROMPT, prompt)

async def generate_answer(question: str, sql: str, results: list[dict[str, Any]]) -> str:
    results_str = json.dumps(results[:20], indent=2, default=str)
    prompt = f"""Question: {question}
SQL: {sql}
Results ({len(results)} rows): {results_str}

Answer:"""
    return await _chat(ANSWER_SYSTEM_PROMPT, prompt)

async def _chat(system: str, user: str) -> str:
    if LLM_PROVIDER == "openrouter":
        return await _openrouter_chat(system, user)
    else:
        return await _ollama_chat(system, user)

async def _ollama_chat(system: str, user: str) -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
        resp.raise_for_status()
        return resp.json()["message"]["content"].strip()

async def _openrouter_chat(system: str, user: str) -> str:
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not set")
    
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://db-chatbot.onrender.com",
                "X-Title": "DB Chatbot"
            },
            json=payload
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()