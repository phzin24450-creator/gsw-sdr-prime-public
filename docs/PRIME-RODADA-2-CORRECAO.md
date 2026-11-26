# PRIME — correção comercial, rodada 2

## Estado e limites da entrega

Trabalho na branch `work/prime-commercial-reasoning-fix`, a partir de `4e9bec6c843c38cd0742eae87f854c02f6537521`. Referência anterior preservada: `e20e4bf2938c04c341814f32eca31b413650189a`. Não foram executadas novas chamadas reais ao Gemini. Esta é uma correção candidata validada localmente, não aprovação da qualidade comercial.

A branch `work/v4.2-visual-copilot` permanece em `4cde5f946521be59bf75ef1e01106000d2675936`. Nenhum workflow existente, permissão, ambiente ou segredo foi modificado. Não houve deploy, migração remota, exportação de dados, envio WhatsApp ou contratação. A aplicação atual e o design foram preservados; PRIME V1 não foi iniciada.

## Material lido e diagnóstico

Foi lido integralmente o relatório `PRIME_Gemini_Resultados_Reais_2026-11-15.md` e seus oito JSONs da execução [43762062968](https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43762062968). As evidências sintéticas originais estão preservadas, sem alteração, em `test/fixtures/prime-round1/`.

| Caso | Contexto fornecido | Onde houve a extrapolação | Falha da revisão anterior |
|---|---|---|---|
| Ipê | Perfil com cozinhas; domínio não localizado em busca delimitada | `contactPlan.contactReason` passou a “utiliza apenas o Instagram”; `interlocutor` virou proprietário; mensagem elogiou execução como “muito bem feitas” | Tratou o perfil como prova de exclusividade, plataforma e qualidade; conferiu existência de fonte, não a implicação da alegação |
| Bruma | Coleção Terra, catálogo social; presença própria desconhecida | `contactReason` afirmou ausência de domínio; `knowledge.indications` afirmou que não há domínio registrado; mensagem disse “acompanho” | Checou a alegação mais fraca “não identificado”, sem reprovar o plano mais forte; confundiu consulta com familiaridade |
| Vértice | Botão leva a página geral; programa não visto naquela seção; outra rota pode existir | Plano afirmou ocultação/perda de especificidade, disse que nenhuma pesquisa faltava e antecipou página dedicada | Não houve parecer final: timeout na revisão. O candidato não comprova aprovação |
| Rumo | Pedido de explicação; programa para adultos e link já existentes | Mensagem passou de função proposta a efeito comportamental certo: “filtra”, “reforça a decisão” | Checou programa/link, mas aceitou o efeito causal como função da página |
| Trilha | Site bom; agência existente; cliente não quer troca | Plano declarou independência como confirmada e nenhuma evidência faltante; mensagem garantiu ausência de interferência | Usou `policy:portfolio` como se comprovasse arquitetura, contrato e operação; não respeitou a incerteza sobre a agência |

Raiz compartilhada: o gerador podia repetir versões contraditórias da mesma interpretação em `knowledge`, `focus`, `opportunity`, `evidence` e `contactPlan`. O validador verificava IDs e citações existentes, mas o revisor escolhia as alegações a conferir e podia substituir a proposição por uma mais fraca. Uma fonte verdadeira acabava validando um texto que não decorria dela.

## Implementação

### Registro de alegações e revisão

`src/claims.js` cria o inventário no servidor, antes da revisão. Enumera literalmente todos os trechos da mensagem e os campos narrativos do plano, com ID e origem. O revisor não escolhe uma lista conveniente de fatos nem pode substituir o texto auditado. Campos históricos adicionais, quando presentes, também são enumerados.

Cada entrada de auditoria registra:

- ID que aponta à alegação literal e ao caminho no plano/mensagem.
- Classificação: sustentada, inferência admissível, hipótese, não sustentada ou trecho não assertivo.
- Domínio da afirmação, linguagem permitida e ação necessária quando falta comprovação.
- Fonte, citação literal e relação: implica, apoia possibilidade, não estabelece ou contradiz.
- Justificativa e decisão sobre o trecho.

O código exige cobertura completa e única: rejeita IDs ausentes, duplicados ou desconhecidos, citações inexistentes, hipóteses promovidas a fatos e pareceres incompletos. O registro preservado usa o texto original do servidor, mesmo se o revisor devolver uma paráfrase adicional. A política comercial da PRIME só pode sustentar identidade/oferta/função; não comprova resultados ou independência técnica. Observações públicas limitadas não comprovam ausência global, exclusividade, familiaridade ou qualidade de execução. Declarações explícitas do cliente têm alcance distinto, mas ainda precisam implicar a conclusão.

O revisor recebe o plano e a mensagem em unidades e avalia separadamente `factualSafety`, `planQuality` e `messageQuality`. Uma mensagem segura não compensa plano errado; um plano correto não compensa texto genérico. O feedback concreto e o registro de alegações são preservados nos candidatos rejeitados. Continua havendo no máximo uma regeneração por qualidade, sem biblioteca de textos prontos.

**Limite importante:** o código garante cobertura, proveniência, restrições de escopo e tratamento do resultado. A classificação semântica continua sendo realizada pelo Gemini. Se ele classificar mal uma afirmação, a qualidade ainda pode falhar. Os testes simulados não demonstram que o Gemini fará esse julgamento corretamente. Isso só será avaliado na rodada real autorizada pelo proprietário.

### Planejamento e contexto

O formato de geração foi reduzido para plano comercial, estratégia, interlocutor, desconhecidos e texto. Os blocos redundantes deixaram de ser exigidos nas novas gerações; registros históricos não são reescritos. O registro auditado substitui a repetição das mesmas alegações em vários blocos. Campos antigos continuam legíveis, sem migração de banco.

A política orienta a escolha de uma progressão vinculada à evidência: verificar rota equivalente quando desconhecida, explicar utilidade quando solicitado e respeitar fornecedor existente sem garantir independência. Preserva funções concretas de site/landing page e permite explicações sem pergunta final.

As fontes carregam escopo de autoridade. O interlocutor informado manualmente passa a ter entrada própria no registro de evidências. Observações não são cortadas silenciosamente em 200 caracteres: no motor e no fluxo visual, observações até 1.000 caracteres são preservadas; acima disso não habilitam a pesquisa. O limite existente de 200 caracteres no cadastro de contexto das conversas permanece; não foi alterado banco ou interface. Essa proteção adicional evita perder ressalvas ao receber pesquisa pelo fluxo sem telefone. Não era a causa comprovada dos cinco fixtures antigos, cujas ressalvas já estavam presentes.

### Tempo e confiabilidade

A execução anterior registrou 13 chamadas: 2 + 2 + 3 + 2 + 2. Os quatro casos completos duraram 26.101, 17.247, 5.219 e 7.712 ms. Vértice registrou três chamadas, um candidato e timeout em `semantic_review`.

Com o código anterior, três chamadas e um candidato sem rejeição de qualidade são compatíveis com uma repetição da geração por HTTP 500/502/503/504. O status intermediário e os tokens não foram registrados: não é possível confirmar especificamente 503, quota, latência de rede ou causa no provedor. Não foi identificado um defeito que comprove a causa do timeout remoto. Não afirmo que o timeout real esteja resolvido.

Agora cada chamada registra somente: etapa, tentativa, bytes da requisição, duração, status HTTP, código de falha, motivo de término conhecido e contagens de tokens fornecidas pelo provedor. Não registra URL com chave, cabeçalhos, corpo de erro ou credencial. Métricas persistem também nas falhas. Não há valor estimado inventado quando o provedor não informa tokens.

Os limites continuam em 45 segundos por chamada. Foram acrescentados teto total de 180 segundos e máximo de quatro chamadas por geração completa. O timeout é separado por etapa e cobre leitura do corpo; não há repetição automática de timeout, quota ou autenticação. A repetição de erro transitório e a correção de qualidade compartilham o orçamento existente. O teto de saída continua em 2.048 tokens: uma revisão truncada por `MAX_TOKENS` falha e não vira resposta revisada. A adequação desse orçamento ao novo contrato será medida na rodada real; poderá exigir compactação posterior, nunca aprovação de saída incompleta.

## Exemplos comparativos

**Os exemplos abaixo são redações editoriais de comportamento esperado, não respostas novas do Gemini, nem textos instalados no produto.** Os originais reais completos continuam nos oito JSONs da rodada 1.

| Caso | Antes: trecho real problemático | Depois: exemplo editorial proporcional |
|---|---|---|
| Ipê | “as cozinhas autorais estão muito bem feitas”; “concentram ... no Instagram” | “Vi as cozinhas autorais no perfil de vocês. Uma página poderia apresentar esses projetos com os detalhes que vocês quisessem destacar. Vocês já têm um endereço com esse portfólio?” |
| Bruma | “Acompanho o trabalho”; plano: “ausência de domínio próprio” | “Vi as 40 peças da coleção Terra no catálogo. Para uma página da coleção ter utilidade, ela precisaria apresentar algo que vocês queiram destacar além das peças. Existe algum conteúdo da coleção que vocês gostariam de reunir junto delas?” |
| Vértice | Oferta de página dedicada antes de verificar rota equivalente | “No post da turma de fotografia noturna, o botão abriu a página geral de cursos. Vocês têm uma página com o programa dessa turma?” |
| Rumo | “serve como um filtro ... reforça a decisão” | “A página poderia apresentar o programa do intensivo para adultos e reunir as informações que vocês consideram importantes antes da inscrição. O botão levaria ao link que vocês já utilizam.” |
| Trilha | “não toca em nada ... nem interfere no trabalho da sua agência” | “Entendi que vocês querem manter o site e a agência. Podemos estudar uma página para apresentar a expedição, mas seria preciso avaliar com vocês as condições para isso. Vocês querem considerar essa possibilidade com a agência atual?” |

Esses exemplos ilustram o limite factual e a progressão. Não são aprovação comercial: o caso Bruma, por exemplo, ainda pode exigir mais pesquisa para existir motivo forte de contato. O teste real deve permitir recomendar pesquisa ou não abordar, sem forçar uma mensagem apenas para preencher a saída.

## Validação local

- 163 testes Node aprovados, zero reprovados, zero ignorados. Os 141 anteriores foram preservados e 22 regressões/contratos foram adicionados.
- Regressões usam as proposições dos arquivos reais da rodada 1, com anotações explícitas. Provam que o contrato rejeita fontes fora de escopo, omissões, citações inventadas e classificações inconsistentes. Não são chamadas ao revisor Gemini.
- Testes positivos preservam benefício funcional condicional, ausência explicitamente declarada pelo cliente, alternativas de um único assunto e explicação sem pergunta.
- Integração simulada confirma que crítica do plano leva a uma única regeneração e que falha da revisão não salva o candidato como revisado.
- Timeout, HTTP 503 seguido de recuperação, ausência de repetição de 401/429, falha de rede e revisão truncada possuem cobertura. Telemetria não expõe o segredo fictício usado no teste.
- Interface em navegador headless: 360 e 1440 pixels, modo local e Gemini **simulado**, com login, Modo Humano, edição, cópia, regeneração, histórico, recusa/opt-out, arquivo, responsividade e revisão visual. O teste de UI existente usa transporte simulado; o novo contrato de alegações é coberto pelos testes de integração Node. Não houve Android físico.
- O navegador padrão não estava instalado e o Chromium do sistema não abriu por limitação do ambiente; foi utilizado o headless já disponível nas dependências locais, sem alterar o projeto.
- O executável de rodada real foi preparado, mas sua trava de autorização foi testada: encerrou sem nenhuma chamada.

Logs e resumo estão em `docs/evidence/prime-round2/`. Nenhum arquivo da aplicação em V4.2 ou workflow foi modificado.

## Arquivos alterados

- `src/claims.js`: inventário literal, contrato de auditoria, limites de escopo e validação.
- `src/advisor.js`: geração compacta, integração do registro, parecer por dimensão, telemetria e limites por chamada.
- `src/brand.js`: planejamento fundamentado e progressão por estágio; nenhuma coleção de mensagens.
- `src/commercial.js`: proveniência, escopo e preservação das ressalvas da observação.
- `src/visual.js`: rejeita truncamento de pesquisa fornecida no fluxo visual.
- `test/claims.test.js`, `test/helpers/claim-review.js`, dois testes existentes adaptados ao novo contrato e os oito fixtures originais.
- `scripts/prime-round2-live.mjs`: suíte real preparada, inativa até aprovação.
- Este relatório e evidências locais.

## Plano de validação real — precisa de aprovação separada

Não reutilizar a autorização anterior como autorização desta rodada. O workflow antigo continua fixado em `e20e4bf` e não será modificado.

Proposta concreta: após aprovação, adicionar **um novo arquivo de workflow de teste** na branch permitida `work/v4.2-visual-copilot`, sem código de aplicação nela, com checkout pelo SHA completo do commit candidato entregue. Manter o workflow anterior intacto. Usar exatamente o ambiente `gemini-v42-tests` e o segredo `GEMINI_V42_TEST_API_KEY`, sem mudar restrições ou valores. Permissões `contents: read`, checkout sem credenciais persistidas, instalação com scripts desativados, segredo somente no passo do script, sem deploy.

Executar `scripts/prime-round2-live.mjs` com habilitação explícita `PRIME_ROUND2_REAL_AUTHORIZED=yes`. O script contém os mesmos cinco casos fictícios da rodada 1 para comparação direta e os controles de pesquisa insuficiente, recusa e opt-out. Modelo `gemini-3.1-flash-lite`, sem ferramentas pagas. Verificar novamente disponibilidade gratuita e configuração segura antes de disparar.

Orçamento: normalmente dez chamadas (geração + revisão de cinco casos); máximo vinte, contando uma correção por caso. Pausa de oito segundos entre casos. Interromper novas gerações em quota/autenticação/modelo/configuração inválida, orçamento esgotado ou duas falhas de disponibilidade/timeout. Não repetir a suíte inteira automaticamente.

Evidências: contexto integral fictício, candidatos, planos, registro de alegações, fontes, rejeições, resposta final, avaliação do revisor e telemetria. Retenção proposta de 14 dias. Avaliar separadamente segurança factual, qualidade do plano, força comercial, revisão e confiabilidade. Confrontar os cinco resultados com os registros anteriores e apresentar mensagens completas, inclusive falhas. Não declarar qualidade comercial aprovada só porque o contrato passou.

**Pendente:** autorização para o novo workflow restrito e uma única rodada real. Nenhuma autorização de deploy, migração ou uso real está incluída.
