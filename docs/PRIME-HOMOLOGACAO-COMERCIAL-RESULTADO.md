# Homologação comercial — concluída na suíte definida

Data: 24/11/2026. **Cinco cenários comerciais e três controles aprovados na mesma versão.**
Aprovação da amostra por avaliação editorial do assistente, além da revisão automática. Não houve aprovação humana adicional registrada nem publicação em produção.

## Versão e verificações

- Código validado: `8dc3b42b75c6d5189ab1ce96ec18b5e6561c967a`, branch `work/prime-commercial-reasoning-fix`.
- 221 testes locais passaram, zero falhas.
- CI aprovado, incluindo testes Node e interface nos dois modos de teste:
  https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/45478777717
- Suíte real: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/45478842600
- Workflow: `04bbeb4bce455d7ca8667ae390a3de4e4e771a15`, checkout fixado no código acima.
- 10 chamadas de um teto de 20, todas HTTP 200; zero retry, timeout ou rejeição nesta rodada.
- Cada mensagem comercial passou por geração e revisão semântica; os três controles usaram zero chamadas.
- Os commits posteriores que registram este relatório e as evidências alteram apenas documentação.

## Resultado

| Caso | Automático | Avaliação editorial |
|---|---|---|
| Ipê / portfólio | passou | aprovado: observação e descoberta de rota |
| Bruma / catálogo | passou | aprovado: detalhe específico e descoberta, sem oferta antecipada |
| Vértice / turma | passou | aprovado: pergunta pelo programa específico |
| Rumo / explicação | passou | aprovado: explica conteúdo e inscrição confirmados |
| Trilha / fornecedor | passou | aprovado: mantém agência e deixa formato sujeito a avaliação |
| Pesquisa insuficiente | passou | solicita pesquisa, sem geração |
| Recusa | passou | bloqueia continuidade, sem geração |
| Opt-out | passou | bloqueia contato, sem geração |

## Textos finais e avaliação

### ipe-madeira

> Olá, aqui é o Pedro, da PRIME. Notei que vocês publicam fotos das cozinhas autorais no perfil. Onde vocês costumam organizar ou apresentar esse portfólio de projetos para quem deseja consultar os trabalhos completos?

Avaliação editorial: Identidade PRIME explícita, detalhe observado e uma pergunta sobre a rota atual do portfólio; não inventa acompanhamento, plataforma nem ausência de site.

### bruma-social

> Olá, aqui é o Pedro da PRIME. Notei a coleção Terra e as peças de cerâmica autoral que você exibe no perfil. Como você organiza hoje o catálogo desses trabalhos para seus clientes?

Avaliação editorial: Usa coleção Terra e pergunta como o catálogo é organizado; não converte perfil em prova de necessidade de site. A pergunta é ampla, mas pertinente ao estágio de descoberta.

### vertice-turma

> Olá, aqui é o Pedro, da PRIME. Vi o post sobre a turma de fotografia noturna e notei que o link leva à página geral de cursos. Hoje, onde vocês costumam apresentar o programa detalhado dessa turma para os interessados?

Avaliação editorial: Distingue o destino observado da existência global de uma página; pergunta pela rota do programa antes de ofertar outra.

### interesse-explicacao

> A ideia da landing page seria organizar o que você já tem de forma direta. O conteúdo do seu intensivo para adultos ficaria estruturado em uma única página, apresentando os tópicos do programa e os detalhes que você já define, com o link de inscrição posicionado como o próximo passo claro para o interessado. É uma forma de concentrar essas informações em um ambiente focado, sem distrações, facilitando a consulta de quem acessa pelo seu link.

Avaliação editorial: Explica programa e link já confirmados, sem pergunta técnica desnecessária nem garantia de conversão. 'Sem distrações' é descrição do formato proposto, não alegação de resultado; pode ser encurtada pelo operador.

### objecao-fornecedor

> Respeito sua decisão de manter a agência atual cuidando do seu site. Como o objetivo é apresentar a expedição de observação de aves de forma dedicada, você prefere avaliar a estrutura desse conteúdo junto com eles antes de definirmos qualquer formato?

Avaliação editorial: Respeita a agência, liga o próximo passo à expedição e pergunta pela avaliação conjunta antes de definir o formato; mantém viabilidade técnica desconhecida.

## Causas corrigidas

1. O revisor aceitava premissas sem fonte sob classificações permissivas: acompanhamento inventado, plataforma não identificada, canal exclusivo/principal, conteúdo adicional e garantias técnicas. As respostas reais anteriores foram preservadas e usadas como regressões.
2. Havia falsos bloqueios de status neutro de pesquisa e intenção de respeitar fornecedor. Esses casos foram distinguidos de alegações factuais.
3. A tarefa do turno não restringia suficientemente a progressão: descoberta precede oferta; explicação usa conteúdo confirmado; objeção respeita a agência sem prometer independência.
4. Retry de transporte impedia reparo comercial mesmo com orçamento disponível. Agora há reparo independente quando cabem geração e revisão no teto de quatro chamadas.
5. A checagem determinística de premissas só ocorria após a revisão remota. Ela agora roda também antes dessa chamada, preservando orçamento de reparo e encaminhando o motivo específico. Teste reproduz o candidato real de Ipê após 503.

A última correção não alterou os critérios de aprovação nem dispensou revisão semântica da mensagem reparada.

## Transporte: resultado separado

O 503 foi observado em rodadas anteriores; sua causa raiz não foi estabelecida, nem demonstrada relação causal com MEDIUM. A comparação mínima anterior respondeu 200 em MINIMAL e MEDIUM. Nesta rodada completa, MEDIUM respondeu 200 em todas as dez chamadas. Isso confirma a execução desta amostra, sem provar eliminação permanente de indisponibilidade.

## Evidências e limites

- `evidence/prime-commercial-approved-real.json`: entradas, respostas, planos, auditorias e telemetria integrais da rodada aprovada.
- `evidence/prime-commercial-acceptance.json`: conclusão editorial separada dos resultados automáticos.
- `evidence/prime-supplier-accepted-real.json`: aprovação direcionada anterior de fornecedor.
- `evidence/prime-final-confirmation-preflight.json`: rodada anterior que motivou a checagem antecipada.
- Demais evidências e relatórios reprovados continuam no histórico e nos arquivos existentes; não foram apagados.

A homologação cobre a suíte definida e a versão identificada. Não demonstra qualidade perfeita para toda conversa futura, estabilidade contínua do provedor ou validação em produção. A revisão pelo operador e o envio manual continuam necessários. Nenhum deploy, alteração de banco remoto ou envio real foi realizado. O segredo dedicado foi usado somente no runner; nenhum valor foi lido ou registrado. Atualizações da branch ocorreram com conferência do SHA anterior, preservando trabalho existente.
