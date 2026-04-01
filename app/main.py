import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from app.db import get_pool, close_pool, fetch_schema, run_query
from app.llm import generate_sql, fix_sql, generate_answer
from app.sql_guard import validate_sql, UnsafeSQLError

MAX_RETRIES = 2

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()
    yield
    await close_pool()

app = FastAPI(title="Chinook Chatbot API", lifespan=lifespan)

# CORS - permissive for demo
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="widget"), name="static")

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sql: str | None = None
    row_count: int | None = None
    error: str | None = None

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "provider": os.getenv("LLM_PROVIDER", "ollama"),
        "model": os.getenv("OPENROUTER_MODEL") or os.getenv("OLLAMA_MODEL")
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.question.strip():
        raise HTTPException(400, "Question required")

    try:
        schema = await fetch_schema()
    except Exception as e:
        raise HTTPException(500, f"DB error: {e}")

    try:
        sql = await generate_sql(schema, req.question)
    except Exception as e:
        raise HTTPException(502, f"LLM error: {e}")

    if sql.upper() == "CANNOT_ANSWER":
        return ChatResponse(answer="I don't have the data to answer that.")

    results = []
    last_error = None
    final_sql = sql

    for attempt in range(MAX_RETRIES + 1):
        try:
            final_sql = validate_sql(final_sql)
            results = await run_query(final_sql)
            last_error = None
            break
        except UnsafeSQLError as e:
            return ChatResponse(answer="Query blocked for security.", error=str(e))
        except Exception as e:
            last_error = str(e)
            if attempt < MAX_RETRIES:
                try:
                    final_sql = await fix_sql(schema, req.question, final_sql, last_error)
                except:
                    break
            else:
                break

    if last_error:
        return ChatResponse(
            answer="Database error. Try rephrasing.", 
            error=last_error
        )

    try:
        answer = await generate_answer(req.question, final_sql, results)
    except Exception as e:
        answer = f"Found {len(results)} results."

    return ChatResponse(
        answer=answer,
        sql=final_sql,
        row_count=len(results)
    )

@app.get("/", response_class=HTMLResponse)
async def demo_page():
    with open("widget/demo.html") as f:
        return f.read()