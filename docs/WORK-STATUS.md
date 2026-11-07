# GSW SDR PRIME — resultado da implantação de testes

Data: 07/11/2026. Versão do backend: 0.3.0.

## Resultado

Backend HTTPS de desenvolvimento publicado em https://gsw-sdr-prime-dev.onrender.com e conectado ao PostgreSQL real do Supabase. Deploy dep-dbnlu0ijnfac73coir90 terminou como live. O endpoint /health retornou ok=true, storage=postgres e autoSend=false.

## Infraestrutura e acesso

- GitHub: ChatGPT Codex Connector instalado com escopo selecionado somente para gsw-sdr-prime-public. Código publicado em work/v0.3-infra-tests e PR #1; a main não foi modificada.
- Supabase: projeto isolado gsw-sdr-prime-dev, ref vpwbzukryiqvqigeynwk, região sa-east-1, PostgreSQL 17.11. Cinco tabelas no schema gsw_sdr com RLS ativada.
- Runtime: role exclusiva gsw_sdr_backend com login e DML nas quatro tabelas operacionais. Sem SUPERUSER, BYPASSRLS, CREATEDB, CREATEROLE ou CREATE no schema. As quatro políticas são restritas a essa role.
- anon e authenticated continuam sem USAGE em gsw_sdr. schema_migrations permanece administrativa, sem política de navegador.
- Render: serviço srv-dbnl94ijnfac73cmu2e0 no My Workspace, plano free, região virginia, Node 22, HOST=0.0.0.0. Auto-deploy está desligado.
- DATABASE_URL e chaves do backend ficam somente nas variáveis privadas do Render, sem valores no GitHub, relatório ou frontend.
- Session pooler validado: aws-1-sa-east-1.pooler.supabase.com:5432. TLS com verify-full e CA Supabase configurada via NODE_EXTRA_CA_CERTS=db/supabase-ca.crt; verificação de certificado não foi desativada.
- CA obtida de https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt; SHA-256 807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA; validade até 26/04/2031.
- ENABLE_DEMO=false e AUTO_DRAFTS=false.

## Verificações realizadas

| Verificação | Resultado |
| --- | --- |
| npm install e lockfile | Concluído |
| Testes automatizados locais | 24 aprovados, 0 falhas |
| GitHub Actions | Aprovado na revisão inicial |
| Build Render | 24 testes aprovados e inicialização concluída |
| /health HTTPS | ok=true, storage=postgres, autoSend=false |
| API sem chave administrativa | HTTP 401 |
| Webhook com assinatura inválida | HTTP 401 |
| Webhook com payload sintético assinado | Mensagem aceita |
| Deduplicação do mesmo evento | Duplicata recusada |
| Rascunho por regras locais | Criado em modo AI_ACTIVE |
| Aprovação de rascunho | Registrada com sent=false |
| Troca para HUMAN | Confirmada pela API |
| Endpoint demo desativado | HTTP 404 |
| Persistência após novo deploy/reinício | Mensagem e rascunho aprovado preservados |
| Limpeza de dados sintéticos | DELETE administrativo executado; ausência na listagem confirmada |
| RLS e privilégios | Verificados no PostgreSQL remoto |

## Ajustes e dificuldades resolvidas

- Conta GitHub estava autenticada, mas o aplicativo não estava instalado; instalação concluída após autorização do usuário.
- A criação das tabelas ocorreu em banco novo autorizado; nenhum banco de produção/Prospecta foi modificado.
- Primeiro deploy falhou fechado sem DATABASE_URL. Credencial exclusiva configurada pelo Supabase e salva no Render.
- Corrigida a cadeia TLS do Supabase com a CA confiável e ajustado o host do session pooler.
- Função temporária de configuração de senha foi substituída por implementação que sempre rejeita execução, sem segredo em seu corpo e sem EXECUTE para PUBLIC. O DROP não ocorreu porque a confirmação nativa expirou; a função permanece desativada.

## Limitações

Este é um ambiente de testes de organização única, não uma liberação para operação comercial com dados reais.

- Painel exige a ADMIN_API_KEY do próprio serviço Render. Falta autenticação por operador, RBAC e controles de operação para produção.
- API de IA real, Meta real, envio WhatsApp, coexistência, consentimentos, templates e Prospecta não foram ativados nem testados.
- Não há rota de envio Meta; aprovação de rascunho não envia mensagem.
- Lista completa de Exposed schemas do Data API não foi obtida pelas consultas administrativas disponíveis; não foi alterada. Isolamento por privilégios/RLS foi verificado.
- Auditoria Supabase retornou apenas INFO por RLS sem políticas em schema_migrations, intencional para tabela administrativa: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Plano free do Render pode suspender o serviço por inatividade. Não se promete disponibilidade contínua.
- Dockerfile preparado, mas imagem Docker não construída; implantação verificada usou runtime Node.

## Links

- Sistema de testes: https://gsw-sdr-prime-dev.onrender.com
- Render: https://dashboard.render.com/web/srv-dbnl94ijnfac73cmu2e0
- PR: https://github.com/phzin24450-creator/gsw-sdr-prime-public/pull/1

WhatsApp comercial, repositório privado e Prospecta preservados. Nenhuma mensagem real enviada e nenhum plano pago provisionado.
