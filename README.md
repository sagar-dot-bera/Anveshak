# 🔭 Anveshak — AI-Powered Research Intelligence Platform

> **Transform academic overload into actionable clarity.**  
> Anveshak (*Sanskrit for "Investigator / Researcher"*) is an enterprise-grade AI research assistant that empowers academics, engineers, and scientists to intelligently search, summarize, compare, and converse with scholarly literature using state-of-the-art Retrieval-Augmented Generation (RAG) and dense vector embeddings.

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
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_&_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

<details>
<summary><b>⚡ Tech Stack at a Glance (Click to expand)</b></summary>

| Domain | Core Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, React Router v7, TanStack Query v5, Axios, Tailwind CSS v4, Lucide React, Sonner |
| **Backend API** | Java 21, Spring Boot 3.4+, Spring Security, Spring Data JPA, Hibernate, Apache PDFBox, Flyway DB, Scalar OpenAPI |
| **AI / ML Microservice** | Python 3.11, FastAPI 0.115, SentenceTransformers (`all-MiniLM-L6-v2`), PyTorch, Hugging Face, Google Gemini API |
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
| 🔍 **Semantic Search & Vector Discovery** | Find research papers using natural language queries across personal and global paper repositories. | Dense 384-dim embeddings + HNSW Cosine Similarity |
| 💬 **Talk-to-Paper (RAG Assistant)** | Interactive multi-turn conversational AI over specific PDFs with contextual chunk retrieval. | Apache PDFBox + HNSW Vector Lookup + Gemini LLM |
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
                                    │     (Vite + Tailwind)  │
                                    └───────────┬────────────┘
                                                │ REST (HTTP/JSON + JWT)
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Spring Boot API Gateway & Core                           │
│                                      (Java 21 / Spring 3.4+)                           │
│  ┌──────────────────┬──────────────────┬───────────────────┬────────────────────────┐  │
│  │ Security & Auth  │ PDF Ingest & RAG │ Gemini AI Engine  │ arXiv Harvester Engine │  │
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

---

## 🔄 End-to-End RAG Pipeline Flow

```
[ PDF Upload ] ──► [ PDFBox Text Extraction ] ──► [ Sliding Window Chunking (500 words) ]
                                                                   │
                                                                   ▼
[ Interactive Chat ] ◄── [ Google Gemini LLM ] ◄── [ Top-K Vector Match ] ◄── [ FastAPI Embedding ]
```

1. **Document Parsing**: When a PDF is uploaded, Apache PDFBox extracts clean, raw text and splits it into logical, page-indexed chunks.
2. **Dense Vectorization**: Paper chunks are dispatched to the FastAPI embedding microservice running `SentenceTransformers (all-MiniLM-L6-v2)`, producing 384-dimensional dense vectors.
3. **Indexed Storage**: Vectors and document metadata are stored in PostgreSQL using the `pgvector` extension with a Hierarchical Navigable Small World (**HNSW**) cosine similarity index (`vector_cosine_ops`).
4. **Contextual Retrieval**: User chat prompts generate real-time vector queries, retrieving the top-K relevant text chunks via vector similarity.
5. **LLM Synthesis**: Retrieved chunks and conversational context are supplied to **Google Gemini API** to generate accurate, cited responses.

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

### 🔹 Frontend Application (`/frontend`)
- **Framework**: React 19 + TypeScript (Strict Mode)
- **Build Engine**: Vite 8 with HMR
- **Routing**: React Router v7
- **State Management & Data Fetching**: TanStack Query v5 (React Query)
- **HTTP Client**: Axios with automatic JWT bearer authorization & retry interceptors
- **Styling & UI**: Tailwind CSS v4, Lucide React icons
- **Form Controls & Validation**: React Hook Form + Zod
- **Notifications**: Sonner

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
| **Papers** | `POST` | `/papers` | Upload new PDF paper with automatic parsing & embedding |
| **Papers** | `GET` | `/papers/search?query=` | Perform semantic dense vector search across papers |
| **Papers** | `POST` | `/papers/compare` | Multi-paper AI side-by-side comparative analysis |
| **Papers** | `POST` | `/papers/literature-review` | Auto-generate structured synthesis review report |
| **Chat** | `GET` | `/papers/{id}/chat` | Retrieve multi-turn chat history for a paper |
| **Chat** | `POST` | `/papers/{id}/chat` | Send prompt to paper chat assistant (RAG) |
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

Launch PostgreSQL with `pgvector` and the Python Embedding Service:

```bash
cd infra
docker compose up -d
```

Verify running containers:
- **PostgreSQL 17**: Port `5436`
- **Embedding Service**: Port `8001` (`http://localhost:8001/health`)

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
