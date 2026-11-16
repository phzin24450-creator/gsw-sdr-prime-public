# PRIME — contrato único de revisão

Base: e6483d0. Branch: work/prime-commercial-reasoning-fix.

## Causa confirmada nas evidências

Rodada 4, Rumo: a mesma unidade foi rotulada commitment=functional_proposal, classification=supported e language=factual. O validador exigia prova de fato ocorrido para uma proposta. Bruma e Vértice: alguns pareceres omitiram todas as unidades do plano, devolvendo somente as da mensagem. O servidor bloqueou corretamente a cobertura incompleta, mas só o prompt solicitava que a lista fosse completa.

## Implementação

- A saída nova do Gemini não pede mais classification e language. Um único commitment (fact, functional_proposal, intention, question, unknown, greeting) é convertido pelo servidor para esses campos. O registro conserva labels históricos quando fornecidos para diagnóstico, mas não permite que contradigam o novo campo. Rejeição explícita permanece bloqueio.
- claimAudit usa esquema dinâmico com minItems=maxItems=número de unidades e enum dos IDs válidos. A validação local de unicidade e cobertura continua obrigatória. A omissão aponta exatamente cada ID, caminho e texto ausente para reparo.
- Propostas funcionais continuam exigindo apoio de fonte compatível. Citações falsas, contradições, acceptable=false e classificação explicitamente unsupported continuam bloqueando. A mudança não é uma aprovação automática de textos. O Gemini ainda pode errar semanticamente e isso precisa ser avaliado em chamadas reais.
- A suíte comercial aceita recomendação de pesquisa ou de não abordar como resultado técnico, quando existe plano e orientação concreta; marca requiresHumanAssessment. Quota, autenticação, conselho vazio e decisões incompatíveis com controles continuam falhando. Isso corrige o falso FAIL de Ipê sem declarar a oportunidade aprovada.

Referência primária consultada: https://ai.google.dev/gemini-api/docs/structured-output?lang=rest — suporte a minItems, maxItems e enum. Não foi usada fonte secundária para implementar o contrato.

## Testes

180 testes locais aprovados, zero falhas, incluindo sete novos testes sobre os JSONs reais da rodada 4, campos contraditórios, propostas legítimas, citações falsas, rejeição explícita, IDs omitidos e recomendação de pesquisa. Mocks e replay não comprovam acerto semântico do modelo.

Arquivos: src/claims.js, src/advisor.js, scripts/prime-round2-live.mjs, scripts/prime-live-outcome.mjs e test/claims-contract.test.js. Sem alteração de interface, banco, migração, envio ou infraestrutura. Workflows anteriores e segredos preservados.

## Validação real

Validar SHA fixo desta correção com os mesmos cinco cenários e três controles, usando ambiente e segredo já autorizados. Máximo de 20 chamadas, parada em quota/autenticação ou falhas repetidas. Avaliar o texto integral e a decisão; não reduzir o critério a HTTP ou liberação pelo validador. Nenhum deploy ou mensagem real faz parte da validação.
