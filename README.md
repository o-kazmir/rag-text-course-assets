# RAG from Scratch in TypeScript: code examples

Complete, runnable code for the [«RAG з нуля на TypeScript»](https://devs-hive.tech/courses/rag-basics) course on Devs Hive. The code matches the lessons exactly, so you can compare your own work or run the finished version.

## What's where

| Folder | Lessons | What it is |
|--------|---------|------------|
| [`01-cli/`](01-cli) | 4–7, 9 | Plain Node.js scripts, no web framework: RAG by hand on the OpenAI SDK, then LangChain.js, chunking, pgvector, a CLI assistant and a hit rate@k check |
| [`02-express/`](02-express) | 8 | Web chat on Express with streaming (SSE) and conversation history |
| [`03-nestjs/`](03-nestjs) | 10 | The same chat as a Nest.js service: providers, config, DTO validation, rate limiting |
| [`docker-compose.yml`](docker-compose.yml) | 6 | PostgreSQL with pgvector, shared by all examples |

Inside the examples:

- `docs/` - the knowledge base of the fictional company «Твоя Галера» (8 Markdown files)
- `golden.json` - test questions for the quality check (`01-cli`)
- `src/load.ts`, `src/store.ts`, `src/rag.ts` - loading and chunking, the pgvector store, the prompt and chain
- `src/index-docs.ts` - indexes `docs/` into the `chunks` table
- `public/index.html` - the chat page (`02-express`, `03-nestjs`)

## Requirements

- Node.js 22+
- Docker
- An OpenAI API key

## Quick start

```bash
docker compose up -d              # pgvector on localhost:5433

cd 01-cli
cp .env.example .env              # add your OPENAI_API_KEY
npm install
npm run index                     # fill the vector store
npm run ask -- "Коли можна викочувати нову версію?"
```

All examples use the same database, so index once and every example can search it.

### 01-cli

| Command | Lesson | Script |
|---------|--------|--------|
| `npm run ask-llm` | 4 | Ask the model without RAG |
| `npm run embeddings` | 4 | First embeddings and cosine similarity |
| `npm run rag-by-hand -- "question"` | 4 | The whole RAG in one file, no framework |
| `npm run chunks` | 5 | Split documents into chunks (no API key needed) |
| `npm run memory-store` | 6 | Search with an in-memory vector store |
| `npm run index` | 6 | Index `docs/` into pgvector (safe to re-run) |
| `npm run ask -- "question"` | 7 | CLI assistant with sources |
| `npm run eval` | 9 | hit rate@k on `golden.json` and "I don't know" checks |

### 02-express

```bash
cd 02-express
cp .env.example .env
npm install
npm run index                     # skip if already indexed from 01-cli
npm start                         # http://localhost:3000
```

### 03-nestjs

```bash
cd 03-nestjs
cp .env.example .env
npm install
npm run start:dev                 # http://localhost:3000
```

The Nest.js app only reads from the `chunks` table, so index the documents with `01-cli` or `02-express` first. Stop the Express server before starting it: both listen on port 3000 (set `PORT` in `.env` to change it for Nest.js).

## Notes

- `01-cli/.npmrc` sets `legacy-peer-deps=true`: some optional integrations of `@langchain/community` ask for an older `openai` package, which the course doesn't use.
- Ports `5433` (database) and `3000` (chat) must be free. If they are taken, change them in `docker-compose.yml` and `DATABASE_URL`, or stop the other service.
