-- Additive: preserves existing rows, roles, RLS and provider identifiers.
ALTER TABLE gsw_sdr.drafts DROP CONSTRAINT IF EXISTS drafts_provider_check;
ALTER TABLE gsw_sdr.drafts ADD CONSTRAINT drafts_provider_check CHECK (provider IN ('rules','openai','rules_fallback','gemini'));
ALTER TABLE gsw_sdr.drafts ADD COLUMN IF NOT EXISTS generation_meta JSONB NOT NULL DEFAULT '{}'::jsonb;
