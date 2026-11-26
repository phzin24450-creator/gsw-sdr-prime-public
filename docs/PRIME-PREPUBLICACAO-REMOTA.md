# Verificação remota antes da publicação — 25/11/2026

Autorização do proprietário para backup/restauração isolada, deploy de desenvolvimento e teste Android recebida; workspace My Workspace confirmado. Nenhum deploy realizado.

- Render gsw-sdr-prime-dev: live em 982635094132de6fe6409210e97619633ab995b2; autoDeploy no/off; branch configurada work/v0.3-infra-tests. Não usar trigger genérico: ele não seleciona o SHA candidato. Candidato 66481b46e0c993083ea8423d9eaafd842ff56671.
- Supabase gsw-sdr-prime-dev estava INACTIVE. Reativação solicitada e concluída: ACTIVE_HEALTHY, plano free preservado. Consulta SELECT 1 e presença das tabelas conversations/messages/drafts confirmadas, sem ler registros pessoais.
- Backblaze: login confirmado após intervenção do proprietário. Bucket gsw-sdr-prime-v42-backups privado, criptografia habilitada, zero arquivos e zero bytes. Caps de armazenamento e download US$0, alertas habilitados; classes B/C 2500/dia. Nenhuma configuração alterada.
- Registro gsw_sdr.schema_migrations contém 001_init.sql e 20261109190000_conversation_archive.sql. As colunas generation_meta e archived_at existem; source_message_id já aceita NULL. Não tratar falta de marcador como prova de falta de alteração. Constraints/índices ainda precisam de comparação antes de qualquer reconciliação. Não foi aplicada migração.
- Não há executor de backup configurado nesta sessão: conexão dedicada de leitura e material de recuperação não estão disponíveis via canal seguro. As ferramentas SQL conectadas não substituem um fluxo de pg_dump cifrado sem exposição de dados. Não extrair senhas do Render nem despejar dados pelo chat.

Backup externo e restauração seguem NÃO EXECUTADOS. O painel B2 permite upload manual do ciphertext depois de um executor seguro o produzir; não é obrigatório criar uma chave de API B2 para essa alternativa. Chave privada de recuperação deve ter custódia durável separada do backup; não gerar uma chave descartável e chamar isso de recuperação operacional.

Próximo requisito: provisionar conexão dedicada para pg_dump e destinatário público de criptografia num executor privado, com custódia da identidade de recuperação definida. Depois: backup cifrado, transferência ao bucket, download e restauração isolada, validação de integridade; somente então deploy e teste Android físico. Não solicitar senhas ou chaves privadas no chat.
