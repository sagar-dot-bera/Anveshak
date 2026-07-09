CREATE TABLE reasearch_papers (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    title VARCHAR(800) NOT NULL,
    abstract TEXT,
    publication_year INT,
    storage_key VARCHAR(1000),
    embedding VECTOR (384),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paper_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE authors (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE paper_authors (
    paper_id UUID NOT NULL,
    author_id UUID NOT NULL,
    PRIMARY KEY (paper_id, author_id),
    FOREIGN KEY (paper_id) REFERENCES research_papers (id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors (id)
);

CREATE TABLE keywords (
    id UUID PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE paper_keywords (
    paper_id UUID,
    keyword_id UUID,
    PRIMARY KEY (paper_id, keyword_id),
    FOREIGN KEY (paper_id) REFERENCES research_papers (id) ON DELETE CASCADE,
    FOREIGN KEY (keyword_id) REFERENCES keywords (id)
);

CREATE TABLE collections (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE collection_papers (
    collection_id UUID,
    paper_id UUID,
    PRIMARY KEY (collection_id, paper_id),
    FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE,
    FOREIGN KEY (paper_id) REFERENCES research_papers (id) ON DELETE CASCADE
);

CREATE INDEX idx_papers_owner ON research_papers (owner_id);

CREATE INDEX idx_papers_year ON research_papers (publication_year);

CREATE INDEX idx_author_name ON authors (name);

CREATE INDEX idx_keyword ON keywords (keyword);