# GSW SDR PRIME V4 — validação do ambiente de desenvolvimento

Data: 08/11/2026 (America/Sao_Paulo).

## Versão publicada

- Serviço existente: `gsw-sdr-prime-dev`.
- URL: https://gsw-sdr-prime-dev.onrender.com/
- Repositório existente: `phzin24450-creator/gsw-sdr-prime-public`.
- Commit de código: `bd8a278ac740fa395e19476a12bad385755e3e0c`.
- Deploy Render: `dep-dbodq8jm8hqs7389ms50`, live em 08/11/2026 às 17:36 (São Paulo).
- Branch de implementação: `work/v4-copiloto`; integrada por fast-forward à branch de desenvolvimento já configurada, `work/v0.3-infra-tests`. `main` não foi alterada.
- PR: https://github.com/phzin24450-creator/gsw-sdr-prime-public/pull/2

## Mudanças

O design V2 aprovado foi usado diretamente como base de cores, tipografia, cartões, navegação e responsividade. O protótipo demonstrativo foi substituído por chamadas autenticadas ao backend existente.

A solicitação manual do operador pode gerar sugestões em HUMAN sem mudar o modo. A geração automática continua exigindo AI_ACTIVE. PAUSED, HANDOFF_PENDING, opt-out e mudanças de versão impedem sugestões obsoletas. Não existe endpoint de envio.

O fluxo permite selecionar conversa, colar mensagem, sugerir resposta, editar, salvar, copiar e regenerar. A resposta aparece junto à ação; o histórico recupera mensagens e versões do servidor. O contexto é vinculado à conversa ativa, com aviso de possível inconsistência entre mensagem jurídica e setor incompatível. Não há alegação de classificação infalível.

Mensagens manuais consecutivas iguais são bloqueadas, com opção explícita para registrar uma repetição genuína. A versão otimista impede concorrência entre geração, edição e mensagens novas.

## Banco preservado

Nenhuma migração ou alteração de permissões foi aplicada. As cinco tabelas existentes no schema `gsw_sdr` foram preservadas. A restrição de um rascunho corrente por mensagem foi mantida: versões anteriores ficam em `audit_events` como `DRAFT_REVISION`, com leitura autenticada no histórico.

A conexão existente PostgreSQL/Supabase, o certificado CA, RLS, autenticação do operador, cookies, CSP por nonce, proteção de origem e limites de payload foram mantidos. Nenhuma credencial entrou no frontend ou no repositório.

## Evidências automatizadas

Workflow completo aprovado:
https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/42520766033

Trechos do log:

```text
# tests 38
# pass 38
# fail 0
UI PASS 360 login/HUMAN/edit/copy/regenerate/reload/optout/no-overflow/CSP
UI PASS 1440 login/HUMAN/edit/copy/regenerate/reload/optout/no-overflow/CSP
```

As capturas estão no artefato `v4-ui-evidence` desse workflow. Foram inspecionadas nas duas larguras. Os testes de navegador usam apenas credenciais e conversas fictícias; não utilizam dados comerciais reais.

O teste de armazenamento usa o motor PostgreSQL via PGlite, executando o código SQL do adaptador: gravação, edição, regeneração, reconexão, histórico, duplicação e opt-out. Ele não substitui a validação do serviço Supabase real, registrada abaixo.

## Integração de IA: bloqueio externo

O código usa OpenAI Responses API somente no servidor, com `store:false`, timeout, instruções comerciais e fallback explícito. Testes controlados verificaram resposta simulada e falha do provedor.

O teste real da chave previamente autorizada retornou **HTTP 429 / `credit_balance_exhausted`** em 08/11/2026. Portanto, geração real com OpenAI **não está aprovada nem ativa**. O Render continua operando por regras locais, identificadas na resposta. A chave não foi adicionada ao Render nesta entrega; a ativação depende de saldo de API e configuração segura seguida de teste real.

Não foram criadas novas chaves nem contratados créditos. O plano ChatGPT não deve ser apresentado como saldo da API.

## Rollback

Versão anterior conhecida: commit `99aacbf3fe626c6caa16f54fab5b3d1fe072db3d`, deploy `dep-dbnmp7rbc2fs73fj1370`.

Se necessário, usar a ação Rollback desse deploy no painel Render, desde que o artefato ainda esteja disponível, ou publicar o commit anterior. Confirmar o deploy resultante e testar `/health` e `/ready`. Como não houve migração de schema, o código anterior continua compatível com as tabelas. Rollback de aplicação não apaga mensagens, revisões ou outros dados. Manter auto-deploy desligado durante a recuperação.

## Limites de escopo

Prospecta, repositório privado original e configuração do WhatsApp não foram modificados. Nenhuma mensagem foi enviada pelo WhatsApp. O serviço continua no ambiente de desenvolvimento, com o acesso de operador existente. O plano gratuito pode entrar em suspensão por inatividade.

## Verificação após publicação — Supabase real

Teste HTTP autenticado no serviço publicado, com conversa fictícia:

```json
{"result":"PASS","health":"v4.0.0","ready":200,"storage":"postgres","modePreserved":"HUMAN","draftEditRegenerateHistory":true,"historyVersions":3,"duplicateBlocked":true,"staleEditBlocked":true,"optOutBlocked":true,"noSendRoute":404,"logoutRevoked":true}
```

Uma consulta independente no Supabase confirmou a conversa em HUMAN, uma mensagem persistida e duas revisões arquivadas após geração/edição/regeneração. Depois foi validado o bloqueio por opt-out. O registro fictício `000000040008` ficou pausado por opt-out. A limpeza solicitada ao conector Supabase não foi executada: a confirmação exigida pelo serviço expirou. Nenhum contato comercial foi usado ou apagado.

O HTML publicado respondeu HTTP 200 com os controles Copiar resposta e Salvar edição. `/health` informou `v4.0.0`, `autoSend:false`, `storage:postgres`; `/ready` respondeu 200. Os logs do Render confirmaram inicialização em `0.0.0.0:10000 (PostgreSQL)`.
