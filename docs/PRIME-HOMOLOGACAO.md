# PRIME — transformação e pré-homologação

15/11/2026. Checkpoint 6145f2d0273a01c6c34c41a418b6bf4811b84e3b; branch work/prime-commercial-elite. Base preservada 9d93996. Código comercial auditado 4554738d9e366af15901beab2a79649b65162965; commit 8775b0e adiciona apenas fixture visual e guia.

## Identidade e operação

Nome público, título, login, menus, marca P, favicon e metadados PRIME. Guia e operação atuais atualizados. Política única src/brand.js: somente sites profissionais e landing pages; proprietário conduz negociação. Catálogos antigos retirados da geração e qualificação ativa. Identificadores técnicos de banco, cookies, variáveis, repositório e serviços mantidos. Histórico não reescrito. Prospecta não modificado. Botão para proprietário assumir pedido humano, sem transferência a terceiro e sem remoção de opt-out.

Pedro confirmou titularidade/direito de usar código e credencial dedicada de testes. Nenhum dado remoto foi copiado ou alterado. Fixtures exclusivamente fictícias. A confirmação não foi tratada como autorização de exportação, deploy ou migração.

## Raciocínio

Identidade do remetente em campo próprio, independente da empresa lead. Registro de evidências diferencia cadastro/intenções do proprietário, declarações do cliente e observação fornecida com fonte/data. knowledge separa fatos, indícios, hipóteses e desconhecidos. opportunity pode ser desconhecida: não escolher um processo ou serviço só pelo nicho. Gemini decide descoberta/site/landing page conforme objetivo sustentado, depois gera originalmente. Não há frases comerciais pré-escritas novas nem biblioteca de objeções.

Revisor independente audita trechos consecutivos da mensagem inteira, cita evidência e oferece crítica concreta ao reparo. Cobertura incompleta ou trecho reprovado bloqueia a resposta. Essa verificação estrutural não garante que o modelo nunca erre uma interpretação; avaliação comercial completa continua necessária. Uma regeneração por qualidade; falhas técnicas não provocam tentativas ilimitadas. Timeout por etapa 45s, com registro da etapa; duração agora inclui reparos. Modelo fixo gemini-3.1-flash-lite, thinkingLevel MINIMAL explícito, sem troca para modelo pago. Nenhum faturamento ativado. Não houve consulta administrativa de faturamento Google nesta execução.

## Verificação técnica

127 testes locais aprovados, zero falhas/skips no candidato auditado. CI 43728679105 aprovado, incluindo navegador simulado com regras locais e Gemini simulado, em 360/1440px. Cenários: autenticação, modo humano, edição/cópia, histórico, deduplicação, filtros, arquivamento/restauração, opt-out, análise visual simulada/correção, geração sem telefone e abertura WhatsApp interceptada sem envio real. Pedido humano pode ser assumido pelo proprietário; opt-out continua bloqueado. Nenhum Android físico disponível.

Falha UI inicial 43727762428 causada pelo favicon data: bloqueado pela CSP. Corrigido para favicon.svg da própria origem, sem liberar recursos de terceiros; CI posterior aprovado. Navegador local foi bloqueado por socket/ptrace do ambiente; testes de UI executados em CI, não declarar execução local nem Android físico.

## Backup restaurável sintético

Workflow 43728076956 aprovado em 0bac8ed: PostgreSQL17 Docker isolado, schemas/migrações locais, conversas fictícias, draft editado, auditoria, conversa arquivada e opt-out. pg_dump custom em stream -> age -> arquivo cifrado. Identidade criptográfica descartável do ensaio em diretório separado, sem impressão; nenhuma credencial de produção criada. SHA-256 conferido, decifragem, pg_restore atômico em banco novo, comparação exata de conversas/mensagens/drafts/auditoria, opt-out e busca/restauração de arquivo. Alteração de ciphertext rejeitada. Diretórios temporários removidos pelo trap.

Artefato 14167665144, digest 4e57eec540b187430df53a952c0d15d6e4529685438d9cea2a9df832a9f3cf52. Nenhum upload B2. Este ensaio comprova a cadeia local com dados fictícios; não comprova recuperação de objeto externo, custódia da chave definitiva, desastre da instância real ou equivalência de roles/grants de produção. Próximos controles em V4.2-BACKUP-CRIPTOGRAFIA-E-RESTAURACAO.md. Bucket existente observado: gsw-sdr-prime-v42-backups (plural); não recriado. Conferir destino antes de upload, pois prompt posterior citou singular.

## Infraestrutura, domínio e rollback

Render gsw-sdr-prime-dev: autoDeploy=no, branch work/v0.3-infra-tests, plano free verificados. Nenhum deploy, migração, DNS ou serviço criado. Nome técnico legado permanece. Endereço atual não representa publicação PRIME. Proposta: usar app como subdomínio de um domínio PRIME de titularidade do proprietário; escolha/disponibilidade ainda não verificadas, nenhum domínio inventado como oficial ou comprado.

Rollback preparado: reverter commit de aplicação ao aprovado, preservar schema aditivo. Não restaurar dump antigo sobre banco que recebeu escritas: risco de perder histórico e opt-outs. Restore/reconciliação somente em isolamento e sob autorização. Nenhuma alteração destrutiva necessária para a marca.

## Rodadas reais intermediárias (não são homologação)

Rodada 43727843993: checkout dabcac6, 1/4 passou tecnicamente, 3 timeouts; recepcionista comercialmente insuficiente por antecipar proposta. Artefato 14166684773, digest 296b75772c0fb0d2cae28a4d0d171570f8eb214ca0645514503db460e3a8b3c2.

Rodada 43728279251: checkout 60b0515, 4/4 passaram tecnicamente sem timeout; avaliação comercial reprovou troca da empresa remetente em Marina, dor de tempo presumida no site, promessa implícita de conversão na landing page e revisão da recepcionista inconsistente. Artefato 14167700691, digest 8e9a9b5bd82c769df60537791c647366fb598d35475dd8caec34e60819a6335b. Correção posterior é a auditoria de mensagem inteira e identidade em campo separado.

Os workflows autenticados são executados na branch já autorizada do ambiente gemini-v42-tests, com checkout do SHA PRIME imutável citado. Só o harness de testes foi acrescentado à V4.2, sem substituir o código da aplicação. Não ampliamos políticas de branch do segredo nem copiamos a chave. Provedor real em todos os exemplos abaixo; HTTP200 não equivale à qualidade.

### run-dabcac6 — respostas completas

#### landing-page

Contexto fictício: {"empresa": {"company": "Estúdio Lume Fictício"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Já temos um bom site institucional. Queremos apresentar só o workshop fictício de fotografia, com programa, data e link de inscrição que já existe."}]}

Resposta real final: Não entregue: {"code": "timeout", "stage": "generation", "httpStatus": null, "qualityIssues": []}

#### marina

Contexto fictício: {"empresa": {"company": "Brisa Técnica Climatização", "sector": "Climatização"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Olá, bom dia. Tudo sim e com você? Me chamo Marina. Como posso ajudar?"}]}

Resposta real final: Não entregue: {"code": "timeout", "stage": "semantic_review", "httpStatus": null, "qualityIssues": []}

#### recepcionista

Contexto fictício: {"empresa": {"company": "Brisa Técnica Climatização", "sector": "Climatização"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Sou a Marina da recepção. Não decido sobre tecnologia. Qual o assunto?"}]}

Resposta real final: Olá, Marina. A PRIME trabalha exclusivamente com o desenvolvimento de sites e landing pages profissionais para empresas. Como o foco é a presença digital da Brisa Técnica, você poderia me indicar quem é a pessoa responsável por essa área para que eu possa apresentar nossa proposta?

#### site-confirmado

Contexto fictício: {"empresa": {"company": "Ateliê Aurora Fictício", "sector": "Marcenaria"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Sou a dona. Não temos site; só enviamos fotos pelo WhatsApp. Quero uma página para apresentar nossos móveis sob medida e os contatos."}]}

Resposta real final: Não entregue: {"code": "timeout", "stage": "generation", "httpStatus": null, "qualityIssues": []}

### run-60b0515 — respostas completas

#### landing-page

Contexto fictício: {"empresa": {"company": "Estúdio Lume Fictício"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Já temos um bom site institucional. Queremos apresentar só o workshop fictício de fotografia, com programa, data e link de inscrição que já existe."}]}

Resposta real final: Entendido. Como o Estúdio Lume já possui um site institucional, uma landing page focada exclusivamente no workshop é o caminho ideal para converter as inscrições sem dispersar o público. Para alinharmos, você prefere que essa página siga a identidade visual do seu site atual ou busca uma comunicação independente para este evento?

#### marina

Contexto fictício: {"empresa": {"company": "Brisa Técnica Climatização", "sector": "Climatização"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Olá, bom dia. Tudo sim e com você? Me chamo Marina. Como posso ajudar?"}]}

Resposta real final: Olá, Marina. Tudo bem por aqui também. Entro em contato pela Brisa Técnica Climatização para entender como vocês apresentam seus serviços hoje. Vocês já possuem algum site profissional para os clientes conhecerem o trabalho de vocês?

#### recepcionista

Contexto fictício: {"empresa": {"company": "Brisa Técnica Climatização", "sector": "Climatização"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Sou a Marina da recepção. Não decido sobre tecnologia. Qual o assunto?"}]}

Rascunho real rejeitado: Olá, Marina. O motivo do contato é verificar se a Brisa Técnica Climatização possui interesse em avaliar a atualização ou criação de seu site institucional. Para que eu possa fornecer as informações corretas, você poderia me indicar quem seria a pessoa responsável por essa área ou o proprietário da empresa?

Resposta real final: Olá, Marina. O motivo do meu contato é verificar se a Brisa Técnica Climatização tem interesse em um site profissional para apresentar seus serviços de climatização. Você poderia me indicar quem seria a pessoa responsável por essa área para que eu possa conversar com ela?

#### site-confirmado

Contexto fictício: {"empresa": {"company": "Ateliê Aurora Fictício", "sector": "Marcenaria"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Sou a dona. Não temos site; só enviamos fotos pelo WhatsApp. Quero uma página para apresentar nossos móveis sob medida e os contatos."}]}

Resposta real final: Olá. Compreendo que o envio manual de fotos pelo WhatsApp pode tomar bastante tempo do seu dia. Para o Ateliê Aurora, um site focado em expor os seus móveis sob medida pode organizar melhor essas informações para quem chega até você. Para eu entender melhor o que seria ideal, você já tem alguma ideia de como gostaria de organizar a apresentação desses projetos no site?

## Rodada comercial 43728704367 — código 4554738

9 cenários: 7 passaram tecnicamente (cinco textos entregues, recusa e opt-out bloqueados sem geração), um bloqueado por qualidade, um HTTP503. A aprovação técnica não foi tratada como aprovação comercial. Artefato 14167299436, digest 5aeef25fcc35eabcdb91abe8ae7ab1a2110d1a3bf946129b21e0f7f53610caf2.

Avaliação completa: Marina adequada para descoberta (identidade correta, não pressupõe ausência de site, pergunta única com alternativas da mesma informação); potencial de interesse ainda limitado pela ausência de observação/necessidade. Recepcionista adequada como triagem respeitosa, porém genérica: não há motivo particular para ela priorizar o contato. Site confirmado respeita o objetivo, pergunta sobre organização do conteúdo sem garantia, mas pode soar mecânico. Landing page respeita site existente e objetivo de workshop, porém pergunta por arquitetura antes de demonstrar aplicação concreta: pendência comercial. Preço: uma pergunta útil sobre a oferta sem preço inventado, estimativa futura a ser feita pelo proprietário. Recusa/opt-out preservados. Fora de escopo: falso bloqueio antigo de portfólio sobre uma recusa de automação, depois citação de política sem fonte registrável; correção 4b9f85f remove a heurística e inclui fonte policy:portfolio. Site adequado: 503 não é credencial/quota comprovada.

Multimodal 43728974103: timeout de 30s na primeira extração. Sem resultado completo e sem aprovação. Correção 2a64a23 alinha limite a 45s e thinking mínimo, sem retry automático nem troca de modelo. Reexecução única após essa correção.

### fora-escopo — contexto e resposta completa

{"empresa": {"company": "Oficina Vale Fictícia"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Vocês fazem automação de WhatsApp e sistemas? Não estou procurando site."}]}

Rascunho rejeitado: Entendido. A PRIME é focada exclusivamente no desenvolvimento de sites e landing pages para apresentação de empresas e serviços. Não trabalhamos com automação de WhatsApp ou sistemas de gestão, por isso não consigo atender ao que você busca no momento.

Rascunho rejeitado: Entendo. A PRIME é focada exclusivamente no desenvolvimento de sites e landing pages para apresentação de empresas. Como não trabalhamos com automação de WhatsApp ou sistemas, não conseguirei atender à sua demanda atual. Caso precise de um site para apresentar a Oficina Vale no futuro, fico à disposição.

Resposta real final: Bloqueado sem resposta: {"code": "quality_block", "stage": null, "httpStatus": null, "qualityIssues": ["unsupported_claim"]}

### landing-page — contexto e resposta completa

{"empresa": {"company": "Estúdio Lume Fictício"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Já temos um bom site institucional. Queremos apresentar só o workshop fictício de fotografia, com programa, data e link de inscrição que já existe."}]}

Decisão e estratégia: {"strategy": "qualificacao", "knowledge": {"facts": ["O cliente possui um site institucional atual.", "O objetivo declarado é a divulgação específica de um workshop de fotografia."], "indications": ["A necessidade de uma landing page para focar na conversão da inscrição do workshop é clara."], "hypotheses": ["O site atual pode não permitir a criação de páginas focadas em conversão isolada sem interferir na estrutura institucional."], "unknowns": ["Se o site atual possui suporte técnico para a criação de novas páginas internas ou se a empresa prefere um ambiente independente para a campanha."]}, "opportunity": {"status": "grounded", "evidenceRefs": ["inbound:0"], "missingEvidence": "Preferência por integração com o site atual ou independência do ambiente da landing page.", "discoveryTarget": "Entender se a estrutura atual comporta a página do workshop ou se há preferência por uma solução separada."}, "focus": {"topic": "Landing page para o workshop de fotografia", "basis": "confirmed", "relevance": "Atende ao objetivo de apresentar o workshop com foco na inscrição."}, "interlocutor": "Desconhecido", "evidence": "O cliente declarou possuir site institucional e necessidade de divulgar workshop com link de inscrição.", "unknowns": ["Preferência por integração técnica ou ambiente separado."], "nextStep": "Validar se a intenção é criar uma página dentro do site existente ou um ambiente externo independente."}

Resposta real final: Entendo, o site institucional atende bem à marca, mas para o workshop, o foco precisa ser na inscrição. Vocês preferem criar essa página dentro da estrutura atual do site ou buscam um ambiente independente para essa campanha específica?

### marina — contexto e resposta completa

{"empresa": {"company": "Brisa Técnica Climatização", "sector": "Climatização"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Olá, bom dia. Tudo sim e com você? Me chamo Marina. Como posso ajudar?"}]}

Decisão e estratégia: {"strategy": "descoberta", "knowledge": {"facts": ["Interlocutora se chama Marina", "Empresa é Brisa Técnica Climatização"], "indications": ["Marina está em um canal de atendimento da empresa"], "hypotheses": ["Marina pode ser recepcionista ou parte da equipe administrativa"], "unknowns": ["Se a empresa possui site próprio", "Qual o objetivo atual da empresa para sua presença digital", "Se Marina é a decisora"]}, "opportunity": {"status": "unknown", "evidenceRefs": ["inbound:0"], "missingEvidence": "Necessidade ou objetivo da empresa em relação a um site ou landing page", "discoveryTarget": "Verificar se a Brisa Técnica Climatização já conta com um site profissional"}, "focus": {"topic": "presença digital da empresa", "basis": "unknown", "relevance": "Entender se a empresa já utiliza um site para apresentar seus serviços de climatização"}, "interlocutor": "Marina", "evidence": "Marina se identificou e perguntou como pode ajudar, sem mencionar necessidades digitais ou cargo de decisão.", "unknowns": ["presença digital", "decisor"], "nextStep": "Perguntar sobre a presença digital da empresa para identificar se há interesse ou necessidade de um site."}

Resposta real final: Prazer, Marina. Sou o Pedro, da PRIME. Entro em contato para entender melhor como a Brisa Técnica Climatização apresenta seus serviços hoje. Vocês já possuem um site profissional ou utilizam outro canal para divulgar o trabalho de climatização?

### optout — contexto e resposta completa

{"empresa": {}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Não me mande mais mensagens."}]}

Resposta real final: Bloqueado sem resposta: {"blocked": true}

### preco — contexto e resposta completa

{"empresa": {"company": "Flor Bela Fictícia"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Quanto custa uma landing page para apresentar uma oferta?"}]}

Decisão e estratégia: {"strategy": "esclarecimento", "knowledge": {"facts": ["O cliente é da Flor Bela Fictícia", "O cliente solicitou o custo de uma landing page para uma oferta"], "indications": ["O cliente tem interesse em uma landing page para uma finalidade específica"], "hypotheses": ["A empresa pode estar buscando converter um produto ou serviço específico"], "unknowns": ["Qual é a natureza da oferta que o cliente deseja apresentar"]}, "opportunity": {"status": "exploratory", "evidenceRefs": ["inbound:0"], "missingEvidence": "detalhes sobre a oferta ou o objetivo da página", "discoveryTarget": "entender o que o cliente pretende oferecer"}, "focus": {"topic": "natureza da oferta", "basis": "unknown", "relevance": "necessário para compreender a estrutura da página e definir a viabilidade"}, "interlocutor": "desconhecido", "evidence": "O cliente solicitou o custo de uma landing page para uma oferta da Flor Bela Fictícia.", "unknowns": ["natureza da oferta", "objetivo da página"], "nextStep": "Aguardar a descrição da oferta para entender o contexto da necessidade."}

Rascunho rejeitado: Para eu te passar uma estimativa que faça sentido para a Flor Bela Fictícia, preciso entender um pouco melhor o que você pretende oferecer. Qual é o objetivo principal dessa landing page e o que exatamente você deseja apresentar nela?

Resposta real final: Para eu conseguir te passar uma estimativa que faça sentido para a Flor Bela Fictícia, preciso entender melhor o que você pretende oferecer nessa página. O que exatamente você deseja apresentar na landing page?

### recepcionista — contexto e resposta completa

{"empresa": {"company": "Brisa Técnica Climatização", "sector": "Climatização"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Sou a Marina da recepção. Não decido sobre tecnologia. Qual o assunto?"}]}

Decisão e estratégia: {"strategy": "descoberta", "knowledge": {"facts": ["A interlocutora se identificou como Marina, recepcionista da Brisa Técnica Climatização.", "Marina declarou não ter poder de decisão sobre tecnologia."], "indications": ["A empresa atua no setor de climatização."], "hypotheses": [], "unknowns": ["Quem é o responsável pela tomada de decisão técnica ou estratégica na empresa.", "Se a empresa possui um site ou landing page atual e se há alguma necessidade relacionada a esses ativos."]}, "opportunity": {"status": "unknown", "evidenceRefs": ["inbound:0"], "missingEvidence": "contato com o decisor e entendimento da necessidade atual da empresa.", "discoveryTarget": "identificar o responsável pela gestão da empresa ou marketing."}, "focus": {"topic": "identificação do decisor", "basis": "unknown", "relevance": "necessário para prosseguir com qualquer diagnóstico consultivo sobre a presença digital da empresa."}, "interlocutor": "Marina", "evidence": "A interlocutora Marina, recepcionista da Brisa Técnica Climatização, afirmou não decidir sobre tecnologia.", "unknowns": ["decisor", "necessidade"], "nextStep": "Solicitar a indicação de quem cuida da área de marketing ou gestão da Brisa Técnica Climatização."}

Resposta real final: Olá, Marina. A PRIME atua no desenvolvimento de sites e landing pages profissionais para empresas. Como não é sua área, você poderia me indicar quem seria a pessoa responsável por cuidar da comunicação ou da gestão da Brisa Técnica Climatização?

### recusa — contexto e resposta completa

{"empresa": {}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Não temos interesse, obrigado."}]}

Resposta real final: Bloqueado sem resposta: {"blocked": true}

### site-adequado — contexto e resposta completa

{"empresa": {"company": "Clínica Cedro Fictícia"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Temos um site atualizado que apresenta nossos serviços e recebe contatos normalmente. Estamos satisfeitos com a agência atual."}]}

Resposta real final: Bloqueado sem resposta: {"code": "provider_unavailable", "stage": null, "httpStatus": 503, "qualityIssues": []}

### site-confirmado — contexto e resposta completa

{"empresa": {"company": "Ateliê Aurora Fictício", "sector": "Marcenaria"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Sou a dona. Não temos site; só enviamos fotos pelo WhatsApp. Quero uma página para apresentar nossos móveis sob medida e os contatos."}]}

Decisão e estratégia: {"strategy": "qualificacao", "knowledge": {"facts": ["A interlocutora declarou ser a dona do Ateliê Aurora.", "A empresa atua no setor de marcenaria.", "Atualmente, a empresa não possui site e utiliza o WhatsApp para enviar fotos de móveis sob medida."], "indications": ["Existe o desejo de ter uma página para apresentar os móveis e facilitar o contato."], "hypotheses": ["A cliente busca uma forma de organizar a apresentação dos produtos para clientes em potencial."], "unknowns": ["Quais informações específicas, além dos contatos, ela considera essenciais para essa apresentação inicial."]}, "opportunity": {"status": "grounded", "evidenceRefs": ["inbound:0"], "missingEvidence": "Detalhes sobre o volume de produtos ou se há um catálogo fixo para organizar na página.", "discoveryTarget": "Entender a expectativa de organização do conteúdo na página."}, "focus": {"topic": "Estruturação de página de apresentação para marcenaria", "basis": "confirmed", "relevance": "Atende diretamente à demanda declarada de apresentar móveis e contatos."}, "interlocutor": "Dona do Ateliê Aurora", "evidence": "A cliente confirmou que é a proprietária e que não possui site, utilizando apenas WhatsApp para o envio de fotos de marcenaria.", "unknowns": ["Preferência por um formato de site institucional ou algo mais focado em catálogo de produtos."], "nextStep": "Validar o formato de apresentação dos móveis para o site."}

Resposta real final: Olá. Entendido, o site pode ser um caminho para centralizar essas informações. Para que eu possa entender melhor como estruturar, você imagina essa página mais como um catálogo dos seus móveis sob medida ou prefere algo focado em apresentar como o ateliê funciona?

## Rodada comercial final direcionada 43729386140 — código 4b9f85f

5/5 casos aprovados tecnicamente. Artefato 14167876970, digest 4b85283fa5c9e9d706cc22fbe18884bb78e3bed7d8e7fe76672d10e12100296e. Sem timeout/503/429/401/403 nessa rodada. Duração total por caso: 3,648–17,497s; 11 chamadas no conjunto, incluindo uma regeneração da recepcionista por pergunta dupla. Tokens exatos não foram instrumentados. Sucesso posterior ao503 não comprova causa específica nem garantia de disponibilidade futura.

Avaliação comercial humana do assistente, não medição de conversão:

| Cenário | Naturalidade | Relevância | Credibilidade/clareza | Potencial de interesse | Decisão |
|---|---|---|---|---|---|
| Marina sem pesquisa | adequada, um pouco formal | descoberta pertinente, sem oferta validada | correta identidade, não presume ausência de site | limitado pela falta de evidência da empresa | aceita para descoberta, com ressalva |
| Recepcionista com necessidade | longa, porém compreensível | responde sobre a página de higienização solicitada | finalidade funcional, sem promessa | plausível pela necessidade declarada | aceita com ressalva de concisão |
| Site adequado | cordial e respeitosa | encerra sem forçar troca de fornecedor | fiel à satisfação declarada | não se aplica; não buscar insistência | aprovada |
| Landing page workshop | clara, abertura um pouco padronizada | usa workshop, conteúdo e link existentes | remove conversão garantida/solução ideal | plausível, não comprovado | aceita com ressalva: pergunta de estrutura pode ser adiada |
| Fora de escopo | clara e respeitosa | reconhece que não atende ao pedido | limita portfólio corretamente | não se aplica | aprovada |

Recepcionista sem necessidade, na rodada anterior, é triagem válida e ainda genérica. Não alegar abordagem altamente personalizada com apenas nome/nicho, nem inventar pesquisa para torná-la convincente. Preferir fornecer observação verificada ou descoberta adicional. Não há dado operacional para afirmar melhora na proporção de respostas ou conversão.

### fora-escopo — contexto, evidências e resposta completa

Contexto fictício: {"empresa": {"company": "Oficina Vale Fictícia"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Vocês fazem automação de WhatsApp e sistemas? Não estou procurando site."}]}

Confirmado/indícios/hipóteses/desconhecido: {"facts": ["O lead questionou sobre automação de WhatsApp e sistemas", "O lead declarou explicitamente que não está procurando site"], "indications": ["O lead possui uma demanda operacional ou de gestão, não de presença digital institucional"], "hypotheses": ["O lead busca otimização de processos internos ou atendimento"], "unknowns": ["Qual a necessidade específica que levou o lead a buscar essas soluções"]}

Oportunidade e estratégia: {"strategy": "esclarecimento", "opportunity": {"status": "unknown", "evidenceRefs": ["policy:portfolio", "inbound:0"], "missingEvidence": "Não há necessidade de site ou landing page declarada pelo lead", "discoveryTarget": "Nenhuma oportunidade de site identificada"}, "focus": {"topic": "Escopo de atuação da PRIME", "basis": "confirmed", "relevance": "Esclarecer o limite da oferta para alinhar expectativas"}}

Resposta real completa: Compreendo. Na PRIME, nosso foco é exclusivamente o desenvolvimento de sites profissionais e landing pages para apresentação de empresas. Não atuamos com automação de WhatsApp ou sistemas de gestão. Como você não busca um site, entendo que não somos a solução para sua necessidade atual.

### landing-page — contexto, evidências e resposta completa

Contexto fictício: {"empresa": {"company": "Estúdio Lume Fictício"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Já temos um bom site institucional. Queremos apresentar só o workshop fictício de fotografia, com programa, data e link de inscrição que já existe."}]}

Confirmado/indícios/hipóteses/desconhecido: {"facts": ["O Estúdio Lume Fictício possui um site institucional ativo", "O cliente deseja divulgar um workshop específico de fotografia", "O workshop possui programa, data e link de inscrição definidos"], "indications": ["Existe uma necessidade de foco isolado para uma oferta específica, o que se alinha com o propósito de uma landing page"], "hypotheses": ["O site institucional atual pode não permitir a criação de páginas de alta conversão para eventos específicos"], "unknowns": ["Se o site atual permite a criação de novas páginas ou se o cliente prefere um ambiente isolado para o workshop"]}

Oportunidade e estratégia: {"strategy": "valor", "opportunity": {"status": "grounded", "evidenceRefs": ["inbound:0"], "missingEvidence": "Preferência por manter a página dentro do domínio atual ou criar uma estrutura independente", "discoveryTarget": "alinhamento da finalidade da landing page com a infraestrutura atual do site"}, "focus": {"topic": "Landing page para o workshop de fotografia", "basis": "confirmed", "relevance": "O cliente declarou o objetivo de apresentar um produto específico de forma isolada do site institucional"}}

Resposta real completa: Entendo, o site institucional atende bem a marca, mas para o workshop, uma landing page pode concentrar as informações e o link de inscrição sem desviar a atenção do visitante. Você prefere que essa página seja uma extensão do seu site atual ou algo independente para este evento?

### marina — contexto, evidências e resposta completa

Contexto fictício: {"empresa": {"company": "Brisa Técnica Climatização", "sector": "Climatização"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Olá, bom dia. Tudo sim e com você? Me chamo Marina. Como posso ajudar?"}]}

Confirmado/indícios/hipóteses/desconhecido: {"facts": ["Interlocutora se identificou como Marina", "Empresa atua no setor de climatização", "Nome da empresa é Brisa Técnica Climatização"], "indications": ["Marina é o primeiro ponto de contato"], "hypotheses": ["A empresa pode estar avaliando a presença digital para seus serviços de climatização"], "unknowns": ["Se a empresa já possui um site ou landing page", "Qual o objetivo da Marina ao atender o contato", "Se Marina é a decisora ou responsável pela comunicação da empresa"]}

Oportunidade e estratégia: {"strategy": "descoberta", "opportunity": {"status": "unknown", "evidenceRefs": ["inbound:0"], "missingEvidence": "necessidade declarada", "discoveryTarget": "verificar se há interesse ou necessidade de um site para a Brisa Técnica Climatização"}, "focus": {"topic": "presença digital", "basis": "unknown", "relevance": "Entender se a empresa já possui um canal de apresentação profissional para seus serviços de climatização"}}

Resposta real completa: Olá, Marina. Prazer. Trabalho com a PRIME, onde desenvolvemos sites e landing pages profissionais para empresas apresentarem seus serviços. Gostaria de saber se a Brisa Técnica Climatização já possui um site próprio para apresentar os serviços de climatização aos clientes?

### recepcionista-necessidade — contexto, evidências e resposta completa

Contexto fictício: {"empresa": {"company": "Brisa Técnica Climatização", "sector": "Climatização"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Sou Marina da recepção. O proprietário pediu informações sobre uma página exclusiva para apresentar nosso serviço de higienização de ar-condicionado. O que vocês fazem nessa página?"}]}

Confirmado/indícios/hipóteses/desconhecido: {"facts": ["Marina é recepcionista na Brisa Técnica Climatização", "O proprietário da empresa solicitou informações sobre uma página focada no serviço de higienização de ar-condicionado"], "indications": ["Existe um interesse em um entregável digital específico para um serviço da empresa"], "hypotheses": ["O proprietário deseja uma landing page para converter interessados no serviço de higienização"], "unknowns": ["Qual o objetivo principal do proprietário com a página (ex: converter orçamentos, informar detalhes técnicos ou apenas apresentar o serviço)"]}

Oportunidade e estratégia: {"strategy": "esclarecimento", "opportunity": {"status": "exploratory", "evidenceRefs": ["inbound:0"], "missingEvidence": "objetivo específico do proprietário para a página", "discoveryTarget": "proprietário"}, "focus": {"topic": "finalidade da landing page para o serviço de higienização", "basis": "hypothesis", "relevance": "define se o escopo atende ao objetivo do proprietário"}}

Rascunho rejeitado real: Olá, Marina. Uma página exclusiva para a higienização de ar-condicionado serviria para organizar as informações desse serviço e facilitar o contato direto dos clientes interessados. Para eu entender melhor se essa é a melhor solução para o que o proprietário busca, você poderia me dizer qual é o principal objetivo dele com essa página? Além disso, seria possível conversar diretamente com ele para alinharmos os detalhes?

Resposta real completa: Olá, Marina. Uma página focada em higienização de ar-condicionado serve para apresentar o serviço de forma clara, com as informações que o cliente precisa para decidir e um caminho direto para o contato. Para eu entender se essa é a melhor forma de apoiar o que o proprietário planejou, você saberia me dizer se o objetivo principal é que o cliente entre em contato para orçamento ou apenas que ele tenha acesso a detalhes técnicos do serviço?

### site-adequado — contexto, evidências e resposta completa

Contexto fictício: {"empresa": {"company": "Clínica Cedro Fictícia"}, "mensagens": [{"id": "0", "direction": "inbound", "text": "Temos um site atualizado que apresenta nossos serviços e recebe contatos normalmente. Estamos satisfeitos com a agência atual."}]}

Confirmado/indícios/hipóteses/desconhecido: {"facts": ["O cliente possui um site atualizado.", "O cliente declara satisfação com o fornecedor atual."], "indications": ["Não há lacuna aparente no serviço de presença digital atual."], "hypotheses": [], "unknowns": ["Se há algum projeto futuro ou necessidade de expansão que justifique uma nova avaliação."]}

Oportunidade e estratégia: {"strategy": "encerramento", "opportunity": {"status": "unknown", "evidenceRefs": ["inbound:0"], "missingEvidence": "Não há necessidade declarada ou problema identificado para a PRIME atuar.", "discoveryTarget": "Nenhum"}, "focus": {"topic": "Satisfação com o fornecedor atual", "basis": "confirmed", "relevance": "Respeitar a relação comercial estabelecida e encerrar o contato de forma ética."}}

Resposta real completa: Fico contente em saber que a presença digital da Clínica Cedro já está bem estruturada e atendendo às suas expectativas. Como já possuem um parceiro que supre suas necessidades, não há motivo para interromper esse trabalho. Deixo aqui meu contato à disposição caso surja algum projeto específico no futuro em que eu possa colaborar.

## Multimodal real 43729522089 — código 2a64a23

Extração real com duas imagens distintas e uma duplicada: empresa/nicho, mensagens, remetentes e ordem correta; correção manual, resposta comercial sem telefone, recorte, privacidade fictícia, recusa e opt-out. Nenhuma mensagem enviada. Artefato 14168210232, digest 55e4322b088521fb87710e4464c7f165f46652d40078edd5b767724c3fa35107.

A revisão do assistente identificou que o recorte genérico foi associado a uma oportunidade sem fundamento, embora a bateria técnica tivesse passado. Não tratamos esse pass como prova de ausência de invenções. Correção 2283704: contrato conservador da extração exige que a própria evidência citada mencione explicitamente o serviço antes de mostrar hipótese de oportunidade. Pergunta genérica sobre funcionamento deixa oportunidade desconhecida. A inferência comercial mais ampla continua no motor generativo depois da revisão do proprietário. Isso pode reduzir extrações automáticas de oportunidades implícitas: é uma limitação intencional, a ser tratada por revisão manual, não evidência de inexistência de oportunidade.

Também passou a reprovar revisão sem segmentos, evitando marcar como revisada uma resposta que não foi integralmente auditada. Testes locais atuais: 130/130, zero falhas/skips. Uma chamada real direcionada ao recorte validará essa última correção, sem repetir a bateria multimodal inteira.

### Multimodal 01-extracao-completa

{
  "provider": "gemini",
  "model": "gemini-3.1-flash-lite",
  "messages": [
    {
      "direction": "outbound",
      "time": "10:02",
      "text": "Que informações vocês querem apresentar na página?",
      "source": 2,
      "cropped": false
    },
    {
      "direction": "inbound",
      "time": "10:03",
      "text": "Fabricamos móveis sob medida e não temos site.",
      "source": 2,
      "cropped": false
    },
    {
      "direction": "inbound",
      "time": "10:04",
      "text": "Quero um site para apresentar nossos móveis e contatos.",
      "source": 1,
      "cropped": false
    }
  ],
  "company": {
    "value": "Oficina Fictícia Pinhal Azul",
    "status": "visible",
    "evidence": "Oficina Fictícia Pinhal Azul"
  },
  "sector": {
    "value": "Móveis sob medida",
    "status": "hypothesis",
    "evidence": "Fabricamos móveis sob medida"
  },
  "intent": {
    "value": "Criação de site",
    "status": "hypothesis",
    "evidence": "Quero um site para apresentar nossos móveis e contatos."
  },
  "opportunity": {
    "value": "Desenvolvimento de site profissional",
    "status": "hypothesis",
    "evidence": "Quero um site para apresentar nossos móveis e contatos."
  },
  "uncertainOrder": false,
  "blocked": false
}

### Multimodal 02-revisao-manual-sem-telefone

{
  "reviewed": true,
  "company": "Marcenaria Fictícia Pinhal Azul",
  "sector": "Marcenaria sob medida",
  "messages": [
    {
      "direction": "outbound",
      "time": "10:02",
      "text": "Que informações vocês querem apresentar na página?",
      "source": 2,
      "cropped": false
    },
    {
      "direction": "inbound",
      "time": "10:03",
      "text": "Fabricamos móveis sob medida e não temos site.",
      "source": 2,
      "cropped": false
    },
    {
      "direction": "inbound",
      "time": "10:04",
      "text": "Quero um site para apresentar nossos móveis sob medida, fotos dos projetos e contatos.",
      "source": 1,
      "cropped": false
    }
  ]
}

### Multimodal 03-resposta-comercial-completa

{
  "text": "Entendido. Para que o site seja um canal eficiente para a Marcenaria Pinhal Azul, além das fotos dos seus projetos, como você costuma receber o primeiro contato de quem tem interesse em um móvel sob medida hoje?",
  "provider": "gemini",
  "generationMeta": {
    "provider": "gemini",
    "model": "gemini-3.1-flash-lite",
    "status": "success",
    "durationMs": 6869,
    "qualityReview": "gemini_semantic_and_local",
    "semanticQuestionCount": 1,
    "semanticFeedback": "A mensagem está alinhada com a estratégia de descoberta, focando na necessidade declarada sem extrapolar o escopo da PRIME.",
    "semanticFactChecks": [
      {
        "claim": "O cliente atua no setor de marcenaria sob medida.",
        "sourceId": "inbound:0",
        "sourceQuote": "Fabricamos móveis sob medida",
        "verdict": "supported"
      },
      {
        "claim": "O cliente deseja um site para fotos e contatos.",
        "sourceId": "inbound:1",
        "sourceQuote": "Quero um site para apresentar nossos móveis sob medida, fotos dos projetos e contatos.",
        "verdict": "supported"
      }
    ],
    "semanticSegments": [
      {
        "text": "Entendido.",
        "assessment": "Reconhecimento da necessidade declarada pelo cliente.",
        "acceptable": true
      },
      {
        "text": "Para que o site seja um canal eficiente para a Marcenaria Pinhal Azul, além das fotos dos seus projetos, como você costuma receber o primeiro contato de quem tem interesse em um móvel sob medida hoje?",
        "assessment": "Pergunta focada em entender o fluxo atual para estruturar o site, sem assumir processos ou oferecer serviços fora do escopo.",
        "acceptable": true
      }
    ],
    "qualityAttempts": 1,
    "requestAttempts": 2,
    "generationAttempts": 1,
    "commercialDecision": {
      "strategy": "valor",
      "knowledge": {
        "facts": [
          "O cliente atua no setor de marcenaria sob medida.",
          "O cliente declarou não possuir um site.",
          "O objetivo é apresentar móveis, fotos de projetos e meios de contato."
        ],
        "indications": [
          "O cliente deseja um espaço centralizado para exibir o portfólio visual da marcenaria."
        ],
        "hypotheses": [
          "O cliente busca organizar a apresentação da empresa para facilitar o atendimento de novos interessados."
        ],
        "unknowns": [
          "Como o cliente recebe pedidos atualmente.",
          "Se há algum fluxo específico de atendimento que o site deveria suportar."
        ]
      },
      "opportunity": {
        "status": "grounded",
        "evidenceRefs": [
          "inbound:0",
          "inbound:1"
        ],
        "missingEvidence": "Fluxo atual de recebimento de demandas dos clientes.",
        "discoveryTarget": "Entender como o site pode facilitar o primeiro contato com quem busca móveis sob medida."
      },
      "focus": {
        "topic": "Estrutura de apresentação da marcenaria",
        "basis": "confirmed",
        "relevance": "O cliente confirmou o desejo de exibir portfólio e contatos, o que alinha com a proposta de um site profissional."
      },
      "interlocutor": "Responsável pela Marcenaria Fictícia Pinhal Azul",
      "evidence": "O cliente declarou fabricar móveis sob medida e expressou necessidade de um site para fotos e contatos.",
      "unknowns": [
        "fluxo de atendimento atual",
        "preferência de formato de contato"
      ],
      "nextStep": "Compreender como o cliente hoje organiza o atendimento aos interessados para sugerir uma estrutura de site que facilite esse processo."
    }
  }
}

### Multimodal 04-extracao-do-recorte

{
  "provider": "gemini",
  "model": "gemini-3.1-flash-lite",
  "messages": [
    {
      "direction": "inbound",
      "time": "11:05",
      "text": "Vocês podem me explicar como funciona?",
      "source": 1,
      "cropped": false
    }
  ],
  "company": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "sector": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "intent": {
    "value": "Solicitação de informações sobre o serviço",
    "status": "hypothesis",
    "evidence": "Vocês podem me explicar como funciona?"
  },
  "opportunity": {
    "value": "Desenvolvimento de site profissional ou landing page",
    "status": "hypothesis",
    "evidence": "Vocês podem me explicar como funciona?"
  },
  "uncertainOrder": false,
  "blocked": false
}

### Multimodal 05-extracao-opt-out

{
  "provider": "gemini",
  "model": "gemini-3.1-flash-lite",
  "messages": [
    {
      "direction": "inbound",
      "time": "12:00",
      "text": "Não me envie mais mensagens, por favor.",
      "source": 1,
      "cropped": false
    },
    {
      "direction": "inbound",
      "time": "12:01",
      "text": "O e-mail fictício é [dado oculto].",
      "source": 1,
      "cropped": false
    }
  ],
  "company": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "sector": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "intent": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "opportunity": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "uncertainOrder": false,
  "blocked": true
}

### Multimodal 06-extracao-recusa

{
  "provider": "gemini",
  "model": "gemini-3.1-flash-lite",
  "messages": [
    {
      "direction": "outbound",
      "time": "13:00",
      "text": "Querem conversar sobre um site?",
      "source": 1,
      "cropped": false
    },
    {
      "direction": "inbound",
      "time": "13:01",
      "text": "Não tenho interesse. Obrigado.",
      "source": 1,
      "cropped": false
    }
  ],
  "company": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "sector": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "intent": {
    "value": "recusa de oferta",
    "status": "hypothesis",
    "evidence": "Não tenho interesse. Obrigado."
  },
  "opportunity": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "uncertainOrder": false,
  "blocked": true
}

### Multimodal 07-resultado

{
  "status": "pass",
  "provider": "gemini",
  "model": "gemini-3.1-flash-lite",
  "manualReview": true,
  "phoneRequired": false,
  "draftsBlocked": [
    "opt-out",
    "recusa"
  ],
  "channel": "rascunho para envio manual",
  "sentMessages": 0
}

## Limites e critérios de liberação

- Interface Android validada apenas em navegador com viewport 360px; sem dispositivo físico. Não há teste real em celular neste ambiente.
- Não testamos o aplicativo PRIME em Render compartilhado porque não houve autorização de deploy. Autenticação e estado foram validados em CI isolado. Integração operacional Prospecta em desenvolvimento permanece pendente; código/identificadores não foram alterados e nenhuma API de Prospecta foi chamada.
- Não consultamos novamente contagens de dados reais; preservação remota decorre da ausência de escrita/migração, não de um teste de restauração remota. Não afirmar que as contagens históricas 25/4 foram revalidadas hoje.
- Preço, negociação e propostas não recebem valores/condições inventados; teste real de preço sem valor fornecido foi executado. Não há evidência de todas as combinações de negociação/fechamento ou desempenho comercial real. Os 40 itens solicitados não são 40 homologações independentes em produção.
- Modelo free tier documentado para texto/imagem; segredo dedicado preservado no Actions. Não copiamos a chave para Render ou workspace. Nenhum serviço pago ativado.
- Backup sintético local aprovado. B2 externo, custódia definitiva e recuperação de objeto baixado ainda não executados: dependem de autorização de credenciais operacionais e guarda separada da identidade de recuperação. Não exportar dados reais antes de escopo e autorização específicos.
- Domínio PRIME não definido/comprado; DNS não alterado. Endereço técnico legado segue ativo com versão anterior; esta transformação ainda não está publicada.

Classificação: candidata de pré-homologação com ressalvas comerciais; SEM LIBERAÇÃO PARA USO REAL. Homologação em desenvolvimento, recuperação externa e Android físico continuam pendentes. Não solicitar deploy como se backup externo já estivesse validado.

Próxima autorização necessária: preparar a identidade criptográfica definitiva com guarda separada e acesso B2 de menor privilégio, e executar ensaio externo só com dados fictícios. Após restauração externa comprovada, apresentar commit fixado e pedido de autorização exclusivo para deploy de desenvolvimento. Exportação real, migração remota e produção continuam exigindo autorizações separadas.

Correção de diagnóstico final: ausência de chave passa a se referir a esta instalação, sem presumir que a variável está ausente no Render. Segredo do Actions não é tratado como disponível no backend. O ajuste muda apenas a mensagem de erro; não lê/configura/copía credenciais.

## Recorte corrigido — evidência final

Workflow 43730177956 aprovado, checkout 228370406508d7143e4d594ae0f371bf3bb27a60. Artefato 14167584190, digest 66de0b856fba5a0de79ea53f95ac0cbf68b50732088787e6a99721adb3fb4c7c. Chamada real única, sem repetir cenários já comprovados: empresa, nicho e oportunidade Desconhecido. Intenção de conhecer funcionamento mantida como hipótese sustentada na mensagem.

CI do candidato 2283704: 43730050244 aprovado. Testes finais locais após correção apenas da mensagem de ausência de chave: 130/130, zero falhas/skips. A última alteração funcional foi a restrição conservadora da extração e a exigência de revisão completa; a mensagem de erro não muda geração. O commit de entrega dispara novamente o CI técnico, sem novas chamadas Gemini.

Estado final: IMPLEMENTAÇÃO PRIME PRESERVADA — CANDIDATA COM RESSALVAS. Pré-homologação técnica isolada executada; homologação no ambiente de desenvolvimento ainda não autorizada/executada. Liberação real bloqueada. Condições externas de recuperação e teste físico permanecem explicitadas acima.

Links de evidência:
- https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43729386140 (comercial real final direcionado, checkout 4b9f85f)
- https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43729522089 (multimodal completo, checkout 2a64a23)
- https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43730177956 (recorte corrigido, checkout 2283704)
- https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43728076956 (restauração cifrada sintética)
- https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43730050244 (CI com 130 testes e UI)

Os JSONs deste diretório e subpastas são cópias de evidência fictícia preservadas no repositório para não depender da expiração dos artefatos. Imagens fictícias completas e capturas UI estão nos artefatos dos workflows; uma fixture de recorte também está no repositório. Não há clientes reais nem chaves nesses arquivos.

Resposta completa do recorte corrigido:

{
  "provider": "gemini",
  "model": "gemini-3.1-flash-lite",
  "messages": [
    {
      "direction": "inbound",
      "time": "11:05",
      "text": "Vocês podem me explicar como funciona?",
      "source": 1,
      "cropped": false
    }
  ],
  "company": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "sector": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "intent": {
    "value": "conhecer o funcionamento do serviço",
    "status": "hypothesis",
    "evidence": "Vocês podem me explicar como funciona?"
  },
  "opportunity": {
    "value": "Desconhecido",
    "status": "unknown",
    "evidence": ""
  },
  "uncertainOrder": false,
  "blocked": false
}
