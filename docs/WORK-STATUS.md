# GSW SDR PRIME — validação em 07/11/2026

## Resultado confirmado

Ambiente assistido publicado em https://gsw-sdr-prime-dev.onrender.com/. O código executado é o commit `99aacbf3fe626c6caa16f54fab5b3d1fe072db3d`; deploy `dep-dbnmp7rbc2fs73fj1370` terminou como `live` às 18:23:59 UTC.

| Verificação | Evidência |
| --- | --- |
| Testes locais | 29 aprovados, 0 falhas |
| GitHub Actions | Push e PR do commit executado: success |
| Build Render | Logs: tests 29, pass 29, fail 0 |
| Login de operador | HTTPS real: sucesso com usuário configurado |
| Sessão segura | Cookie Secure e HttpOnly verificado; expiração e revogação testadas |
| Acesso sem login | HTTP 401 |
| Alteração de outro site | HTTP 403 |
| Exclusão por operador | HTTP 403; exige credencial técnica separada |
| Disponibilidade do PostgreSQL | /ready HTTP 200 após SELECT 1 |
| Mensagem registrada manualmente | Gravada e relida no PostgreSQL real |
| Contexto e modo de rascunho | Salvos pela sessão do operador |
| Rascunho por regras locais | Criado e aprovado com sent=false |
| Pedido de humano | HANDOFF_PENDING; nova geração recusada |
| Opt-out | PAUSED, optedOut=true, reativação recusada |
| Limpeza | Registro sintético apagado e ausência confirmada pela listagem |
| Logout | Sessão revogada; acesso posterior HTTP 401 |
| Página publicada | Renderização conferida no navegador; JavaScript passou em node --check |

Os testes HTTPS desta atualização usaram dados sintéticos e nenhuma mensagem real foi enviada. Assinatura de webhook, deduplicação e persistência após redeploy já tinham sido verificadas na implantação anterior; a suíte atual também cobre o webhook e a deduplicação. A integração real com Meta não foi aprovada por esses testes sintéticos.

## Configuração

- Render: My Workspace (`tea-dbnkmpmc6qcc73e5omjg`), serviço `srv-dbnl94ijnfac73cmu2e0`, Node 22, plano free, região Virginia; auto-deploy desligado.
- Supabase: projeto isolado `gsw-sdr-prime-dev`, ref `vpwbzukryiqvqigeynwk`, sa-east-1; PostgreSQL 17.11.
- Role `gsw_sdr_backend` sem SUPERUSER, BYPASSRLS, CREATEDB, CREATEROLE ou CREATE no schema. DML limitado às quatro tabelas operacionais. RLS ativa nas cinco tabelas; anon/authenticated sem USAGE no schema `gsw_sdr`.
- Conexão via session pooler aws-1-sa-east-1.pooler.supabase.com:5432; TLS verify-full e CA Supabase em `db/supabase-ca.crt`. Verificação de certificado mantida.
- Login de um operador (`pedro`), senha armazenada somente como hash scrypt no Render. Chave administrativa técnica rotacionada e separada do acesso do painel. Nenhuma credencial no código ou relatório.
- Sessão HttpOnly/Secure/SameSite=Strict, duração de uma hora, revogada ao sair ou reiniciar. Limites de tentativas, quantidade de sessões e verificações simultâneas. Proteção de origem em login e alterações pela sessão; CSP com nonce por resposta.
- `ENABLE_DEMO=false`, `AUTO_DRAFTS=false`, `META_CONFIGURED=false`. Os segredos Meta existentes são sintéticos.
- Código na branch `work/v0.3-infra-tests`, PR #1. Repositório privado e main preservados.

## Pendências que impedem aprovação completa

- `OPENAI_API_KEY` não está configurada no Render. `/api/status` confirmou `ai=regras locais`. A conta OpenAI conectada possui organização Personal e projeto Default, mas isso não comprova chave configurada no servidor nem crédito/limite. A chave do projeto foi criada posteriormente e salva no arquivo privado autorizado. A chamada real de validação retornou HTTP 429, error_type=billing_not_active e error_code=billing_not_active. Não houve geração de texto; o faturamento da API precisa ser ativado pelo titular. A chave ainda não foi instalada no Render.
- App Meta GSW SDR PRIME Testes criado (ID 993433747147030) na conta Pedro Henrique, após confirmação dos termos pelo titular. Portfólio GSW criado (ID 2122857598335661), com e-mail comercial escolhido pelo titular; confirmação de e-mail solicitada pela Meta. Termos específicos do WhatsApp Business e da API em Nuvem aceitos após autorização. Número de teste +1 555 188 1388 liberado; phone_number_id=1407318355800939, conta de mensagens=1997332070962414. Não há destinatário de teste cadastrado/confirmado nem token Meta real/webhook instalados no backend. O serviço ainda mantém whatsapp=nao configurado, corretamente.
- Não existe implementação de envio WhatsApp. Aprovar um rascunho não envia. Recebimento real, envio, status de entrega, templates, consentimento, janela de atendimento e coexistência precisam de configuração e testes específicos antes de automação comercial.
- Acesso suporta um operador e uma instância; não há MFA, administração multiusuário nem auditoria individual de uma equipe. Os controles de sessão/limite são locais ao processo.
- Plano free pode suspender por inatividade. Não foi contratada disponibilidade contínua.
- A lista completa de schemas expostos na Data API não foi obtida; o isolamento por RLS/privilégios foi verificado. Auditoria anterior mostrou somente INFO intencional de RLS sem políticas em schema_migrations.
- A função temporária de configuração de senha permanece desativada, sempre rejeita execução e não contém segredo; DROP anterior não foi confirmado.
- Dockerfile preparado, mas a imagem não foi construída. Implantação validada utiliza o runtime Node.

## Operação disponível

Consultar `docs/OPERATION.md`. É possível entrar, registrar mensagem recebida, salvar contexto, gerar rascunho por regras e revisar. A operação não depende de migrar o WhatsApp comercial. Esse fluxo assistido foi validado; o atendimento automático completo ainda não foi liberado.

## Próximas dependências externas

- Titular precisa ativar o faturamento da organização OpenAI Personal em https://platform.openai.com/settings/organization/billing. O teste chegou à API; não foi falha de rede ou rejeição de chave. Não repetir a criação de chave para tentar corrigir billing_not_active.
- A ferramenta de consulta/resgate de créditos promocionais não está disponível nesta sessão; nenhum crédito foi resgatado ou prometido.
- Configuração da chave no Render e validação real do gerador continuam pendentes; não declarar IA aprovada.
- Identificar um telefone do titular explicitamente autorizado para receber a mensagem de teste antes de cadastrar destinatário ou enviar. Nenhuma mensagem real foi enviada.
