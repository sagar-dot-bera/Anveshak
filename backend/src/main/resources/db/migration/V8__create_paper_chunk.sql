CREATE TABLE paper_chunks (
    id UUID PRIMARY KEY,
    paper_id UUID REFERENCES research_papers (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INT,
    chunk_index INT NOT NULL,
    embeddings VECTOR (348),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY,
    paper_id UUID NOT NULL REFERENCES research_papers (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_session (id) ON DELETE CASCADE,
    role VARCHAR(30),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE paper_summaries (
    paper_id UUID PRIMARY KEY REFERENCES research_papers (id) ON DELETE CASCADE,
    objective TEXT,
    methodology TEXT,
    dataset TEXT,
    key_findings TEXT,
    limitations TEXT,
    future_work TEXT
);

CREATE INDEX paper_chunks_paper_idx ON paper_chunks (paper_id);

CREATE INDEX paper_chunks_embedding_idx ON paper_chunks USING hnsw (embedding vector_cosine_ops);