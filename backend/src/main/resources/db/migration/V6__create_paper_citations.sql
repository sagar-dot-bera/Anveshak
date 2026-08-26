CREATE TABLE paper_citations (
    id UUID PRIMARY KEY,
    citing_paper_id UUID NOT NULL REFERENCES research_papers (id) ON DELETE CASCADE,
    cited_paper_id UUID NOT NULL REFERENCES research_papers (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);