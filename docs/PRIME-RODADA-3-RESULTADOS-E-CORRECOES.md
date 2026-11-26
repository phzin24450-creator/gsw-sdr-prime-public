# PRIME — rodada 3 real e correções posteriores

Código testado: 144138b. Workflow: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43791877684 . Commit somente do workflow: 5c6a945. Artefato 14192073624. SHA-256 conferido: 49c3b3eeb6ca35441d4fa91e30a5b3f9dbfac6e63ffc37ba8d87ce56852c15a8.

17 chamadas reais. Zero mensagens finais. Ipê pediu pesquisa; Bruma, Vértice, Rumo e Trilha esgotaram uma correção de qualidade e foram bloqueados. Recusa, opt-out e pesquisa insuficiente passaram sem chamadas. O script continua marcando a recomendação de pesquisa de Ipê como falha por esperar texto: essa contagem não significa que pesquisar seja errado. Nenhuma mensagem foi enviada.

Avanço: no caso Trilha o parecer identificou independência técnica não sustentada. Falhas: geração mantém algumas extrapolações, revisor ainda confunde classificação de compromisso com gramática, fontes de identidade com domínio, desconhecidos e ações propostas. Não aprovar comercialmente. Nenhuma justificativa para afirmar que tudo está resolvido.

## Correções posteriores, ainda sem nova rodada real

Fonte policy:sender pode sustentar identidade além de marca. BuyerTask é objetivo proposto, não evento ocorrido. Status de pesquisa não exige que uma observação prove a inexistência de pesquisa pendente. O contrato passa a pedir commitment: fato, proposta funcional, intenção, pergunta, lacuna ou saudação. Isso separa o compromisso do texto do tempo verbal. Uma proposta funcional sustentada pode estar no presente sem virar fato consumado; promessa de independência continua sendo condição técnica a verificar. Perguntas sem premissa e intenções não exigem citação inventada. Julgamento semântico do Gemini continua necessário e pode falhar. Não foi adicionado roteiro comercial.

173 testes locais aprovados após as correções; logs adjacentes. O novo contrato não foi testado com Gemini real ainda. A rodada descrita neste documento testou exclusivamente 144138b, não estas mudanças posteriores. Sem deploy, banco remoto, migração, segredo alterado, contratação ou WhatsApp. V4.2 recebeu somente o novo workflow; código alterado somente na branch isolada.

## Textos reais completos — candidatos bloqueados

### ipe-madeira

Contexto fictício:
```json
{
  "company": {
    "company": "Ipê Madeira Fictícia",
    "sector": "Marcenaria"
  },
  "observation": "Perfil publica cozinhas autorais e a bio abre WhatsApp. Busca pelo nome/cidade e links oficiais consultados não localizou domínio próprio; pode existir em outro endereço.",
  "history": []
}
```

Plano sem mensagem:
```json
{
  "action": "research",
  "strength": "plausible",
  "service": "site",
  "evidenceRefs": [
    "public:observation"
  ],
  "buyerTask": "apresentar projetos de marcenaria de forma estruturada",
  "contactReason": "identificação de portfólio autoral sem presença de site próprio consolidado",
  "pageRole": "centralizar a exibição de cozinhas e projetos autorais para consulta direta",
  "nextMove": "verificar se a marcenaria possui domínio ou projeto em andamento antes de abordar",
  "researchNeeded": "confirmar ausência de site oficial e intenções de expansão da Ipê Madeira Fictícia"
}
```

Não existe mensagem final revisada liberada.

### bruma-social

Contexto fictício:
```json
{
  "company": {
    "company": "Bruma Cerâmica Fictícia",
    "sector": "Cerâmica autoral"
  },
  "observation": "Perfil exibe 40 peças da coleção fictícia Terra e posts recentes. Link da bio abre catálogo social. Busca complementar não identificou domínio oficial; presença própria é desconhecida.",
  "history": []
}
```

Tentativa 1:

> Olá, acompanhei a coleção Terra que vocês publicaram e notei que o catálogo atual está concentrado no Instagram. Sou o Pedro, da PRIME. Como vocês trabalham com peças autorais, pensei se faria sentido para a Bruma ter um site próprio para organizar essa coleção de forma independente e mais acessível para quem consulta. Faz sentido conversarmos sobre como isso funcionaria?

Tentativa 2:

> Olá. Notei que a coleção Terra da Bruma Cerâmica está exposta no Instagram. Como trabalho com a criação de sites, pergunto se vocês já avaliaram ter um espaço próprio para organizar essas peças de forma independente, fora da rede social. Caso queiram conversar sobre essa possibilidade, fico à disposição.

Não existe mensagem final revisada liberada.

### vertice-turma

Contexto fictício:
```json
{
  "company": {
    "company": "Vértice Escola Fictícia",
    "sector": "Cursos livres"
  },
  "observation": "Post anuncia turma de fotografia noturna. O botão Saiba mais abre a página geral de cursos, sem programa da turma na seção observada; outra rota pode existir.",
  "history": []
}
```

Tentativa 1:

> Olá. Acompanhei o anúncio da turma de fotografia noturna da Vértice e notei que o link leva à página geral de cursos. Trabalho com a PRIME desenvolvendo páginas focadas em ofertas específicas, que permitem ao aluno consultar o programa completo e realizar a inscrição direto no curso anunciado, sem precisar buscar em uma lista geral. Faz sentido para vocês uma página dedicada para essa turma?

Tentativa 2:

> Olá. Vi o anúncio da turma de fotografia noturna da Vértice e notei que o link direciona para a lista geral de cursos. Sou o Pedro, da PRIME. Desenvolvemos landing pages focadas em uma única oferta, permitindo que o aluno consulte o programa específico e avance para a inscrição sem precisar navegar entre outras opções. Como vocês costumam apresentar os detalhes dessa turma para quem clica no anúncio?

Não existe mensagem final revisada liberada.

### interesse-explicacao

Contexto fictício:
```json
{
  "company": {
    "company": "Rumo Idiomas Fictício",
    "sector": "Idiomas"
  },
  "observation": null,
  "history": [
    {
      "direction": "outbound",
      "text": "Uma página dedicada poderia apresentar o intensivo de conversação. Posso explicar a ideia?"
    },
    {
      "direction": "inbound",
      "text": "Pode. Nosso intensivo é para adultos, já temos o programa e a inscrição por um link. Como seria essa página?"
    }
  ]
}
```

Tentativa 1:

> Uma landing page para o intensivo funcionaria como uma vitrine organizada para o seu programa. Em vez de apenas o link, a página apresentaria os diferenciais do curso, o nível exigido e a metodologia, facilitando que o aluno chegue à inscrição já bem informado. O botão de inscrição permaneceria como o passo final dentro dessa estrutura. Faz sentido para o seu modelo atual separar a apresentação do programa do momento da inscrição?

Tentativa 2:

> A ideia é criar uma página específica onde o interessado consulte os detalhes do intensivo, como o programa e a metodologia, antes de seguir para o seu link de inscrição. Esse formato permite que o aluno tenha acesso a todas as informações em um único lugar. Faz sentido para o seu modelo atual separar a apresentação do programa do momento da inscrição?

Não existe mensagem final revisada liberada.

### objecao-fornecedor

Contexto fictício:
```json
{
  "company": {
    "company": "Trilha Viva Fictícia",
    "sector": "Passeios guiados"
  },
  "observation": null,
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
  ]
}
```

Tentativa 1:

> A intenção não é alterar o site que a sua agência já mantém, mas sim criar um espaço independente e focado exclusivamente na expedição de observação de aves. Como essa página funcionaria de forma isolada, ela não interfere na gestão ou na estrutura do seu site institucional. Faz sentido explorarmos como essa página poderia organizar as informações da expedição?

Tentativa 2:

> A intenção não é alterar o trabalho que sua agência já realiza no site institucional, mas oferecer um espaço dedicado exclusivamente à expedição de observação de aves. Como essa página seria um projeto focado apenas na oferta da expedição, ela funcionaria como um complemento. Faz sentido explorarmos como essa página poderia organizar as informações da expedição?

Não existe mensagem final revisada liberada.

## Evidências e pendências

Todos os JSONs originais estão adjacentes: incluem planos, alegações, achados de reparo e telemetria. Candidatos devem ser avaliados comercialmente: Bruma ainda troca catálogo social por exclusividade; Vértice adianta oferta antes de verificar rota equivalente; Rumo explica melhor, mas generaliza conteúdo e efeito de informação; Trilha retirou parte da promessa no reparo, ainda exige avaliação da agência. Ipê foi prudente em pedir pesquisa, embora o plano ainda diga sem domínio próprio.

Próximo passo: validar o novo contrato de commitment com uma rodada restrita e avaliar respostas completas. Não executar repetições ilimitadas. Estado: não liberado.
