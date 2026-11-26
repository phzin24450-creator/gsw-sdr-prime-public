-- GSW SDR PRIME v0.3 - SQL Editor Supabase - apenas projeto NOVO de desenvolvimento.
-- Execute este arquivo INTEIRO. Não use em projeto de terceiro nem copie segredos.
-- gsw_sdr NÃO deve constar entre os Exposed schemas da Data API.
BEGIN;
CREATE SCHEMA IF NOT EXISTS gsw_sdr;
REVOKE ALL ON SCHEMA gsw_sdr FROM PUBLIC;
SET LOCAL search_path TO gsw_sdr;
-- GSW SDR PRIME v0.3 - Postgres 14+; execute via script de migracao.
-- IMPORTANTE: conectado com search_path gsw_sdr; schema nao exposto pelo PostgREST.
CREATE TABLE IF NOT EXISTS conversations (
  phone TEXT PRIMARY KEY CHECK (phone ~ '^[0-9]{8,15}$'),
  mode TEXT NOT NULL DEFAULT 'HUMAN' CHECK (mode IN ('HUMAN','AI_ACTIVE','HANDOFF_PENDING','PAUSED')),
  opted_out BOOLEAN NOT NULL DEFAULT FALSE,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  version BIGINT NOT NULL DEFAULT 0 CHECK (version >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  conversation_phone TEXT NOT NULL REFERENCES conversations(phone) ON DELETE CASCADE,
  external_id TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  body TEXT NOT NULL CHECK (char_length(body) <= 4000),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_date ON messages(conversation_phone, occurred_at DESC, created_at DESC);
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY,
  conversation_phone TEXT NOT NULL REFERENCES conversations(phone) ON DELETE CASCADE,
  source_message_id UUID NOT NULL UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
  conversation_version BIGINT NOT NULL,
  intent TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('rules','openai','rules_fallback')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW','SUPERSEDED','APPROVED','REJECTED')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_drafts_conversation_date ON drafts(conversation_phone, created_at DESC);
CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_phone TEXT NOT NULL REFERENCES conversations(phone) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_conversation_date ON audit_events(conversation_phone, occurred_at DESC);
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Defesa adicional: nenhuma politica RLS de acesso externo e criada.
-- Conexao do backend de desenvolvimento deve usar role proprietaria/trusted.
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

INSERT INTO gsw_sdr.schema_migrations(filename) VALUES('001_init.sql') ON CONFLICT (filename) DO NOTHING;
COMMIT;
