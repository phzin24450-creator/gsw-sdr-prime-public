# Gemini — integração preparada, ativação real pendente

## Diagnóstico

A versão publicada só consultava `OPENAI_API_KEY` e a OpenAI Responses API. Sem essa variável, retornava regras fixas; a credencial OpenAI testada anteriormente estava sem saldo. Não havia chamada ao Google. A tabela `drafts` também restringia o provedor a `rules`, `openai` e `rules_fallback`.

## Implementação nesta branch

- Provedor principal: Gemini, endpoint oficial `generativelanguage.googleapis.com`, `generateContent`.
- Modelo: `gemini-3.8-flash`, listado na modalidade gratuita na documentação oficial consultada em 08/11/2026 (São Paulo).
- Credencial: `GEMINI_API_KEY` apenas no ambiente seguro do Render. Nenhuma chave foi escrita no GitHub, no HTML ou em arquivo local.
- Sem ativação de cobrança, sem troca silenciosa para outro modelo ou provedor.
- Prompt inclui fatos e restrições da GSW, contexto comercial, últimas 12 mensagens, última mensagem completa e rascunhos anteriores marcados como não necessariamente enviados.
- Respostas contextualizadas para interesse, objeção, dúvida, qualificação, follow-up e aceite de encaminhamento. Pedido explícito de humano permanece bloqueado para geração e requer atendimento manual.
- Erros identificados: chave ausente/recusada, acesso negado, cota, modelo indisponível, timeout, rede, resposta incompleta e bloqueio de segurança. Texto bruto de erro do provedor não é exposto para evitar vazamento de credenciais. Bloqueio de segurança não produz fallback enviável.
- Provedor, modelo e motivo do fallback ficam no histórico, inclusive após edição e regeneração.
- Migração aditiva `db/20261109015059_gemini_provider_metadata.sql`: amplia o CHECK de provider e acrescenta generation_meta JSONB. Não apaga registros nem altera RLS ou credenciais.

## Evidências e pendências

49 testes locais passaram. As chamadas Gemini nos testes são **simuladas**, incluindo seis situações comerciais fictícias. O código de navegador verifica as etiquetas de regras locais e Gemini simulado em 360/1440px. Isso não substitui uma chamada real.

Conta Google AI Studio acessível: projeto `Default Gemini Project`, ID `gen-lang-client-0898581877`, modalidade **Free tier**. Não havia chave listada. Formulário de criação preparado para `GSW SDR PRIME V4 - Render`; criação ainda não confirmada.

O navegador do Render solicitou login, embora o conector Render continue conectado. Esse acesso de navegador é necessário para transferir a chave diretamente entre as interfaces sem revelá-la em chat ou código. Não foi iniciada cobrança.

Antes de publicar: concluir criação segura da chave, confirmar a configuração no Render, aplicar migração aditiva, executar teste real com leads fictícios e confirmar `provider:gemini` no painel. Não considerar esta branch ativada enquanto esses passos estiverem pendentes. A versão publicada foi mantida.

## Referências oficiais consultadas

- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/generate-content/text-generation
- https://render.com/docs/configure-environment-variables

A modalidade gratuita tem cotas e pode usar conteúdo para melhoria dos produtos Google, conforme seus termos. Os testes de ativação devem usar somente dados fictícios; não enviar informações jurídicas, médicas ou outros dados sensíveis.
