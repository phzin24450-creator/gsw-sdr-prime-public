# GSW SDR PRIME Híbrido — versão 0.3 (MVP de testes)

Backend Node.js para assistência comercial da GSW em português brasileiro. Baseado em fatos conhecidos da empresa, usa regras locais ou a API de IA configurada para produzir **rascunhos** a partir de mensagens recebidas do WhatsApp Business Platform. A revisão e o controle humano têm prioridade. **Ainda não envia mensagens automaticamente e não está em produção.**

## Entregas implementadas

- Webhook WhatsApp Cloud API: GET (challenge) e POST (assinatura HMAC-SHA256), deduplicação das mensagens de texto.
- Modos de atendimento: `HUMAN` (padrão), `AI_ACTIVE` (permite rascunhos), `HANDOFF_PENDING`, `PAUSED`.
- Pedidos explícitos de atendente e opt-out mudam o estado sem depender do modelo. Opt-out impede reativar IA pela API.
- IA de rascunho: regras pt-BR ou OpenAI Responses API opcional; histórico recente, setor, desafio e objetivo registrados pelo operador; preços/garantias não são inventados.
- Estado versionado: rascunhos que ficaram obsoletos após takeover humano, atualização de contexto ou nova mensagem são descartados.
- Revisão manual de rascunhos (`APPROVED`/`REJECTED`), **sem envio**.
- Qualificação preliminar: serviço de interesse, sinal explícito de urgência, informações faltantes e indicação de transferência, sem inventar orçamento ou decisor.
- Armazenamento persistente por PostgreSQL (quando `DATABASE_URL` existe) e trilha básica de auditoria; alternativa apenas em memória para testes.
- Exclusão administrativa de conversa e dados relacionados mediante confirmação explícita.
- Migrações SQL transacionais e schema dedicado `gsw_sdr` (não deve ser exposto no Data API do Supabase).
- Painel de testes em HTML acessível e testes com Node.

## Requisitos

Node.js 20+; PostgreSQL 14+ opcional no desenvolvimento e obrigatório antes de qualquer ambiente de produção. A biblioteca `pg` precisa ser instalada com `npm install` no ambiente de execução. A API de IA também é opcional.

## Iniciar localmente

```bash
npm install
cp .env.example .env
# Configure chaves aleatórias privadas no arquivo .env, sem publicar no GitHub.
# Preencha DATABASE_URL somente para usar PostgreSQL.
node --env-file=.env src/db/migrate.js    # somente se DATABASE_URL estiver definida
npm test
node --env-file=.env src/server.js
```

Abra `http://127.0.0.1:3000` e informe sua `ADMIN_API_KEY`. Se não configurar `DATABASE_URL`, o servidor usa memória e os dados serão apagados ao reiniciar. A variável `ENABLE_DEMO=true` habilita `/api/demo/inbound` para testes com números fictícios; mantenha `false` em produção.

`AUTO_DRAFTS=true` gera **rascunhos, não mensagens**, ao receber eventos Meta assinados. A execução ocorre em segundo plano no mesmo processo, **sem fila durável**; por isso esse modo é somente para desenvolvimento. A condição `AI_ACTIVE` e a versão atual são checadas antes de salvar o rascunho.

## Banco Supabase

Para banco criado via interface do Supabase, use **`db/supabase-setup.sql`** no SQL Editor de um projeto GSW de desenvolvimento, somente após revisar o script. Ele cria as tabelas no schema **`gsw_sdr`**, sem expô-las à API REST pública e ativa RLS sem políticas para o navegador. A alternativa para conexões diretas é `npm run db:migrate` com `DATABASE_URL`, que executa `db/001_init.sql` dentro de uma transação e grava a migração no mesmo commit. **Não execute `db/001_init.sql` isoladamente no SQL Editor sem antes fixar o schema.** Consulte `docs/SUPABASE.md`.

## Endpoints

| Método | Caminho | Comportamento |
|---|---|---|
| GET | `/health` | Sinal de vida, sem dados pessoais |
| GET | `/webhook/meta` | Verificação do Meta webhook |
| POST | `/webhook/meta` | Captura assinada de mensagens de texto |
| GET | `/api/conversations` | Lista administrativa |
| GET | `/api/conversations/:phone` | Histórico e rascunhos |
| GET | `/api/conversations/:phone/qualification` | Qualificação preliminar não verificada |
| POST | `/api/conversations/:phone/mode` | `{ "mode": "HUMAN" }`, por exemplo |
| POST | `/api/conversations/:phone/context` | `{ "sector": "...", "challenge": "...", "goal": "..." }` |
| POST | `/api/conversations/:phone/draft` | Gera rascunho sob demanda |
| POST | `/api/conversations/:phone/drafts/:uuid/review` | `{ "decision": "APPROVED" }` ou `REJECTED` |
| DELETE | `/api/conversations/:phone` | Apaga dados com JSON `{ "confirm": "DELETE" }` |
| POST | `/api/demo/inbound` | Apenas quando `ENABLE_DEMO=true` |

Todas as rotas `/api/` exigem `Authorization: Bearer <ADMIN_API_KEY>`. **Não existe endpoint de envio Meta**. Aprovar rascunho não envia WhatsApp. O painel usa uma única chave e não deve ser exposto publicamente antes de login por usuário, RBAC e proteção operacional.

## Segurança, LGPD e integração

- Não comitar `.env`, API keys, token Meta, string do banco, contatos reais, cases não autorizados ou dados de clientes em GitHub público.
- Dados reais só devem ser coletados com finalidade e base legal justificadas; confirmar requisitos de privacidade antes de processar mensagens pela API de IA.
- Uso de IA não equivale a consentimento do contato para mensagens de marketing. Mensagens iniciadas pela empresa dependem das políticas Meta, opt-in apropriado e modelos aprovados.
- O Prospecta utilizado anteriormente mostrou importação por planilha e não revelou API ou webhooks. Não há sincronização implementada e não se deve presumir acesso ao código-fonte do CRM.
- `gsw_sdr` é um schema interno para conexão direta do backend. Não adicione `gsw_sdr` à lista **Exposed schemas** do Supabase e não conceda acesso `anon`/`authenticated` às suas tabelas.

## Verificações

Execute `npm test`: **24 testes locais passando** na versão 0.3, incluindo webhook, handoff, opt-out, revisão, contexto, migração transacional simulada e qualificação. **Ainda não houve testes contra PostgreSQL/Supabase real, OpenAI real ou Meta real**. Na execução Work, a instalação de `pg` foi concluída e os 24 testes locais foram executados com sucesso. Consulte `docs/WORK-STATUS.md` para o estado atual das conexões e do deploy.

Consulte `docs/SEGURANCA-E-PENDENCIAS.md`, `docs/RELATORIO-TESTES.md` e `docs/WORK-HANDOFF.md` antes de publicar.
