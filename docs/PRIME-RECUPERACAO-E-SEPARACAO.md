# PRIME — recuperação, checkpoint e separação

15/11/2026. Repositório existente phzin24450-creator/gsw-sdr-prime-public. Base: 9d93996614e30ec42dd75000826fc0b85db28327. Branch separada work/prime-commercial-elite. Nenhum deploy ou alteração de banco remoto.

## Recuperação

Código local corresponde à base remota. Documentação e evidências não commitadas da rodada anterior foram preservadas neste checkpoint; não reconstruídas. Último CI técnico 43681259636: success. Última rodada real 43681259561: failure; artefato 14148507492, digest b6e88718601a1dadd70ef69283343bd24bfea7788a4948670a7e8b0df83c6563.

Marina: HTTP503 após política limitada de tentativas; não é prova de falha de credencial/quota. Recepcionista: saída real entregue, aprovada automaticamente, mas comercialmente insuficiente; fala em sistemas/ferramentas digitais sem oportunidade identificada e incompatível com o novo portfólio PRIME. Não aprovada para uso. Resposta completa preservada em docs/evidence/v42-elite/run-9d93996/commercial-marina-recepcao.json.

## Titularidade e bloqueio específico

Repositório público, sem LICENSE/NOTICE e com license=null na API GitHub. Não foi encontrada autorização documentada para exploração independente pela PRIME. Acesso técnico ao repositório e autoria de commits não comprovam cessão/titularidade. Solicitar declaração do proprietário sobre direito de reutilizar o código antes de criar a versão derivada comercial. Não adicionar licença por conta própria.

Confirmações separadas: código, recursos/credenciais Gemini e infraestrutura, dados. Pode-se autorizar só código e usar exclusivamente fixtures enquanto recursos independentes não estiverem disponíveis. Nenhuma autorização de dados reais é presumida. Não copiar banco, leads, histórico ou opt-outs anteriores para a PRIME sem escopo explícito e legítimo; isso não autoriza apagar os originais. Nenhum segredo antigo é transferido. Workflows da branch nova não devem consumir secrets do ambiente antigo sem confirmação de titularidade e escopo.

## Implementação após confirmação do código

- web/index.html e src/auth.js/src/server.js: identidade visível, título, login, ícone/favicon e estados; preservar nomes de rotas e variáveis internas compatíveis.
- src/intelligence.js, commercial.js, advisor.js, qualification.js e visual.js: política única PRIME, só sites/landing pages, proprietário negocia diretamente. Retirar catálogos e handoff obrigatório dos caminhos ativos, preservando histórico/auditoria.
- Contexto: fatos com fontes, indícios, hipóteses e desconhecidos; nome/nicho não demonstram ausência de site nem necessidade. Separar registro histórico de marca/política vigente enviada ao modelo. Restrições do proprietário/cliente prevalecem.
- Raciocínio: objetivo do cliente e presença digital conhecida -> suficiência de evidência -> investigar/nenhuma oportunidade/site/landing page -> uma próxima ação -> redação original -> revisão independente. Revisor deve indicar falha concreta sem fornecer mensagem pronta. Bom site não implica substituição; Instagram não implica landing page.
- Compatibilidade: manter autenticação, modo humano, drafts/edit/copy, histórico, opt-out e WhatsApp manual. Sem renomear schema, repo, env vars, identificadores ou integração Prospecta; nenhuma migração remota.
- Testes: atualizar expectativas comerciais; preservar regressões técnicas. Fixtures para identidade, site adequado, fornecedor, recusa, print, recepcionista, operador versus lead. Chamadas reais somente com credencial legitimamente autorizada para PRIME. CI em branch separada sem deploy.

## Infraestrutura, domínio e backup

URL técnica anteriormente verificada: https://gsw-sdr-prime-dev.onrender.com/ ; não é domínio oficial da PRIME. Não alterar serviço/DNS. Propor domínio PRIME somente após escolha de endereço e verificação de disponibilidade; nenhum domínio comprado ou declarado oficial. Separar publicação da transformação local.

Há divergência no nome do bucket: observado na preparação `gsw-sdr-prime-v42-backups` (plural); novo prompt cita `gsw-sdr-prime-v42-backup` (singular). Não recriar, renomear ou enviar para nome presumido. Conferir destino exato antes de qualquer upload autorizado. Procedimento de criptografia/recuperação em V4.2-BACKUP-CRIPTOGRAFIA-E-RESTAURACAO.md; ainda não equivale a backup restaurável validado. Ensaio sintético local poderá ser realizado após autorização do código; upload depende de credencial legítima e limites verificados. Não gerar credenciais nesta etapa.

## Estado

Transformação PRIME ainda não implementada: confirmação de direito sobre o código necessária. Sem nova chamada Gemini, exportação, alteração de secret, deploy ou migração. Android físico indisponível; não alegar teste real de dispositivo. CI anterior não é homologação PRIME.

## Confirmação posterior do titular

Pedro confirmou expressamente nesta conversa que criou o código com o assistente e tem direito de reutilização; confirmou a pergunta conjunta sobre código/credencial. Transformação autorizada na branch PRIME. Isso não autoriza exportação de dados reais, publicação, migração ou geração de novas credenciais. Registro anterior permanece como histórico da verificação.
