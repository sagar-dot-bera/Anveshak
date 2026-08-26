CREATE TABLE roadmaps (
    roadmap_id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    topic VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE roadmap_stages (
    stage_id UUID PRIMARY KEY,
    roadmap_id UUID NOT NULL REFERENCES roadmaps (roadmap_id),
    stage_order INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    UNIQUE (roadmap_id, stage_order)
);

CREATE TABLE roadmap_stage_papers (
    stage_id UUID NOT NULL REFERENCES roadmap_stages (stage_id),
    paper_id UUID NOT NULL REFERENCES global_papers (id),
    rank INT NOT NULL,
    similarity_score DOUBLE PRECISION,
    PRIMARY KEY (stage_id, paper_id)
);