ALTER TABLE paper_chunks DROP COLUMN embeddings;

ALTER TABLE paper_chunks ADD COLUMN embeddings VECTOR (384);