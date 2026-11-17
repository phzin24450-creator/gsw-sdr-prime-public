# PRIME — desbloqueio comercial e investigação separada do 503

## Recuperação
Branch work/prime-commercial-reasoning-fix recuperada por leitura remota em a6dcf9a4192f46d6c9e41178623f7a4793c14bb7. Código 06bc2150c4dbde0beb1d25574e2554891fa884ae e baseline 8dc744752974c7e8c2dd61eef7f2e6a57fa17c20 preservados. Nenhum reset, force push ou substituição de evidências.

## Correção limitada
auditClaims dispensava evidência nos campos proposed_function/planned_action/research_status, inclusive quando o protocolo atual os classificava como fact. Agora a isenção histórica fica restrita a registros antigos sem commitment; no protocolo atual, fatos exigem suporte no domínio em todos os campos. Uma proposta funcional exige fonte funcional. Unknown e intention continuam possíveis sem provar ocorrência futura. A política de geração reforça preservação das lacunas, verificação de rota equivalente antes de recomendar construção e proibição de inventar conteúdos de programa.

Não é um detector semântico local: se o revisor atribuir domínio/relação incorretos a uma frase, ainda pode errar. Os testes usam anotações explícitas para verificar o contrato, sem alegar nova avaliação Gemini. Não há novos filtros de palavras nem mensagens prontas.

## Regressões e validação
test/commercial-stabilization.test.js lê as respostas MINIMAL originais em docs/evidence/prime-compact-partitions-real. Cobre qualidade, familiaridade, canal principal, efeito sobre acesso/decisão, condição técnica, quatro campos do plano e controles positivos.

12 verificações passaram em isolate JavaScript hospedado, usando o código alterado de claims.js e os corpos dos testes. Isso NÃO é execução local Node: imports Node e I/O de fixtures foram substituídos por conteúdo remoto e asserções mínimas. Registro em docs/evidence/prime-stabilization/hosted-contract-checks.json.
O ambiente desta sessão não tem executor/terminal. npm test e integração/UI NÃO executados. Os 192 testes preservados são evidência anterior a esta correção, não aprovação dela.

Para validação local quando houver executor: checkout isolado da branch/commit exato, sem descartar alterações; instalar dependências com npm ci --ignore-scripts; executar node --test test/commercial-stabilization.test.js e depois npm test, sem credenciais de produção/Gemini e sem banco remoto. Revisar scripts e configuração antes de executar. Não usar scripts *live*. Não declarar homologação até concluir a suíte e a avaliação comercial.

## 503: evidência separada
Evidência a6dcf9a: quatro chamadas HTTP 503 na geração, em dois casos, antes de haver texto; durações 3646, 42548, 3044 e 6489 ms. Revisão não chegou a executar nessa rodada. Nenhum 400/401/403/429 registrado. A rodada MINIMAL anterior teve respostas HTTP 200 e falhas comerciais; Bruma teve timeout de revisão sem status, evento distinto.
Conclusão limitada: indisponibilidade observada; causa raiz e associação com MEDIUM desconhecidas. Não atribuir a quota, chave, faturamento nem raciocínio sem comparação controlada. Não alterar nível, retry ou timeout nesta correção.

## Procedimento futuro para aprovação (NÃO EXECUTADO)
Primeiro concluir testes offline e congelar o commit. Depois, somente com aprovação específica:
1. Comparação de transporte com dois pedidos sequenciais fictícios mínimos, mesmo modelo/prompt/schema/limite de saída e timeout; variar apenas MINIMAL versus MEDIUM. Sem retry automático nessa comparação, teto de duas chamadas, parar no primeiro 503/429/erro de autenticação ou configuração; comparação incompleta deve ser registrada como tal.
2. Coletar apenas status, etapa, duração, nível solicitado, tamanho e contagens enumeradas de tokens/finishReason; nunca chave, cabeçalhos, pensamento ou corpo bruto de erro. Credencial e meio seguro de execução serão definidos em autorização separada; nenhum workflow protegido será alterado ou acionado.
3. Se transporte funcionar, apresentar resultados antes de solicitar rodada comercial separada. Não usar sucesso de transporte como aprovação comercial. Rodada comercial futura precisa de teto próprio e revisão humana integral de plano/mensagem dos cinco casos, mais controles de recusa/opt-out/pesquisa insuficiente sem chamada.

Sem aprovação solicitada agora: a preparação offline ainda está pendente da suíte Node. Nenhuma chamada Gemini, deploy, banco remoto, credencial ou workflow protegido tocado.

## Estado
Correção candidata; NÃO homologada. Falhas comerciais independentes do 503. Testes locais completos e avaliação real futura pendentes.
