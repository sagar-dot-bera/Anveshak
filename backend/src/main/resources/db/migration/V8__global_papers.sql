CREATE TABLE global_papers (
    id UUID PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT,
    categories TEXT,
    published_at DATE,
    updated_at DATE,
    doi VARCHAR(255),
    paper_url TEXT NOT NULL,
    pdf_url TEXT,
    language VARCHAR(20),
    embedding VECTOR (384),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    indexed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_source_external UNIQUE (source, external_id)
);

CREATE INDEX idx_global_papers_embedding ON global_papers USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_global_papers_doi ON global_papers (doi);

CREATE INDEX idx_global_papers_source ON global_papers (source);

CREATE INDEX idx_global_papers_published ON global_papers (published_at);