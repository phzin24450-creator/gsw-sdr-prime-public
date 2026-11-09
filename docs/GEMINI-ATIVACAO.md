# Gemini — validação em desenvolvimento

## Diagnóstico

A versão publicada só consultava `OPENAI_API_KEY` e a OpenAI Responses API. Sem essa variável, retornava regras fixas; a credencial OpenAI testada anteriormente estava sem saldo. Não havia chamada ao Google. A tabela `drafts` também restringia o provedor a `rules`, `openai` e `rules_fallback`.

## Implementação nesta branch

- Provedor principal: Gemini, endpoint oficial `generativelanguage.googleapis.com`, `generateContent`.
- Modelo: `gemini-3.1-flash-lite`, com entrada e saída gratuitas no projeto Free Tier. O teste no Render com `gemini-3.8-flash` retornou indisponibilidade e, nas tentativas seguintes, excedeu 25 segundos.
- Credencial: `GEMINI_API_KEY` apenas no ambiente seguro do Render. Nenhuma chave foi escrita no GitHub, no HTML ou em arquivo local.
- Sem ativação de cobrança, sem troca silenciosa para outro modelo ou provedor.
- Prompt inclui fatos e restrições da GSW, contexto comercial, últimas 12 mensagens, última mensagem completa e rascunhos anteriores marcados como não necessariamente enviados.
- Respostas contextualizadas para interesse, objeção, dúvida, qualificação, follow-up e aceite de encaminhamento. Pedido explícito de humano permanece bloqueado para geração e requer atendimento manual.
- Erros identificados: chave ausente/recusada, acesso negado, cota, modelo indisponível, timeout, rede, resposta incompleta e bloqueio de segurança. Texto bruto de erro do provedor não é exposto para evitar vazamento de credenciais. Bloqueio de segurança não produz fallback enviável.
- Provedor, modelo e motivo do fallback ficam no histórico, inclusive após edição e regeneração.
- Migração aditiva `db/20261109015059_gemini_provider_metadata.sql`: amplia o CHECK de provider e acrescenta generation_meta JSONB. Não apaga registros nem altera RLS ou credenciais.

## Evidências e pendências

49 testes locais passaram. As chamadas Gemini nos testes são **simuladas**, incluindo seis situações comerciais fictícias. O código de navegador verifica as etiquetas de regras locais e Gemini simulado em 360/1440px. Isso não substitui uma chamada real.

A chave substituta está mascarada no ambiente do serviço Render `gsw-sdr-prime-dev`, no projeto Google AI Studio Free Tier. A revogação da chave anterior está pendente. A migração aditiva foi aplicada ao Supabase antes da publicação.

Deploy validado: `dep-dbonmsjm8hqs73eg8n1g`, commit `832a02b52386bd64119c330794fe2abc906f02b2`.

- Oficina fictícia (final 0091): o Gemini abordou a consulta de etapas do serviço e perguntou sobre integrar ao site existente.
- Escola fictícia (final 0092): o Gemini relacionou a duplicidade de atendimento às solicitações de matrícula e perguntou pelo volume mensal.
- Nos dois casos, o painel exibiu **Gemini · IA generativa**. O PostgreSQL confirmou `gemini-3.1-flash-lite`, sucesso e modo `HUMAN`.
- A edição da escola foi salva no histórico, preservando a versão anterior e a etiqueta do provedor. A área de transferência recebeu o texto revisado. Um terceiro caso fictício confirmou o bloqueio por opt-out. Nenhuma mensagem foi enviada.
- Com o 3.8 Flash, a indisponibilidade e os timeouts foram exibidos ao lado do fallback de regras locais.

## Referências oficiais consultadas

- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/generate-content/text-generation
- https://render.com/docs/configure-environment-variables

A modalidade gratuita tem cotas e pode usar conteúdo para melhoria dos produtos Google, conforme seus termos. Os testes de ativação devem usar somente dados fictícios; não enviar informações jurídicas, médicas ou outros dados sensíveis.
