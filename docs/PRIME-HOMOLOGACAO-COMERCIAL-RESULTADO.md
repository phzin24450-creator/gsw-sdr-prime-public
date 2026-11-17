# Resultado da homologação comercial real

**REPROVADA. Não liberar para uso real.**

Código d644531bd3bcc5cd4aebc680cdf6c9b8151c9dea (correção 90b8690).
Execução: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43990469463
Workflow 9d8aa57e0a39d98c236a5294f3425c42ef1bec25. 16 chamadas, todas HTTP 200, sem 503. Cinco casos comerciais e três controles fictícios. Evidência integral: evidence/prime-stabilization-commercial-real.json.

| Caso | Automático | Avaliação comercial |
|---|---|---|
| Ipê | passou | reprovado: inventa Instagram no plano; pergunta pressupõe atendimento exclusivo pelas redes; acompanhamento e oferta antecipados |
| Bruma | passou | reprovado: concentração do catálogo extrapola link observado; pede interesse em site antes de verificar presença própria; pergunta ambígua sobre gestão e compra |
| Vértice | quality_block | não homologado: texto final contextual e pergunta útil; bloqueio por researchNeeded tratado como fato sem fonte; primeiro plano ainda presume dificuldade e conteúdos não confirmados |
| Rumo | quality_block | não homologado: segundo texto explica programa/link adequadamente; bloqueio por “nenhuma no momento” classificado fact/other; primeiro candidato confunde apresentação com decisão do aluno |
| Trilha | quality_block | bloqueio necessário: ambos os candidatos prometem independência/não interferência sem prova; reparo não elimina a premissa |
| Pesquisa insuficiente | passou, zero chamadas | controle aprovado |
| Recusa | passou, zero chamadas | controle aprovado |
| Opt-out | passou, zero chamadas | controle aprovado |

## Diagnóstico
O transporte funcionou nesta rodada, incluindo prompt completo, geração e revisão. Isso não demonstra resolução permanente nem causa raiz dos 503 anteriores.
Os 204 testes offline não garantem qualidade semântica. Revisor aprova premissas erradas quando as rotula observation/function/question com citações verdadeiras porém insuficientes.
A correção de isenções de planos também revelou falsos bloqueios: o revisor classifica status interno neutro de pesquisa como fato. Remover a checagem globalmente reabriria a brecha de premissas técnicas; não fazer isso para obter aprovação.

## Próximas correções necessárias
1. Separar status interno de pesquisa de alegações sobre o prospect no contrato; testar com o ledger real de Rumo/Vértice e preservar bloqueio das premissas de Trilha.
2. Reproduzir aprovação incorreta dos ledgers reais Ipê/Bruma, sem substituir seus domínios por anotações corretas e chamar isso de reprodução do erro original.
3. Corrigir a decisão de progressão e o revisor para exigir análise das premissas de perguntas e proposições compostas. Não confiar em citação literal como prova de implicação semântica.
4. Reparação de Trilha deve remover a garantia e respeitar agência, sem reescrever a mesma garantia como intenção.
5. Rodar suíte offline e avaliação real delimitada após correção. Nenhuma aprovação comercial até atender os critérios.

Não houve deploy, alteração de banco remoto ou WhatsApp real. Evidências preservadas, sem exposição de credencial ou pensamento. Esta rodada conclui a avaliação com reprovação; o sistema ainda precisa das correções acima.
