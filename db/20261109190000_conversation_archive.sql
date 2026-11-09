-- Arquivamento reversível, mantendo mensagens, rascunhos e opt-out.
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
