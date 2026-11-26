# PRIME — correção posterior à rodada real 2

Branch: `work/prime-commercial-reasoning-fix`. Base preservada: `22cf336e567d211a12defd23c13e6f37d759fbc2`. Código anterior da rodada: `89afcbf`. Execução de referência: 43789200133. Nenhuma nova chamada real ao Gemini nesta correção.

## O que mudou

O servidor atribui um papel ao trecho auditado, independente do domínio escolhido pelo revisor:

- `uncertainty`: lacuna interna declarada ou interlocutor literalmente desconhecido.
- `greeting`: saudação neutra, sem alegação adicional.
- `proposed_function`: função proposta para a página no plano.
- `planned_action`: próximo passo planejado.
- `research_status`: pesquisa pendente no plano.
- `assertion`: afirmações restantes, incluindo a mensagem ao cliente.

Lacunas e saudações não precisam de uma fonte que prove sua ocorrência. Propostas não precisam comprovar que uma ação futura já aconteceu. A mudança remove falsos positivos sem isentar semanticamente o conteúdo: se o revisor encontrar uma premissa não sustentada, contradição ou fonte citada fora de escopo, ela continua bloqueada. Campo interno com cargo afirmado, como proprietário, continua sendo alegação de identidade. Uma promessa técnica dentro de pageRole continua sujeita ao julgamento semântico e pode ser reprovada.

O código não interpreta sozinho toda a língua natural. Uma proposição indevida classificada incorretamente pelo Gemini ainda pode passar em uma categoria errada. Esta entrega não comprova que esse problema foi resolvido no modelo. Não se deve declarar todos os erros factuais eliminados com base nos testes simulados.

## Reparo com motivo concreto

Antes, o servidor produzia códigos de erro e enviava ao gerador o parecer semântico elogioso. Isso deixava a orientação contraditória.

Agora os bloqueios locais geram achados com código, ID, caminho, texto literal e razão. Eles chegam como dados estruturados em `repairFindings`, ao lado do candidato rejeitado e do contexto original. O parecer original é preservado como `reviewerFeedback` para diagnóstico. Elogio do revisor não vira orientação de reparo quando há bloqueio. Críticas explícitas (dimensão revise ou unsupportedClaims) continuam sendo encaminhadas, sem perder a premissa que precisa de correção. Não existe mensagem substituta pronta nem biblioteca de respostas.

Exemplos de contrato, não respostas novas do Gemini:

| Situação | Antes | Agora |
|---|---|---|
| `interlocutor: Desconhecido`, sem citação | claim_not_entailed | Lacuna interna aceita |
| `unknowns: cargo`, com language=omit | Bloqueio como se a mensagem contivesse alegação a remover | Omissão na mensagem é compatível com lacuna interna |
| Próximo passo planejado sem evento ocorrido | Exigência de comprovação externa | Não exige prova da ocorrência futura; premissas seguem auditáveis |
| Mensagem afirma independência da agência sem base | Parecer elogioso e código genérico enviados juntos | Achado aponta trecho literal e falta de suporte; elogio fica apenas no diagnóstico |
| Campo interlocutor afirma proprietário sem fonte | Afirmação indevida | Continua bloqueado |

## Arquivos e testes

- `src/claims.js`: papéis definidos pelo servidor, correção dos falsos positivos e achados para reparo.
- `src/advisor.js`: transporte dos achados estruturados e preservação separada do parecer original.
- `test/claims-round3.test.js`: sete regressões novas, incluindo reprodução dos metadados da rodada real 2 e reparo com parecer contraditório.
- Este relatório e logs de validação em `docs/evidence/prime-next-correction/`.

170 testes Node aprovados, zero reprovados. Foram preservados os 163 anteriores. Os testes usam anotações e transportes fictícios: provam o comportamento do contrato e do fluxo de reparo, não uma melhora já observada nas respostas reais do Gemini.

Interface em 360 e 1440 pixels aprovada nos modos local e Gemini simulado: login, modo Humano, edição, cópia, regeneração, histórico, opt-out, arquivamento, ausência de overflow e revisão visual. Não houve Android físico.

## Limites e próxima validação

Não houve deploy, migração, acesso ao banco remoto, alteração do Prospecta, design, workflow, credencial ou restrição de segredo. A branch V4.2 permanece com o workflow da rodada anterior. Nenhum serviço pago foi ativado. Nenhuma mensagem real enviada.

Próximo passo proposto: repetir os cinco casos com o futuro SHA exato desta correção, após aprovação específica. Medir falsos positivos, alegações indevidas que escapem, qualidade do reparo e força comercial das mensagens. Permitir recomendação de pesquisa como resultado comercial válido; não forçar cinco mensagens prontas. Preservar limites de chamadas e ambiente dedicado. Não executar novamente o workflow fixado em 89afcbf para alegar teste do código novo.

Estado: correção local candidata validada; qualidade comercial e eficácia semântica pendentes de nova avaliação real. Não recomendar publicação nesta etapa.
