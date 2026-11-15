# PRIME — refinamento comercial isolado

15/11/2026. Base preservada: 21e5b0dad3739d6ea9479bba7d2e9f83986d5ac6. Branch: work/prime-commercial-reasoning-fix. Não integra a PRIME V1 e não muda design, infraestrutura, banco remoto ou outras branches.

## Recuperação e leitura

O fetch remoto confirmou que work/prime-commercial-elite continua em 21e5b0d. Nenhuma alteração local em andamento foi encontrada antes de criar a branch isolada. CI histórico 43730490246 permanece aprovado. A suíte base foi novamente executada antes da modificação: 130 testes, 130 aprovados, zero falhas/skips. Não encontramos novos commits na branch PRIME nem incorporamos trabalhos de outras branches. Isso não pretende provar ausência de atividade fora da branch inspecionada.

PRIME_MANUAL_COMPLETO.md foi localizado e lido integralmente, linhas 1–1400, tamanho informado 104983 bytes. Kit 1.0 e agente master 1.2.0, de 15/11/2026. Foram lidas também as seções de abordagem, follow-up, objeções, pesquisa/qualificação, proposta, testes e modelos operacionais. Nenhum exemplo foi copiado para um catálogo de respostas ou injetado no prompt. O manual não foi publicado no repositório. Funcionalidades de pesquisa de leads, campanhas, CSV, CRM e PRIME V1 nele descritas continuam fora desta tarefa.

## Diagnóstico

1. O motor era pressionado a produzir uma mensagem, mesmo quando faltava razão para prospectar. O JSON tinha oportunidade desconhecida, mas não uma ação operacional para pesquisar ou não abordar. Uma pergunta educada sobre site acabava substituindo o motivo legítimo.
2. As instruções adicionais de abertura reforçavam esse comportamento: nome/nicho levavam a explorar necessidade plausível. Isso contradizia a preferência do manual por pesquisar ou não abordar sem gancho. Uma saudação em conversa ativa e prospecção fria não são situações equivalentes.
3. O modelo tinha campos de estratégia/evidência, mas não precisava resumir o trabalho do comprador, o papel concreto da página, por que contatar agora e qual progressão ajudaria. Assim podia perguntar arquitetura/estrutura antes de explicar utilidade.
4. O revisor validava segurança e coerência, mas a presença de nome/nicho e uma pergunta podia ser suficiente para aceitar uma mensagem genérica. O critério agora examina o argumento, o detalhe ignorado e a resposta ao pedido.
5. Declarações inbound eram duplicadas em commercialSignals e evidenceRegister, além de histórico/última mensagem. Removida essa cópia redundante sem apagar o histórico ou os pares de perguntas respondidas.
6. Contexto insuficiente continua um limite real. Não foi implementada pesquisa automática. A observação precisa vir do proprietário, com fonte/data; o Gemini não pode alegar consulta autônoma. A interface atual limita a observação pública a 200 caracteres, o que exige síntese fiel. Não ampliamos a interface nesta tarefa.

A política comercial foi consolidada por decisão/valor/progressão, com menos repetição. O tamanho do arquivo de política passou de 5864 para 5347 caracteres; isso não prova menor latência nem melhor conversão. O novo plano amplia a saída JSON: latência e qualidade precisam de teste real.

## Implementação

- contactPlan: action=draft/research/do_not_approach; strength=strong/plausible/insufficient; service=site/landing_page/none; fontes, trabalho do comprador, motivo, papel da página, próxima ação e pesquisa faltante. São sínteses verificáveis, não cadeia de pensamento interna.
- turnPurpose distingue cold_outreach de reply. Indicações antigas de estilo permanecem apenas como metadados de compatibilidade, sem impor cinco textos/roteiros de abertura.
- Prospecção fria sem observação válida ou necessidade registrada pede pesquisa antes de chamar a API. Marca, nome, nicho, objetivo de venda e portfólio não fundamentam abordagem por si sós.
- Se o modelo recomenda pesquisa/não abordar, nenhuma mensagem é salva como rascunho e não se substitui a recomendação por fallback comercial. Recomendações ao proprietário não são texto pronto para enviar ao lead.
- O bloqueio local identifica provider=rules, model=null: não finge que chamou Gemini. Decisão realmente recebida do modelo identifica provider=gemini, status=needs_context, sem mensagem pronta.
- Quando há contexto e o modelo escolhe redigir, geração original e revisão semântica integral permanecem. Uma oportunidade fraca na prospecção fria não se torna rascunho apenas porque o modelo marcou draft.
- Conversa ativa continua podendo esclarecer uma lacuna legítima; interesse explícito pede explicação útil antes de detalhes de execução. O serviço é um entregável com finalidade contextual, não promessa de vendas.
- O fluxo visual devolve pedido de pesquisa em vez de fallback Gemini falso. API sem telefone aceita pesquisa fornecida pelo operador no campo opcional research (observation/sourceUrl/verifiedOn).

Não há nova coleção de frases comerciais nem aumento de listas de palavras proibidas. Restrições de recusa, opt-out, privacidade, perguntas compostas e origem do provedor continuam preservadas.

## Testes e verificação real

Suíte atual: 141 testes, 141 aprovados, zero falhas/skips. Onze testes adicionados verificam pesquisa prévia, fonte antiga/incompleta, avanço em conversa ativa, persistência do plano, decisão de não abordar, impossibilidade de fundamentar contato só no catálogo, ausência de rascunho/fallback em recomendações, provedores corretos, memória sem duplicação e geração pesquisada sem telefone.

Os testes antigos de primeira abordagem foram ajustados para fornecer pesquisa fictícia quando precisam alcançar geração/regeneração/edição/concorrência; o caso vazio agora verifica pedido de pesquisa. O teste visual de concorrência passou a obter token de revisão e usar uma conversa ativa. Nenhuma funcionalidade foi removida para fazer testes passarem. Scripts de UI foram atualizados para esses estados, sem mudança no HTML/CSS. A validação desktop/mobile ocorrerá pelo CI da branch isolada. Não confundir provedor simulado no navegador com chamada real.

O script de chamada real foi executado somente até a verificação de disponibilidade: saiu com código 2 e mensagem de credencial dedicada ausente. Zero chamadas reais nesta rodada. O valor de chave não foi acessado, copiado ou mostrado.

Metadados públicos do GitHub confirmaram que gemini-v42-tests tem uma política de branch: work/v4.2-visual-copilot. A nova branch não está autorizada. A instrução atual proíbe alterar outras branches e infraestrutura. Portanto não alteramos policy, secret ou harness da branch anterior, nem tentamos contornar a restrição.

## Cinco cenários inéditos e controles prontos

Todos os nomes e pesquisas abaixo são fixtures fictícias. Domínios example.invalid não foram pesquisados nem apresentados como empresas reais. O JSON em evidence/prime-refinement/prepared-cases.json contém o contexto completo preparado; ele NÃO foi enviado ao Gemini.

| Cenário | Evidência preparada | Decisão a avaliar | Resposta real nova |
|---|---|---|---|
| Ipê Madeira Fictícia | Cozinhas autorais, link ao WhatsApp e busca delimitada sem domínio identificado | Motivo ligado ao portfólio; não afirmar ausência definitiva de site | Não executada |
| Bruma Cerâmica Fictícia | Coleção Terra, peças publicadas, perfil ativo e domínio não confirmado | Relacionar apresentação da coleção; rede social forte não prova necessidade de landing page | Não executada |
| Vértice Escola Fictícia | Turma de fotografia noturna leva à página geral de cursos; outra rota pode existir | Descobrir página específica antes de ofertar outra | Não executada |
| Rumo Idiomas Fictício | Lead aceitou explicação, informou programa pronto e link de inscrição | Explicar aplicação da página antes de perguntar hospedagem ou estrutura | Não executada |
| Trilha Viva Fictícia | Expedição específica desejada, bom institucional e receio de trocar agência | Responder à objeção, preservar fornecedor, sem prometer integração | Não executada |

Controles adicionais: Núcleo Delta Fictício com só nome/nicho (pesquisar antes), recusa e opt-out (nenhuma chamada nem abordagem). Não forçar uma mensagem para cumprir contagem quando o correto é não abordar.

O executor registra entrada, resposta inteira, plano, candidatos/rejeições, estágio/HTTP de erro e quantidade de chamadas, somente com dados fictícios. Há no máximo uma regeneração de qualidade, intervalo entre cenários, interrupção em quota e modelo aprovado fixo. Não habilita faturamento. Avaliação humana ainda precisa pontuar verdade, especificidade, oferta, naturalidade, interesse, objeção, próximo passo e respeito, usando trechos da resposta; nenhuma nota foi inventada para casos não executados.

## Comparação com a evidência anterior

As respostas de Marina/recepcionista nos JSONs da entrega 21e5b0d são reais daquela versão. Eram triagens educadas, baseadas sobretudo em nome/nicho, sem demonstrar uma oportunidade específica. Isso pode ser válido para responder a uma saudação, mas não comprova força comercial de uma prospecção. A correção distingue essas finalidades e permite não gerar mensagem quando a ficha não basta.

Não existem cinco respostas novas do Gemini para esta correção. Não substituímos essa lacuna por exemplos redigidos manualmente ou respostas de mocks. Não podemos afirmar que o refinamento aumentou interesse, que venceu a versão anterior ou que está comercialmente aprovado.

## Preservação e pendências

21e5b0d e a branch anterior permanecem intactos. Não há alteração em design, web/index.html, autenticação, schema/migrações, banco remoto, Prospecta, credenciais, Render ou envios de WhatsApp. Histórico/revisões, busca/arquivo, Modo Humano, análise e correção visual continuam sob os testes de regressão.

Limitação visível: a primeira abordagem independente na interface atual só coleta nome/nicho. Com Gemini configurado, esses dados sozinhos agora resultam em pesquisa necessária, em vez de texto genérico. A API pode receber pesquisa sem telefone; adicionar controles de pesquisa ao formulário não foi feito porque a interface/design não estão no escopo. Conversas visuais ativas sem telefone continuam funcionando. O proprietário pode manter e editar trabalho anterior; recomendações não apagam históricos nem rascunhos existentes.

Estado: correção implementada para validação, NÃO aprovada comercialmente. Falta executar os cinco cenários reais no commit candidato e avaliar integralmente as respostas, corrigindo eventual regressão antes de qualquer liberação.

Para desbloquear sem copiar credencial nem mudar infraestrutura: é necessária autorização específica para atualizar somente o workflow de testes em work/v4.2-visual-copilot, com checkout de um SHA imutável desta correção, mantendo o código daquela branch e o secret existentes. A alternativa é autorizar uma política adicional de branch no ambiente; não fizemos nenhuma das duas. A primeira opção é mais restrita e repete o mecanismo de testes já usado anteriormente.
