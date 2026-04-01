# 🎵 AI SQL Chatbot (Chinook Database)

An AI-powered chatbot that converts natural language into SQL queries and returns insights from a PostgreSQL database. Built with FastAPI, a local LLM (Ollama), and a secure SQL execution layer.

---

## 🚀 Overview

This project allows users to ask questions like:

* *"How many artists are there?"*
* *"Top 5 best-selling tracks"*
* *"Revenue by genre"*

…and get answers powered by real SQL queries executed on the Chinook music database.

---

## 🏗️ Architecture

![Architecture](./docs/local_llm_chatbot_architecture.jpg)

### 🔄 Request Flow

```
Browser → FastAPI → LLM (SQL generation) → SQL Guard → PostgreSQL → Response
```

---

## 🧩 Components

### 🌐 Frontend

* Embedded chatbot widget (`widget/chatbot.js`)
* Runs in browser (localhost or deployed)
* Sends user queries to backend API

---

### ⚙️ Backend (FastAPI)

* Entry point: `app/main.py`
* Handles `/chat` endpoint
* Coordinates:

  * SQL generation
  * Validation
  * Execution
  * Response formatting

---

### 🧠 LLM Layer (Ollama)

* Model: `llama3.1:8b`
* Runs locally on port `11434`
* Generates SQL queries from natural language

---

### 🛡️ SQL Guard

* Ensures only **safe SELECT queries**
* Blocks:

  * INSERT, UPDATE, DELETE
  * DROP, ALTER, etc.
* Prevents malicious or accidental data modification

---

### 🗄️ Database (PostgreSQL)

* Runs via Docker (port `5432`)
* Contains **Chinook sample dataset**

  * ~11 tables
  * ~3,500+ tracks
  * artists, albums, invoices, customers, etc.

---

### ⚡ Schema Cache

* In-memory cache (TTL: 5 minutes)
* Stores database schema
* Reduces repeated DB introspection calls

---

## ✨ Features

* 🔍 Natural language → SQL conversion
* 🛡️ Safe query validation (SELECT-only)
* 🔁 Auto-retry with SQL fixing
* ⚡ Schema caching for performance
* 🐳 Dockerized PostgreSQL
* 🤖 Local LLM (no cloud dependency)
* 🌐 Optional cloud deployment (Render + OpenRouter)

---

## 🛠️ Tech Stack

* **Backend:** FastAPI, Python
* **Database:** PostgreSQL (Chinook dataset)
* **LLM:** Ollama (Llama 3.1 8B)
* **Frontend:** Vanilla JS widget
* **Infra:** Docker, Render (optional)

---

## ▶️ Getting Started

### 1. Clone repo

```bash
git clone https://github.com/YOUR_USERNAME/db-chatbot.git
cd db-chatbot
```

---

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Start PostgreSQL (Docker)

```bash
docker run -d --name chinook-db -p 5432:5432 \
-e POSTGRES_USER=postgres \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_DB=chinook \
postgres:15
```

Load Chinook data (if not preloaded):

```bash
curl -o Chinook.sql https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_PostgreSql.sql

docker cp Chinook.sql chinook-db:/Chinook.sql
docker exec -it chinook-db psql -U postgres -d chinook -f /Chinook.sql
```

---

### 4. Start Ollama

```bash
ollama run llama3.1:8b
```

---

### 5. Configure environment

Create `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chinook
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
LLM_PROVIDER=ollama
CORS_ORIGINS=*
```

---

### 6. Run API

```bash
uvicorn app.main:app --reload
```

---

### 7. Open app

```
http://localhost:8000
```

---

## ☁️ Deployment (Optional)

You can deploy this using:

* Render (FastAPI backend)
* Supabase (PostgreSQL)
* OpenRouter (LLM instead of Ollama)

---

## 📌 Example Queries

* How many artists are there?
* Top 10 selling tracks
* Revenue by country
* Albums by AC/DC

---

## ⚠️ Limitations

* LLM may generate incorrect SQL occasionally
* Free-tier LLMs may have rate limits
* No authentication (demo project)

---

## 📈 Future Improvements

* Add user authentication
* Query history & analytics
* Streaming responses
* Better UI (React/Next.js)
* Multi-database support

---

## 👨‍💻 Author

Built as a full-stack AI project demonstrating:

* LLM integration
* SQL generation
* Backend architecture
* Cloud deployment readiness

---

Give it a star ⭐ and feel free to fork!
