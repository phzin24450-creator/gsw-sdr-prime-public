# PRIME — rodada funcional e correção de alegações compostas

Código testado: 9c07cad75c14ed8467b2685579b21315c374542d. Run 43849821721. Artefato 14216987023, SHA256 9d939cc983d60b7d93620549dc1d7eb9f7b50efcadb9e7fb262e9e8cacd4047d.

12 chamadas reais, cinco finais, oito verificações técnicas aprovadas. Qualidade comercial NÃO aprovada. Trilha corrigiu a promessa técnica após revisão. Bruma manteve elogio, familiaridade e garantia; Vértice incluiu experiência setorial não comprovada e pergunta composta; Rumo contrastou com envio de apenas um link e acrescentou metodologia não fornecida; Ipê tratou o destino da bio como funcionamento do atendimento.

## Correção posterior

O contrato anterior atribuía um único compromisso/domínio por frase. Uma função válida servia como cobertura para premissas embutidas. Agora cada unidade exige parts: trechos literais contíguos, avaliados separadamente. O servidor exige reconstrução exata da unidade e valida fonte/autoridade de cada parte. Testes com anotações explícitas verificam garantia rejeitada, benefício preservado e omissão/paráfrase/reordenação recusadas. Isso não torna o servidor um oráculo semântico: classificar incorretamente continua sendo risco a avaliar em saídas reais.

Limite de saída do revisor passa de 2048 a 4096 tokens para comportar as partes. Nenhuma chamada extra acrescentada ao fluxo; timeout e limites de tentativas preservados. 191 testes locais aprovados. Validação real desse contrato ainda pendente.

## Respostas reais completas (código anterior à partição)

### bruma-social

Contexto fictício enviado:
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

Olá. Sou o Pedro, da PRIME. Estava acompanhando o trabalho da Bruma Cerâmica e notei que a coleção Terra está muito bem organizada no catálogo social. Como trabalho com a criação de sites, fiquei pensando se faz sentido para vocês terem um espaço próprio para essa curadoria, garantindo que o catálogo fique acessível independentemente das redes. Faz sentido conversarmos sobre como estruturar esse espaço?

Mensagem final:

Olá. Sou o Pedro, da PRIME. Estava acompanhando o trabalho da Bruma Cerâmica e notei que a coleção Terra está muito bem organizada no catálogo social. Como trabalho com a criação de sites, fiquei pensando se faz sentido para vocês terem um espaço próprio para essa curadoria, garantindo que o catálogo fique acessível independentemente das redes. Faz sentido conversarmos sobre como estruturar esse espaço?

### interesse-explicacao

Contexto fictício enviado:
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

Uma landing page funcionaria como um resumo estruturado do seu intensivo. Em vez de enviar apenas um link, você teria uma página onde o aluno pode ler sobre o programa, entender a metodologia e visualizar o próximo passo — a inscrição — de forma clara e direta. A ideia é que o conteúdo que você já possui fique reunido em um único lugar, facilitando a consulta de quem tem interesse. Faz sentido para o seu modelo atual?

Mensagem final:

Uma landing page funcionaria como um resumo estruturado do seu intensivo. Em vez de enviar apenas um link, você teria uma página onde o aluno pode ler sobre o programa, entender a metodologia e visualizar o próximo passo — a inscrição — de forma clara e direta. A ideia é que o conteúdo que você já possui fique reunido em um único lugar, facilitando a consulta de quem tem interesse. Faz sentido para o seu modelo atual?

### ipe-madeira

Contexto fictício enviado:
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

Olá, aqui é o Pedro, da PRIME. Acompanhei as cozinhas autorais que vocês publicam no perfil e notei que o atendimento é feito diretamente pelo WhatsApp. Como não encontrei um site, queria saber se vocês já consideraram ter um espaço próprio para organizar esses projetos de forma que os clientes possam consultar o portfólio completo com mais facilidade.

Mensagem final:

Olá, aqui é o Pedro, da PRIME. Acompanhei as cozinhas autorais que vocês publicam no perfil e notei que o atendimento é feito diretamente pelo WhatsApp. Como não encontrei um site, queria saber se vocês já consideraram ter um espaço próprio para organizar esses projetos de forma que os clientes possam consultar o portfólio completo com mais facilidade.

### objecao-fornecedor

Contexto fictício enviado:
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

A intenção não é substituir ou alterar o trabalho que sua agência já realiza no site institucional. Uma landing page para a expedição de observação de aves funcionaria como um canal independente, focado exclusivamente no conteúdo dessa oferta, sem tocar na estrutura ou na gestão do seu site atual. Faz sentido para você que essa página seja apenas um destino específico para quem tem interesse nessa expedição?

Candidato 2:

A intenção é manter o trabalho da sua agência no site atual. O foco da landing page seria apenas apresentar o conteúdo detalhado da expedição de observação de aves e o próximo passo para quem busca essa atividade específica. Faz sentido para você que essa página sirva apenas como um ponto de apresentação para essa oferta?

Mensagem final:

A intenção é manter o trabalho da sua agência no site atual. O foco da landing page seria apenas apresentar o conteúdo detalhado da expedição de observação de aves e o próximo passo para quem busca essa atividade específica. Faz sentido para você que essa página sirva apenas como um ponto de apresentação para essa oferta?

### vertice-turma

Contexto fictício enviado:
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

Olá. Sou o Pedro, da PRIME. Acompanhei o post da Vértice sobre a nova turma de fotografia noturna e notei que o link direciona para a página geral de cursos. Em situações assim, costumamos desenvolver landing pages focadas em um único curso, onde o aluno encontra diretamente o programa da turma e o caminho para a inscrição. Vocês já costumam utilizar páginas específicas para cada curso ou o modelo atual atende bem o que precisam?

Mensagem final:

Olá. Sou o Pedro, da PRIME. Acompanhei o post da Vértice sobre a nova turma de fotografia noturna e notei que o link direciona para a página geral de cursos. Em situações assim, costumamos desenvolver landing pages focadas em um único curso, onde o aluno encontra diretamente o programa da turma e o caminho para a inscrição. Vocês já costumam utilizar páginas específicas para cada curso ou o modelo atual atende bem o que precisam?
