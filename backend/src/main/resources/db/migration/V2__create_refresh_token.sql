CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE REFRESH_TOKENS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expirs_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL,
    provider_user_id VARCHAR(255),
    password_hash VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_provider_identity UNIQUE (provider, provider_user_id),
    CONSTRAINT uq_user_provider UNIQUE (user_id, provider)
);

ALTER TABLE USERS DROP COLUMN password_hash;