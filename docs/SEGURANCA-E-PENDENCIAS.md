# Auditoria e pendências — versão 0.3

## Corrigido nesta versão

1. **Migração não atômica:** o arquivo DDL era executado com COMMIT antes de registrar o marker. Agora, DDL e registro da migração são confirmados no **mesmo COMMIT**, com ROLLBACK no erro e lock consultivo.
2. **Risco do schema public:** tabelas internas isoladas em `gsw_sdr`, com revogação de USAGE público e sem adição ao Data API, com RLS habilitada sem políticas de acesso externo. Script seguro para execução integral no SQL Editor: `db/supabase-setup.sql`.
3. **Revisão de rascunhos:** APPROVED/REJECTED com estado e versão conferidos. Aprovação **não envia** mensagens.
4. **Contexto adaptativo:** setor, desafio e objetivo podem ser corrigidos pelo operador; alterações invalidam rascunhos pendentes.
5. **Qualificação preliminar:** extrai apenas informações expressamente fornecidas e mantém orçamento/decisor ausentes como nulos.
6. **Exclusão de conversa:** endpoint administrativo com confirmação DELETE. Delete cascata no PostgreSQL.
7. **Geração assistida após webhook:** opcional (`AUTO_DRAFTS=true`) e somente para rascunhos. Não usar como fila durável de produção.
8. **Falha fechada ao inicializar produção:** exige DATABASE_URL, segredos reais e ENABLE_DEMO=false. Rate limiting simples na API, que NÃO substitui controle por proxy/identidade.

## Permanece pendente para produção

- Conexão real Supabase e testes SQL reais; `pg` deve ser instalado e backend implantado.
- Autenticação por usuário, controle de equipes/organizações, RBAC, sessões, 2FA quando cabível, revogação de acesso e rate limiting no gateway.
- Worker/fila com persistência, retries, idempotência de ponta a ponta, observabilidade e desligamento de automações por operador.
- Envio real Meta (não implementado), cadastro do app, token seguro, templates aprovados, janela de 24h, opt-in/opt-out, número de testes e avaliação de coexistência.
- Uso real da API de IA e consentimentos/políticas de privacidade aplicáveis aos dados processados por terceiro.
- Integração oficial Prospecta: importer CSV conhecido, API/webhooks não encontrados; não automatizar writes sem documentação.
- Backups, retenção e remoção legal, segurança web (CSP sem inline, login real, proteções contra abuso), análise de custos e revisão de segurança.
- Isolamento multi-tenant: **esta versão é de organização única** e não deve receber dados de múltiplas empresas.

## Status por verificação

| Eixo | Resultado |
| --- | --- |
| Regras locais, rascunhos, handoff, opt-out, contexto, qualificação | Testes automatizados locais aprovados |
| Assinatura e challenge Meta (payload sintético) | Testes locais aprovados |
| Migração transacional (cliente simulado) | Teste local aprovado |
| PostgreSQL remoto / Supabase | Não testado; nenhuma migração remota aplicada |
| API de IA real | Não testado; fallback local disponível |
| Envio WhatsApp | Não implementado |
| Sincronização Prospecta | Não implementado |
| Deploy público seguro | Não realizado; não recomendado com autenticação atual |
| GitHub write | Acesso de leitura confirmado anteriormente, gravação 403 |
