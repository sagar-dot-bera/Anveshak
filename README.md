# 🔭 Anveshak

> **Transform academic overload into actionable clarity.**
> Anveshak (*Sanskrit for "Investigator / Researcher"*) is a research assistant for anyone drowning in academic papers.

---

## 🌱 What is Anveshak, really?

If you've ever had to read through a stack of research papers for a project, a thesis, or just to understand a new topic, you know the pain: papers are long, dense, and full of jargon, and it's hard to keep track of what each one actually says once you've read a dozen of them.

Anveshak is like having a very well-read research assistant sitting next to you. You hand it your papers, and it helps you make sense of them:

- **You can talk to a paper.** Instead of scrolling through 20 pages looking for one detail, you just ask a question — "What method did they use?" or "What were the limitations?" — and it answers based on that specific paper, pointing you to exactly where it found the answer.
- **You can search by meaning, not just keywords.** You describe what you're looking for in your own words, and it finds relevant papers even if they don't use the exact words you typed.
- **It can summarize a paper for you.** It breaks a paper down into the parts people actually care about: what the researchers were trying to do, how they did it, what they found, and what the paper doesn't cover.
- **It can compare papers side by side.** If you're trying to decide between a few approaches or datasets, it lays out the differences for you instead of you having to cross-reference everything by hand.
- **It can write a literature review draft.** Give it a set of papers on a topic and it pulls together a combined summary of what the field says, including where research is still thin.
- **It can build you a study roadmap.** Tell it a topic you want to learn, and it suggests an order to read papers in, so you're not lost trying to figure out where to start.
- **It keeps your papers organized.** You can save papers into folders/collections and get properly formatted citations for them automatically.
- **It can pull in fresh papers on its own.** It's able to fetch newly published, freely available papers so your library doesn't go stale.

In short: Anveshak takes the "I have 40 tabs open and no idea what I've read" problem and turns it into something you can actually navigate and reason about.

Everything below this point is technical documentation for developers working on the project.

---

### 🛠️ Built With

![Java 21](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.4+-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI_0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python 3.11](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL_17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector_HNSW-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![SentenceTransformers](https://img.shields.io/badge/SentenceTransformers-FF6F00?style=for-the-badge&logo=huggingface&logoColor=white)
![Transformers.js](https://img.shields.io/badge/Transformers.js_%2B_ONNX_Runtime_Web-FF6F00?style=for-the-badge&logo=huggingface&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_&_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

<details>
<summary><b>⚡ Tech Stack at a Glance (Click to expand)</b></summary>

| Domain | Core Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, React Router v7, TanStack Query v5, Axios, Tailwind CSS v4, Lucide React, Sonner, `pdfjs-dist`, `@huggingface/transformers` (client-side embeddings) |
| **Backend API** | Java 21, Spring Boot 3.4+, Spring Security, Spring Data JPA, Hibernate, Apache PDFBox, Flyway DB, Scalar OpenAPI |
| **AI / ML Microservice** | Python 3.11, FastAPI 0.115, SentenceTransformers (`all-MiniLM-L6-v2`), PyTorch, Hugging Face, Google Gemini API — used for the arXiv harvester and roadmap paper matching |
| **Database & Storage** | PostgreSQL 17 + `pgvector` (HNSW Cosine Vector Indexing), Supabase Storage REST API |
| **Security & DevOps** | Google OAuth2, Stateless JWT (RSA/HMAC), Argon2/BCrypt, Docker & Docker Compose |

</details>

---

## 🌟 Product Overview

Modern research involves wading through thousands of dense, multi-page PDFs, tracking complex citations, and manually synthesizing disjointed findings. **Anveshak** reimagines the scientific discovery workflow by acting as a context-aware **Second Brain for Researchers**.

Whether you are conducting a structured literature review, analyzing competing technical frameworks, or building a domain-specific study plan, Anveshak automates paper parsing, vector indexing, side-by-side comparative analysis, and contextual Q&A—all inside a unified workspace.

### 💡 Key Value Drivers

- **⚡ Accelerate Literature Discovery**: Search by conceptual intent rather than literal keyword matching.
- **🧠 Eliminate Context Loss**: Chat directly with multi-page PDFs with deep citation awareness down to exact page chunks.
- **📊 Automated Synthesis**: Auto-generate executive summaries, methodology matrices, and multi-paper comparative reports in seconds.
- **🗺️ Adaptive Domain Roadmaps**: Build structured, multi-stage research pathways automatically mapped to open-access papers.

---

## ✨ Core Product Modules

| Feature Module | Description | Technical Core |
|---|---|---|
| 🔍 **Semantic Search & Vector Discovery** | Find research papers using natural language queries across personal and global paper repositories. | Client-side 384-dim embeddings + HNSW Cosine Similarity |
| 💬 **Talk-to-Paper (RAG Assistant)** | Interactive multi-turn conversational AI over specific PDFs with contextual chunk retrieval. | Client-side embeddings + HNSW Vector Lookup + Gemini LLM |
| 📄 **Automated Paper Structuring** | Instant breakdown of PDFs into Objectives, Methodology, Datasets, Key Findings, and Limitations. | LLM Structured JSON Parsing |
| ⚖️ **Multi-Paper Comparison Engine** | Side-by-side matrix evaluation comparing algorithms, datasets, performance, and research trade-offs. | Cross-Paper Contextual Prompt Engineering |
| 📚 **Literature Review Generator** | Comprehensive thematic synthesis reports aggregating insights and research gaps across paper sets. | Multi-Document RAG Aggregation |
| 🗺️ **Research Roadmap Generator** | Dynamically creates step-by-step topic mastery roadmaps with ranked reading lists. | Vector Distance Stage Mapping |
| ⚡ **Open-Access arXiv Harvester** | Ingests thousands of open-access papers directly into global vector databases via open protocols. | OAI-PMH XML Streaming + Batch Embedding Pipeline |
| 📁 **Collections & Citation Hub** | Custom research folders with automated BibTeX and citation formatting. | PostgreSQL JPA Relational Graph |

---

## 🏗️ System Architecture

Anveshak is engineered as a high-performance **Microservices Monorepo**, decoupling vector embedding computation, relational vector storage, API business logic, and modern web UI rendering.

```
                                    ┌────────────────────────┐
                                    │    React 19 Frontend   │
                                    │  (Vite + Tailwind +    │
                                    │   transformers.js)     │
                                    └───────────┬────────────┘
                                                │ REST (HTTP/JSON + JWT)
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Spring Boot API Gateway & Core                           │
│                                      (Java 21 / Spring 3.4+)                           │
│  ┌──────────────────┬──────────────────┬───────────────────┬────────────────────────┐  │
│  │ Security & Auth  │ Paper & Chat API │ Gemini AI Engine  │ arXiv Harvester Engine │  │
│  └────────┬─────────┴────────┬─────────┴─────────┬─────────┴───────────┬────────────┘  │
└───────────┼──────────────────┼───────────────────┼─────────────────────┼───────────────┘
            │                  │                   │                     │
            │                  ▼                   ▼                     │
            │          ┌───────────────┐   ┌────────────────┐            │
            │          │ Supabase REST │   │ Google Gemini  │            │
            │          │  PDF Storage  │   │  Pro / Flash   │            │
            │          └───────────────┘   └────────────────┘            │
            ▼                                                            ▼
┌───────────────────────┐                                    ┌───────────────────────┐
│ FastAPI Microservice  │                                    │ PostgreSQL 17         │
│ (all-MiniLM-L6-v2)    ├───────────────────────────────────►│ + pgvector Extension  │
│ PyTorch / HuggingFace │  384-dim Vector Ingestion & Query  │ (HNSW Cosine Index)   │
└───────────────────────┘                                    └───────────────────────┘
```

> The FastAPI embedding microservice is only called by the backend itself now — for the arXiv harvester and roadmap paper matching, both of which run without a browser in the loop. Paper upload, semantic search, and chat all compute their 384-dim embeddings client-side (same `all-MiniLM-L6-v2` model, exported for `transformers.js`/ONNX Runtime Web) and send the finished vector to the API, so the microservice is no longer a dependency for those request paths.

---

## 🔄 End-to-End RAG Pipeline Flow

```
[ PDF Upload ] ──► [ pdf.js Text Extraction ] ──► [ Chunking ] ──► [ In-Browser ONNX Embedding ]
     (all in a Web Worker, client-side)                                        │
                                                                                ▼
                                                      [ Chunk batches + vectors uploaded to API ]
                                                                                │
                                                                                ▼
[ Interactive Chat ] ◄── [ Google Gemini LLM ] ◄── [ Top-K Vector Match ] ◄── [ Query embedded client-side ]
```

1. **Document Parsing**: When a PDF is uploaded, the browser streams it through `pdf.js` page-by-page and splits the text into logical, page-indexed chunks — no round trip to the server yet.
2. **Dense Vectorization**: Each chunk is embedded in-browser, off the main thread, via `transformers.js`/ONNX Runtime Web running the same `all-MiniLM-L6-v2` model the Python microservice uses, producing 384-dimensional dense vectors. Batches of `{content, embedding}` are uploaded to the API as they finish, which is also what makes an interrupted upload resumable.
3. **Indexed Storage**: Vectors and document metadata are stored in PostgreSQL using the `pgvector` extension with a Hierarchical Navigable Small World (**HNSW**) cosine similarity index (`vector_cosine_ops`).
4. **Contextual Retrieval**: A user's search query or chat prompt is embedded client-side the same way, and the resulting vector is sent to the API, which retrieves the top-K relevant text chunks via vector similarity — the server never has to compute a text embedding on the request path.
5. **LLM Synthesis**: Retrieved chunks and conversational context are supplied to **Google Gemini API** to generate accurate, cited responses.

The FastAPI microservice still handles embedding for the two paths without a browser present: the arXiv harvester (a backend batch job) and research roadmap generation (which searches the global paper index against AI-generated stage descriptions in the same request).

---

## 🛠️ Complete Technical Stack

### 🔹 Backend REST API (`/backend`)
- **Language & Runtime**: Java 21 (LTS)
- **Framework**: Spring Boot 3.4+
- **Security**: Spring Security + OAuth2 (Google Sign-In) + Stateless JWT (Access & Refresh tokens) + Argon2/BCrypt
- **Database & ORM**: PostgreSQL 17 + `pgvector`, Spring Data JPA, Hibernate 6
- **Database Migrations**: Flyway DB
- **Document Processing**: Apache PDFBox
- **AI Integrations**: Google Gemini API (`google-genai` SDK)
- **File Storage**: Supabase Storage (REST API)
- **API Documentation**: OpenAPI 3.0 + Scalar UI (`/scalar/index.html`)
- **Build System**: Apache Maven

### 🔹 Embedding Microservice (`/embeddingService`)
- **Language & Runtime**: Python 3.11+
- **Web Framework**: FastAPI 0.115 + Uvicorn
- **ML Architecture**: PyTorch + HuggingFace `SentenceTransformers`
- **Default Vector Model**: `all-MiniLM-L6-v2` (384-dimensional embeddings)
- **Data Validation**: Pydantic v2
- **Scope**: called only by the backend itself, for the arXiv harvester and roadmap paper matching — not on the paper upload, search, or chat request paths (those embed client-side, see below)

### 🔹 Frontend Application (`/frontend`)
- **Framework**: React 19 + TypeScript (Strict Mode)
- **Build Engine**: Vite 8 with HMR
- **Routing**: React Router v7
- **State Management & Data Fetching**: TanStack Query v5 (React Query)
- **HTTP Client**: Axios with automatic JWT bearer authorization & retry interceptors
- **Styling & UI**: Tailwind CSS v4, Lucide React icons
- **Form Controls & Validation**: React Hook Form + Zod
- **Notifications**: Sonner
- **Client-Side PDF & Embeddings** (`src/lib/embedding`): `pdfjs-dist` for in-browser text extraction, `@huggingface/transformers` (ONNX Runtime Web, quantized `all-MiniLM-L6-v2`) running in a Web Worker to embed paper chunks, search queries, and chat messages without a round trip to the Python microservice

---

## 🗄️ Database Architecture & Vector Indexing

The underlying PostgreSQL database leverages native vector capabilities to maintain high-throughput similarity searches across millions of text chunks.

### Key Database Tables

- `research_papers`: Primary record storing paper titles, abstracts, authors, keywords, publication metadata, owner links, and document-level embeddings.
- `paper_chunks`: Granular page-indexed text blocks storing raw text, page numbers, chunk order, and 384-dimensional `embeddings`.
- `chat_sessions` & `chat_messages`: Multi-turn conversational history tied to specific papers and users.
- `paper_summaries`: Structured JSON-like breakdown of paper objectives, methodologies, datasets, findings, and limitations.
- `roadmaps` & `roadmap_stages`: Multi-tier learning roadmaps mapped with vector-matched paper recommendations.
- `global_papers`: Ingested arXiv paper metadata for broad literature search.

### HNSW Index Configuration

```sql
-- Flyway Migration V5: Create HNSW Vector Index for High-Performance Similarity Search
CREATE INDEX paper_chunks_embedding_idx 
ON paper_chunks 
USING hnsw (embeddings vector_cosine_ops);
```

---

## 🔌 API Endpoints Summary

Anveshak exposes clean REST APIs documented interactively via **Scalar UI**.

| Group | Method | Path | Description |
|---|---|---|---|
| **Auth** | `POST` | `/auth/register` | User signup with password hashing |
| **Auth** | `POST` | `/auth/login` | Email/password login, returns JWT token pair |
| **Auth** | `POST` | `/auth/google` | Google OAuth2 authentication flow |
| **Papers** | `GET` | `/papers` | Retrieve user's uploaded papers library |
| **Papers** | `POST` | `/papers/upload/init` | Create a paper record + upload the PDF; chunks follow separately |
| **Papers** | `POST` | `/papers/upload/{paperId}/chunks` | Upload a batch of client-embedded chunks (resumable) |
| **Papers** | `POST` | `/papers/upload/{paperId}/finalize` | Finalize an upload once all chunks are in, generating the AI summary |
| **Papers** | `POST` | `/papers/search/local` | Semantic search over the user's library (client-computed query embedding) |
| **Papers** | `POST` | `/papers/search/global` | Semantic search over the global arXiv index (client-computed query embedding) |
| **Papers** | `POST` | `/papers/compare` | Multi-paper AI side-by-side comparative analysis |
| **Papers** | `POST` | `/papers/literature-review` | Auto-generate structured synthesis review report |
| **Chat** | `POST` | `/chat-sessions` | Start a chat session for a paper |
| **Chat** | `GET` | `/chat-sessions/{sessionId}/messages` | Retrieve multi-turn chat history for a session |
| **Chat** | `POST` | `/chat-sessions/{sessionId}/messages` | Send a message to the paper chat assistant (RAG), embedding computed client-side |
| **Roadmaps**| `POST` | `/roadmaps/generate` | Generate AI-driven research roadmap for a topic |
| **Roadmaps**| `GET` | `/roadmaps` | List user roadmaps |
| **Collections**| `GET/POST`| `/collections` | List or create personal paper collections |
| **Admin** | `POST` | `/api/admin/harvest/arxiv` | Trigger OAI-PMH arXiv harvester job |

*Full API Interactive Playground:* `http://localhost:8080/scalar/index.html`

---

## ⚡ Quick Start & Development Setup

### Prerequisites

Ensure you have the following installed on your machine:
- **Java 21+** (JDK)
- **Node.js 20+** & `npm`
- **Python 3.11+**
- **Docker & Docker Compose**
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/))
- **Supabase Account & Bucket** ([Get started here](https://supabase.com/))

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/sagar-dot-bera/Anveshak.git
cd Anveshak
```

---

### Step 2: Start Core Infrastructure (Docker)

Launch PostgreSQL with `pgvector` and the Python Embedding Service (`docker-compose.yml` lives at the repo root):

```bash
docker compose up -d postgres embedding
```

Verify running containers:
- **PostgreSQL 17**: Port `5436`
- **Embedding Service**: Port `8001` (`http://localhost:8001/health`) — only used by the backend for the arXiv harvester and roadmap generation; paper upload, search, and chat don't need it

> Running `docker compose up -d` with no service names also builds and starts the `backend` and `frontend` containers. For local development it's usually faster to run those two directly (Steps 4–5) and point them at the dockerized `postgres`/`embedding` ports instead.

---

### Step 3: Configure Environment Variables

Edit `backend/src/main/resources/application.yml` or set standard environment variables:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5436/anveshak_db
    username: <your_postgres_user>
    password: <your_postgres_password>

google-gemini:
  api-key: <your_gemini_api_key>

supabase:
  url: <your_supabase_url>
  access-key: <your_supabase_anon_key>
  secret-access-key: <your_supabase_secret_key>
  bucket-name: anveshak

jwt:
  secret: "<your_base64_encoded_jwt_secret>"
  expiration: 3600000
```

---

### Step 4: Launch Backend Service

```bash
cd ../backend
./mvnw spring-boot:run
```

- API Server will start on `http://localhost:8080`
- Database Flyway migrations apply automatically on boot.
- The root `.env` is written for the dockerized `backend` service, so `SPRING_DATASOURCE_URL` and `EMBEDDING_SERVICE_URL` point at the docker-internal hostnames (`postgres`, `embedding`). Running the backend directly on the host instead of in Docker, override both to use `localhost` and the mapped ports (`jdbc:postgresql://localhost:5436/anveshak_db` and `http://localhost:8001`).

---

### Step 5: Launch Frontend Application

```bash
cd ../frontend
npm install
npm run dev
```

- Development server will start on `http://localhost:5173`

---

## 🧪 Build & Quality Commands

### Frontend

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript type-checking & production bundle build
npm run lint     # Run OXLint code analysis
npm run preview  # Preview production build artifacts locally
```

### Backend

```bash
./mvnw spring-boot:run   # Launch server with live dev tools
./mvnw test              # Execute unit and integration tests
./mvnw package           # Package application into executable JAR
```

---

## 📄 License & Attribution

All rights reserved. Designed and developed by **Sagar Bera** and open-source contributors.

Special thanks to the creators of **Spring Boot**, **Google Gemini**, **pgvector**, **SentenceTransformers**, **Supabase**, and **Vite + React**.
