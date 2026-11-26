# PRIME — homologação da estabilização comercial

## Resultado técnico confirmado
Código corrigido: 90b8690d6dc31d3e274eab9954b6cc12768ae533.
Commit executado no CI: b1760a936eebd2e272bff75c889a4fb8e4631e3b (mesmo código, adicionado apenas registro documental).
Execução: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43987384303
Job 133718937940; Node 22.23.4.

- npm test: 204 testes, 204 aprovados, zero falhas/cancelados/ignorados.
- UI RULES: 360 e 1440 aprovados.
- UI SIMULATED_GEMINI: 360 e 1440 aprovados.
- Upload de 6 capturas concluído. Capturas geradas pelo CI; não inspecionadas visualmente nesta sessão.
- Artefato: 14285419422, v4-ui-evidence, 4360472 bytes.
- Digest informado pelo GitHub: sha256:37c3de319f0b6a8f551ba8ec59609bc5389e8fb80741fd6c9cc7c3bc7cc76be1. Sem download/verificação independente.
- Evidência textual resumida em docs/evidence/prime-stabilization/node-ui-ci-summary.txt.

O bloqueio de executor local foi contornado usando o CI existente, sem modificar workflows. Não se trata mais apenas de testes em isolate: a suíte completa executou em Node no GitHub. O registro anterior de pendência local permanece como histórico; este resultado o atualiza.

## Escopo da aprovação
Aprovado tecnicamente nos testes automatizados executados, incluindo regressões do contrato factual, fluxo humano, edição/cópia, histórico, recusa/opt-out, concorrência, persistência PostgreSQL via PGlite isolado, arquivamento/restauração e fluxo visual com provedor simulado.
UI é Chromium em viewports, não Android físico. Nenhum resultado comprova disponibilidade de produção ou migração em banco remoto.

## Avaliação comercial das evidências reais preservadas
| Caso | Falha preservada | Condição de aceite futura |
|---|---|---|
| Ipê | qualidade, familiaridade e canal principal sem prova | observação delimitada, sem elogio inventado; verificar endereço equivalente |
| Bruma | busca incompleta convertida em ausência e oferta antecipada | preservar presença própria desconhecida e verificar rota existente |
| Vértice | dificuldade presumida e recomendação antes de verificar rota | verificar página específica antes de pedir aceite de construção |
| Rumo | conteúdos não confirmados e efeito sobre decisão | explicar programa/link confirmados, sem inventar diferenciais/cronograma ou resultado |
| Trilha | promessa de não interferência no fornecedor | respeitar agência, manter viabilidade técnica em aberto |
As respostas anteriores continuam reprovadas. Testes com anotações explícitas comprovam o contrato do validador, não entendimento semântico do Gemini. O revisor ainda pode errar a classificação semântica; isso requer avaliação real.

## Procedimento mínimo proposto — aguarda aprovação específica
Etapa A: no máximo duas chamadas sequenciais fictícias para diagnóstico do transporte, mesmo modelo, prompt, schema, teto de 4096 tokens e timeout de 45s, variando somente MINIMAL/MEDIUM. Sem retry; interromper no primeiro 503, 429, erro de autenticação/configuração ou timeout. Usar somente segredo dedicado existente em execução segura, sem recuperar/exibir valor, sem alterar proteções. Se não houver rota segura compatível, não executar nem ampliar permissões.
Coletar status, latência, etapa, nível solicitado, tamanho e tokens/finishReason enumerados; nunca pensamento, cabeçalhos ou credencial. Duas respostas de transporte não aprovam a qualidade nem estabelecem causa raiz com alta confiança.

Etapa B depende da apresentação do resultado A e de aprovação separada: cinco cenários fictícios preservados com plano/mensagem/revisão integrais e avaliação comercial; controles sem chamada para recusa/opt-out/pesquisa insuficiente. Não iniciada nem autorizada por este documento.

Não realizar deploy nem tocar banco remoto. Credenciais e workflows protegidos continuam fora do escopo sem nova autorização explícita. Aprovação de teste real não autoriza publicação.

## Estado final desta rodada
Homologação técnica automatizada concluída. Homologação comercial real e liberação para produção pendentes. Nenhuma chamada Gemini real ou mensagem WhatsApp real. Não afirmar sistema pronto para uso real enquanto essas etapas estiverem abertas.
