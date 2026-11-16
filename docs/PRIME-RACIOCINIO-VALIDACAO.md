# PRIME — raciocínio e revisão: evidência e hipótese de correção

Base testada: 8dc744752974c7e8c2dd61eef7f2e6a57fa17c20; run 43851021305; artefato 14217636793; SHA256 3fa2685def9803aec4563da2cd0abeac27a868fd28b9ba2b6af8f24d7875214c.

## Resultado anterior preservado

12 chamadas reais, 6 verificações técnicas aprovadas e 2 reprovadas (Bruma timeout, Trilha bloqueio de qualidade). Três finais reais: Ipê, Vértice e Rumo. Nenhuma aprovada comercialmente: Ipê inventa qualidade, familiaridade e canal principal; Vértice antecipa oferta sem verificar rota; Rumo atribui efeito sobre decisão e conteúdos não confirmados. Trilha corretamente bloqueada por promessa de não interferência. O timeout da Bruma atingiu 45 segundos sem status HTTP; não prova quota, autenticação ou causa no provedor. Nenhuma repetição de timeout automática. Demais chamadas concluíram sem HTTP 400: o esquema compacto foi aceito.

## Hipótese de correção e limites

Geração e revisão estavam em MINIMAL. Documentação oficial consultada em 16/11/2026: https://ai.google.dev/gemini-api/docs/generate-content/thinking (modelo suporta minimal/low/medium/high; minimal equivale a near-off); https://ai.google.dev/gemini-api/docs/pricing#gemini-3.1-flash-lite (entrada/saída, incluindo raciocínio, disponíveis gratuitamente no Free tier). Não representa auditoria de faturamento da conta. Sem ativar serviços ou trocar modelo.

Alterado para MEDIUM em geração e revisão. Saída limitada a 4096 tokens por chamada, preservados timeout 45s, orçamento total por geração 180s e no máximo quatro chamadas. Telemetria registra nível solicitado e contagens, nunca pensamento ou chave. Isso é hipótese de melhoria: somente nova evidência real poderá confirmá-la. Sem novas frases prontas.

192 testes locais aprovados. Teste novo verifica nível/teto, ausência de pensamento na resposta, contagem, timeout e preservação literal da mensagem. CI e Gemini real pendentes para esta alteração.

## Respostas reais completas da base MINIMAL

### bruma-social

Contexto fictício:
```json
{
  "turnPurpose": "cold_outreach",
  "researchAvailable": true,
  "sourceProvenance": {
    "kind": "operator_provided_observation",
    "host": "bruma.example.invalid",
    "verifiedOn": "2026-11-16"
  },
  "senderIdentity": {
    "name": "Pedro",
    "company": "PRIME",
    "role": "proprietário que conduz a negociação"
  },
  "tone": "consultivo",
  "intent": "OPENING",
  "latestMessage": "",
  "commercialContext": {
    "company": "Bruma Cerâmica Fictícia",
    "sector": "Cerâmica autoral"
  },
  "interlocutorDeclared": null,
  "history": [],
  "previousDrafts": [],
  "commercialSignals": {
    "interlocutor": {
      "role": "desconhecido",
      "confidence": "baixa",
      "evidence": null
    },
    "refusal": false,
    "objectionCues": [],
    "strategyConstraint": "motivo relevante sem inventar pesquisa",
    "answeredQuestionPairs": [],
    "missingInformation": [
      "necessidade"
    ],
    "limitation": "Sinais locais conservadores. Saudação não identifica robô. Declarações não são pesquisa pública."
  },
  "operatorFeedback": [],
  "channel": "WhatsApp manual",
  "strategy": "observacao",
  "strategyHintOnly": true,
  "evidenceRegister": [
    {
      "id": "policy:portfolio",
      "kind": "current_brand_policy",
      "text": "A PRIME oferece exclusivamente sites profissionais e landing pages. Não oferece automação de WhatsApp, sistemas, painéis, tráfego pago ou SEO independente.",
      "scope": [
        "brand",
        "function"
      ]
    },
    {
      "id": "policy:functions",
      "kind": "current_brand_policy",
      "text": "Um site pode apresentar a empresa, seus serviços e trabalhos fornecidos. Uma landing page pode reunir informações fornecidas sobre uma oferta específica e um link de próxima ação informado. Estas são funções de apresentação propostas, não evidência de necessidade, conteúdo disponível, resultado de vendas ou compatibilidade técnica e contratual.",
      "scope": [
        "function"
      ]
    },
    {
      "id": "policy:sender",
      "kind": "current_brand_policy",
      "text": "Pedro representa a PRIME e é o proprietário que conduz a negociação diretamente.",
      "scope": [
        "brand",
        "identity"
      ]
    },
    {
      "id": "context:company",
      "kind": "operator_record",
      "text": "Bruma Cerâmica Fictícia",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "context:sector",
      "kind": "operator_record",
      "text": "Cerâmica autoral",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "public:observation",
      "kind": "provided_verified_observation",
      "text": "Perfil exibe 40 peças da coleção fictícia Terra e posts recentes. Link da bio abre catálogo social. Busca complementar não identificou domínio oficial; presença própria é desconhecida.",
      "scope": [
        "observation",
        "search_result"
      ]
    }
  ],
  "verifiedObservation": "Perfil exibe 40 peças da coleção fictícia Terra e posts recentes. Link da bio abre catálogo social. Busca complementar não identificou domínio oficial; presença própria é desconhecida.",
  "handoffAccepted": false,
  "regenerate": false
}
```

Candidato 1:

Olá. Acompanhei o trabalho da Bruma Cerâmica e vi a coleção Terra no perfil. Sou o Pedro, da PRIME. Como vocês utilizam o catálogo social, tenho pensado em como um site poderia organizar essas peças para consulta direta, separando o portfólio da dinâmica das redes. Faz sentido conversarmos sobre como essa estrutura funcionaria para vocês?

Final: Não houve final revisada.

Status: {"code": "timeout", "httpStatus": null, "stage": "semantic_review"}

### interesse-explicacao

Contexto fictício:
```json
{
  "turnPurpose": "reply",
  "researchAvailable": false,
  "sourceProvenance": null,
  "senderIdentity": {
    "name": "Pedro",
    "company": "PRIME",
    "role": "proprietário que conduz a negociação"
  },
  "tone": "consultivo",
  "intent": "OTHER",
  "latestMessage": "Pode. Nosso intensivo é para adultos, já temos o programa e a inscrição por um link. Como seria essa página?",
  "commercialContext": {
    "company": "Rumo Idiomas Fictício",
    "sector": "Idiomas"
  },
  "interlocutorDeclared": null,
  "history": [
    {
      "direction": "outbound",
      "text": "Uma página dedicada poderia apresentar o intensivo de conversação. Posso explicar a ideia?"
    },
    {
      "direction": "inbound",
      "text": "Pode. Nosso intensivo é para adultos, já temos o programa e a inscrição por um link. Como seria essa página?"
    }
  ],
  "previousDrafts": [],
  "commercialSignals": {
    "interlocutor": {
      "role": "desconhecido",
      "confidence": "baixa",
      "evidence": null
    },
    "refusal": false,
    "objectionCues": [],
    "strategyConstraint": "decidir pelo contexto",
    "answeredQuestionPairs": [
      {
        "question": "Uma página dedicada poderia apresentar o intensivo de conversação. Posso explicar a ideia?",
        "answer": "Pode. Nosso intensivo é para adultos, já temos o programa e a inscrição por um link. Como seria essa página?"
      }
    ],
    "missingInformation": [
      "necessidade"
    ],
    "limitation": "Sinais locais conservadores. Saudação não identifica robô. Declarações não são pesquisa pública."
  },
  "operatorFeedback": [],
  "channel": "WhatsApp manual",
  "strategy": null,
  "strategyHintOnly": true,
  "evidenceRegister": [
    {
      "id": "policy:portfolio",
      "kind": "current_brand_policy",
      "text": "A PRIME oferece exclusivamente sites profissionais e landing pages. Não oferece automação de WhatsApp, sistemas, painéis, tráfego pago ou SEO independente.",
      "scope": [
        "brand",
        "function"
      ]
    },
    {
      "id": "policy:functions",
      "kind": "current_brand_policy",
      "text": "Um site pode apresentar a empresa, seus serviços e trabalhos fornecidos. Uma landing page pode reunir informações fornecidas sobre uma oferta específica e um link de próxima ação informado. Estas são funções de apresentação propostas, não evidência de necessidade, conteúdo disponível, resultado de vendas ou compatibilidade técnica e contratual.",
      "scope": [
        "function"
      ]
    },
    {
      "id": "policy:sender",
      "kind": "current_brand_policy",
      "text": "Pedro representa a PRIME e é o proprietário que conduz a negociação diretamente.",
      "scope": [
        "brand",
        "identity"
      ]
    },
    {
      "id": "context:company",
      "kind": "operator_record",
      "text": "Rumo Idiomas Fictício",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "context:sector",
      "kind": "operator_record",
      "text": "Idiomas",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "inbound:0",
      "kind": "client_statement",
      "text": "Pode. Nosso intensivo é para adultos, já temos o programa e a inscrição por um link. Como seria essa página?",
      "scope": [
        "brand",
        "function",
        "observation",
        "search_result",
        "global_absence",
        "channel_exclusivity",
        "relationship",
        "quality",
        "outcome",
        "implementation",
        "identity",
        "other"
      ]
    }
  ],
  "verifiedObservation": null,
  "handoffAccepted": false,
  "regenerate": false
}
```

Candidato 1:

Em uma landing page, organizamos o conteúdo de forma direta para quem busca o intensivo. A ideia é apresentar os diferenciais do programa, o cronograma e os tópicos abordados, deixando o link de inscrição em destaque para o aluno finalizar o processo. Como você já tem o programa definido, a página funciona como um ponto de apoio informativo que facilita a decisão do interessado. Faz sentido para o que você imagina?

Final: Em uma landing page, organizamos o conteúdo de forma direta para quem busca o intensivo. A ideia é apresentar os diferenciais do programa, o cronograma e os tópicos abordados, deixando o link de inscrição em destaque para o aluno finalizar o processo. Como você já tem o programa definido, a página funciona como um ponto de apoio informativo que facilita a decisão do interessado. Faz sentido para o que você imagina?

Status: {"technicalPass": true}

### ipe-madeira

Contexto fictício:
```json
{
  "turnPurpose": "cold_outreach",
  "researchAvailable": true,
  "sourceProvenance": {
    "kind": "operator_provided_observation",
    "host": "ipe.example.invalid",
    "verifiedOn": "2026-11-16"
  },
  "senderIdentity": {
    "name": "Pedro",
    "company": "PRIME",
    "role": "proprietário que conduz a negociação"
  },
  "tone": "consultivo",
  "intent": "OPENING",
  "latestMessage": "",
  "commercialContext": {
    "company": "Ipê Madeira Fictícia",
    "sector": "Marcenaria"
  },
  "interlocutorDeclared": null,
  "history": [],
  "previousDrafts": [],
  "commercialSignals": {
    "interlocutor": {
      "role": "desconhecido",
      "confidence": "baixa",
      "evidence": null
    },
    "refusal": false,
    "objectionCues": [],
    "strategyConstraint": "motivo relevante sem inventar pesquisa",
    "answeredQuestionPairs": [],
    "missingInformation": [
      "necessidade"
    ],
    "limitation": "Sinais locais conservadores. Saudação não identifica robô. Declarações não são pesquisa pública."
  },
  "operatorFeedback": [],
  "channel": "WhatsApp manual",
  "strategy": "observacao",
  "strategyHintOnly": true,
  "evidenceRegister": [
    {
      "id": "policy:portfolio",
      "kind": "current_brand_policy",
      "text": "A PRIME oferece exclusivamente sites profissionais e landing pages. Não oferece automação de WhatsApp, sistemas, painéis, tráfego pago ou SEO independente.",
      "scope": [
        "brand",
        "function"
      ]
    },
    {
      "id": "policy:functions",
      "kind": "current_brand_policy",
      "text": "Um site pode apresentar a empresa, seus serviços e trabalhos fornecidos. Uma landing page pode reunir informações fornecidas sobre uma oferta específica e um link de próxima ação informado. Estas são funções de apresentação propostas, não evidência de necessidade, conteúdo disponível, resultado de vendas ou compatibilidade técnica e contratual.",
      "scope": [
        "function"
      ]
    },
    {
      "id": "policy:sender",
      "kind": "current_brand_policy",
      "text": "Pedro representa a PRIME e é o proprietário que conduz a negociação diretamente.",
      "scope": [
        "brand",
        "identity"
      ]
    },
    {
      "id": "context:company",
      "kind": "operator_record",
      "text": "Ipê Madeira Fictícia",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "context:sector",
      "kind": "operator_record",
      "text": "Marcenaria",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "public:observation",
      "kind": "provided_verified_observation",
      "text": "Perfil publica cozinhas autorais e a bio abre WhatsApp. Busca pelo nome/cidade e links oficiais consultados não localizou domínio próprio; pode existir em outro endereço.",
      "scope": [
        "observation",
        "search_result"
      ]
    }
  ],
  "verifiedObservation": "Perfil publica cozinhas autorais e a bio abre WhatsApp. Busca pelo nome/cidade e links oficiais consultados não localizou domínio próprio; pode existir em outro endereço.",
  "handoffAccepted": false,
  "regenerate": false
}
```

Candidato 1:

Olá. Acompanho o trabalho da Ipê Madeira Fictícia e notei a qualidade das cozinhas que vocês publicam. Sou o Pedro, da PRIME, e notei que vocês utilizam o WhatsApp como canal principal. Gostaria de saber se vocês já possuem um site próprio para organizar esse portfólio ou se esse é um caminho que ainda não exploraram?

Final: Olá. Acompanho o trabalho da Ipê Madeira Fictícia e notei a qualidade das cozinhas que vocês publicam. Sou o Pedro, da PRIME, e notei que vocês utilizam o WhatsApp como canal principal. Gostaria de saber se vocês já possuem um site próprio para organizar esse portfólio ou se esse é um caminho que ainda não exploraram?

Status: {"technicalPass": true}

### objecao-fornecedor

Contexto fictício:
```json
{
  "turnPurpose": "reply",
  "researchAvailable": false,
  "sourceProvenance": null,
  "senderIdentity": {
    "name": "Pedro",
    "company": "PRIME",
    "role": "proprietário que conduz a negociação"
  },
  "tone": "consultivo",
  "intent": "SERVICES",
  "latestMessage": "Tenho receio de mexer no site atual. Minha agência já cuida dele e não quero trocar de fornecedor.",
  "commercialContext": {
    "company": "Trilha Viva Fictícia",
    "sector": "Passeios guiados"
  },
  "interlocutorDeclared": null,
  "history": [
    {
      "direction": "inbound",
      "text": "Quero apresentar só nossa expedição fictícia de observação de aves. Nosso site institucional está bom."
    },
    {
      "direction": "outbound",
      "text": "Podemos avaliar uma página dedicada à expedição."
    },
    {
      "direction": "inbound",
      "text": "Tenho receio de mexer no site atual. Minha agência já cuida dele e não quero trocar de fornecedor."
    }
  ],
  "previousDrafts": [],
  "commercialSignals": {
    "interlocutor": {
      "role": "desconhecido",
      "confidence": "baixa",
      "evidence": null
    },
    "refusal": false,
    "objectionCues": [],
    "strategyConstraint": "decidir pelo contexto",
    "answeredQuestionPairs": [],
    "missingInformation": [
      "necessidade"
    ],
    "limitation": "Sinais locais conservadores. Saudação não identifica robô. Declarações não são pesquisa pública."
  },
  "operatorFeedback": [],
  "channel": "WhatsApp manual",
  "strategy": null,
  "strategyHintOnly": true,
  "evidenceRegister": [
    {
      "id": "policy:portfolio",
      "kind": "current_brand_policy",
      "text": "A PRIME oferece exclusivamente sites profissionais e landing pages. Não oferece automação de WhatsApp, sistemas, painéis, tráfego pago ou SEO independente.",
      "scope": [
        "brand",
        "function"
      ]
    },
    {
      "id": "policy:functions",
      "kind": "current_brand_policy",
      "text": "Um site pode apresentar a empresa, seus serviços e trabalhos fornecidos. Uma landing page pode reunir informações fornecidas sobre uma oferta específica e um link de próxima ação informado. Estas são funções de apresentação propostas, não evidência de necessidade, conteúdo disponível, resultado de vendas ou compatibilidade técnica e contratual.",
      "scope": [
        "function"
      ]
    },
    {
      "id": "policy:sender",
      "kind": "current_brand_policy",
      "text": "Pedro representa a PRIME e é o proprietário que conduz a negociação diretamente.",
      "scope": [
        "brand",
        "identity"
      ]
    },
    {
      "id": "context:company",
      "kind": "operator_record",
      "text": "Trilha Viva Fictícia",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "context:sector",
      "kind": "operator_record",
      "text": "Passeios guiados",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "inbound:0",
      "kind": "client_statement",
      "text": "Quero apresentar só nossa expedição fictícia de observação de aves. Nosso site institucional está bom.",
      "scope": [
        "brand",
        "function",
        "observation",
        "search_result",
        "global_absence",
        "channel_exclusivity",
        "relationship",
        "quality",
        "outcome",
        "implementation",
        "identity",
        "other"
      ]
    },
    {
      "id": "inbound:1",
      "kind": "client_statement",
      "text": "Tenho receio de mexer no site atual. Minha agência já cuida dele e não quero trocar de fornecedor.",
      "scope": [
        "brand",
        "function",
        "observation",
        "search_result",
        "global_absence",
        "channel_exclusivity",
        "relationship",
        "quality",
        "outcome",
        "implementation",
        "identity",
        "other"
      ]
    }
  ],
  "verifiedObservation": null,
  "handoffAccepted": false,
  "regenerate": false
}
```

Candidato 1:

A ideia da página dedicada é justamente ser um complemento focado apenas na expedição de observação de aves, sem tocar no seu site institucional ou na estrutura que sua agência já gerencia. Ela funcionaria como um espaço isolado para esse roteiro específico. Faz sentido para você que essa página tenha uma gestão independente, mantendo o trabalho que você já possui com eles?

Candidato 2:

O objetivo da página dedicada é atuar como um espaço focado exclusivamente na apresentação da expedição de observação de aves, sem alterar a estrutura que sua agência já gerencia no site institucional. Caso tenha interesse em avaliar como esse conteúdo específico poderia ser organizado, fico à disposição para conversarmos sobre o formato.

Final: Não houve final revisada.

Status: {"code": "quality_block", "httpStatus": null, "stage": "semantic_review"}

### vertice-turma

Contexto fictício:
```json
{
  "turnPurpose": "cold_outreach",
  "researchAvailable": true,
  "sourceProvenance": {
    "kind": "operator_provided_observation",
    "host": "vertice.example.invalid",
    "verifiedOn": "2026-11-16"
  },
  "senderIdentity": {
    "name": "Pedro",
    "company": "PRIME",
    "role": "proprietário que conduz a negociação"
  },
  "tone": "consultivo",
  "intent": "OPENING",
  "latestMessage": "",
  "commercialContext": {
    "company": "Vértice Escola Fictícia",
    "sector": "Cursos livres"
  },
  "interlocutorDeclared": null,
  "history": [],
  "previousDrafts": [],
  "commercialSignals": {
    "interlocutor": {
      "role": "desconhecido",
      "confidence": "baixa",
      "evidence": null
    },
    "refusal": false,
    "objectionCues": [],
    "strategyConstraint": "motivo relevante sem inventar pesquisa",
    "answeredQuestionPairs": [],
    "missingInformation": [
      "necessidade"
    ],
    "limitation": "Sinais locais conservadores. Saudação não identifica robô. Declarações não são pesquisa pública."
  },
  "operatorFeedback": [],
  "channel": "WhatsApp manual",
  "strategy": "observacao",
  "strategyHintOnly": true,
  "evidenceRegister": [
    {
      "id": "policy:portfolio",
      "kind": "current_brand_policy",
      "text": "A PRIME oferece exclusivamente sites profissionais e landing pages. Não oferece automação de WhatsApp, sistemas, painéis, tráfego pago ou SEO independente.",
      "scope": [
        "brand",
        "function"
      ]
    },
    {
      "id": "policy:functions",
      "kind": "current_brand_policy",
      "text": "Um site pode apresentar a empresa, seus serviços e trabalhos fornecidos. Uma landing page pode reunir informações fornecidas sobre uma oferta específica e um link de próxima ação informado. Estas são funções de apresentação propostas, não evidência de necessidade, conteúdo disponível, resultado de vendas ou compatibilidade técnica e contratual.",
      "scope": [
        "function"
      ]
    },
    {
      "id": "policy:sender",
      "kind": "current_brand_policy",
      "text": "Pedro representa a PRIME e é o proprietário que conduz a negociação diretamente.",
      "scope": [
        "brand",
        "identity"
      ]
    },
    {
      "id": "context:company",
      "kind": "operator_record",
      "text": "Vértice Escola Fictícia",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "context:sector",
      "kind": "operator_record",
      "text": "Cursos livres",
      "scope": [
        "identity"
      ]
    },
    {
      "id": "public:observation",
      "kind": "provided_verified_observation",
      "text": "Post anuncia turma de fotografia noturna. O botão Saiba mais abre a página geral de cursos, sem programa da turma na seção observada; outra rota pode existir.",
      "scope": [
        "observation",
        "search_result"
      ]
    }
  ],
  "verifiedObservation": "Post anuncia turma de fotografia noturna. O botão Saiba mais abre a página geral de cursos, sem programa da turma na seção observada; outra rota pode existir.",
  "handoffAccepted": false,
  "regenerate": false
}
```

Candidato 1:

Olá. Sou o Pedro, da PRIME. Vi o post da Vértice sobre a nova turma de fotografia noturna e notei que o 'Saiba mais' direciona para a página geral de cursos. Já considerou ter uma página específica para essa turma, onde os interessados pudessem consultar o programa detalhado e o cronograma diretamente?

Final: Olá. Sou o Pedro, da PRIME. Vi o post da Vértice sobre a nova turma de fotografia noturna e notei que o 'Saiba mais' direciona para a página geral de cursos. Já considerou ter uma página específica para essa turma, onde os interessados pudessem consultar o programa detalhado e o cronograma diretamente?

Status: {"technicalPass": true}
