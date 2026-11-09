-- Uma abordagem inicial tem contexto do operador e nenhuma mensagem recebida.
ALTER TABLE gsw_sdr.drafts ALTER COLUMN source_message_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_drafts_one_opening
  ON gsw_sdr.drafts(conversation_phone) WHERE source_message_id IS NULL;
