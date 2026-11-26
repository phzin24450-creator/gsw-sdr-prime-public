# PRIME — validação real do commit 46cce4e

Execução: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43792480306 . Código fixo: 46cce4eeb3560675ac5c69eeeba1cd05e0422aba. Workflow exclusivo: 2cfc9370c04aef93f1acfce4bf09d2115faf6927. Artefato 14192848594, SHA-256 conferido 379810f2bcef809464f334780c35e4d586aec80c43e0a08efc695c2574266cac.

Resultado: 16 chamadas reais; zero mensagens finais; Ipê recomendou pesquisa; quatro outros casos bloqueados; três controles passaram sem chamadas. Total desta execução de trabalho: duas baterias limitadas, 17+16=33 chamadas, sem repetição ilimitada. Nenhuma falha de qualidade foi apresentada como aprovada. Não houve deploy, migração, banco remoto, mensagem real, alteração de credencial ou billing.

CI do código 46cce4e: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43792412542 — success. 173 testes aprovados localmente; Node e UI local/simulada aprovados no CI. Não houve Android físico. Esses testes não comprovam qualidade comercial.

## O que ainda impede a liberação

O revisor passou a distinguir commitment, porém combina supported com functional_proposal e question. O código ainda exige comprovação como fato de alguns desses itens. Há falsos positivos remanescentes. Em Bruma e Vértice, alguns pareceres listaram apenas IDs da mensagem, omitindo os do plano, apesar de terem sido enviados; incomplete_claim_audit é bloqueio válido, não falha a contornar. É necessário exigir cobertura de IDs mais explicitamente no contrato de resposta e separar suporte de premissas factuais de utilidade funcional proposta. Não relaxar a cobertura para aceitar esses casos.

As mensagens ainda oferecem site/landing page antes de verificar oportunidades; algumas inventam plataforma Instagram; Trilha repete independência não comprovada. Seu revisor agora consegue marcar premissas técnicas como unsupported, avanço restrito. O reparo de Trilha terminou em empatia pronta e foi bloqueado localmente. Não há prova de correção comercial completa.

Ipê foi marcado FAIL pelo script por não gerar mensagem. A recomendação de pesquisa pode ser correta comercialmente; o harness precisa avaliar a adequação da decisão em vez de exigir geração. Isso é pendência do teste, não motivo para forçar uma abordagem.

## Respostas integrais — candidatos bloqueados

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

Recomendação de pesquisa:
```json
{
  "action": "research",
  "strength": "plausible",
  "service": "site",
  "evidenceRefs": [
    "public:observation"
  ],
  "buyerTask": "apresentar portfólio de marcenaria",
  "contactReason": "observação de perfil ativo sem domínio próprio identificado",
  "pageRole": "centralizar a visualização das cozinhas autorais para consulta organizada",
  "nextMove": "confirmar se o portfólio já é organizado em algum endereço web ou se a operação ocorre exclusivamente via redes sociais",
  "researchNeeded": "verificar se a empresa possui site em domínios não indexados ou se a presença digital é restrita a redes sociais"
}
```

Mensagem final liberada: nenhuma.

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

> Olá. Acompanhei a coleção Terra da Bruma Cerâmica e notei que a apresentação das peças é feita pelo catálogo social. Sou o Pedro, da PRIME. Como vocês gerenciam uma produção autoral, escrevo para saber se já consideraram ter um site próprio para organizar essa vitrine de produtos de forma mais direta para quem busca conhecer o trabalho de vocês. Faz sentido conversarmos sobre como isso funcionaria?

Bloqueios: claim_not_entailed, incomplete_claim_audit

Tentativa 2:

> Olá. Acompanhei a coleção Terra da Bruma Cerâmica e notei que a apresentação das peças é feita via catálogo social. Sou o Pedro, da PRIME. Como vocês gerenciam uma produção autoral, escrevo para entender se a centralização dessa coleção em um site próprio é algo que faz parte dos planos de vocês.

Bloqueios: claim_not_entailed, incomplete_claim_audit

Mensagem final liberada: nenhuma.

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

> Olá. Notei no Instagram da Vértice o anúncio da turma de fotografia noturna, mas ao clicar em 'Saiba mais', fui levado à página geral de cursos. Na PRIME, desenvolvemos landing pages focadas em um único curso, o que permite que o interessado consulte o programa completo e siga para a matrícula sem precisar buscar dentro de um catálogo. Faz sentido para vocês separar a comunicação de cursos específicos em páginas dedicadas?

Bloqueios: claim_not_entailed, incomplete_claim_audit

Tentativa 2:

> Olá. Sou o Pedro, da PRIME. Vi o anúncio da turma de fotografia noturna no Instagram e notei que, ao clicar em 'Saiba mais', o link direciona para a página geral de cursos da Vértice. A página geral de cursos atende bem a necessidade de quem busca detalhes específicos sobre essa turma de fotografia?

Bloqueios: claim_not_entailed, incomplete_claim_audit

Mensagem final liberada: nenhuma.

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

> A ideia é ter um espaço que organize o programa do intensivo e os diferenciais para adultos em um único lugar, servindo como uma vitrine antes do clique para a inscrição. Em vez de enviar o link direto, você teria uma página própria que apresenta o método e o conteúdo, mantendo o botão de inscrição como o passo final claro. Faz sentido para o que você busca hoje?

Bloqueios: claim_not_entailed

Tentativa 2:

> Uma landing page para o intensivo funcionaria como uma página única, onde você incluiria o conteúdo programático e os detalhes para o público adulto. O objetivo dela seria apresentar essas informações antes do interessado acessar o link de inscrição que você já utiliza. Como você organiza essas informações hoje para quem pergunta sobre o curso?

Bloqueios: unsupported_claim, claim_not_entailed

Mensagem final liberada: nenhuma.

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

> A ideia da landing page não é substituir seu site nem interferir no trabalho da sua agência, mas sim criar um espaço isolado e focado apenas na expedição de observação de aves. Como ela funciona de forma independente, você poderia mantê-la como um complemento para essa ação específica sem alterar nada no que já está consolidado. Faz sentido para você avaliarmos como essa página funcionaria à parte?

Bloqueios: unsupported_claim, claim_not_entailed, factualSafety, multiple_questions

Tentativa 2:

> Entendo perfeitamente o seu ponto. A landing page que proponho é um endereço web distinto do seu site atual. Como ela funciona como um site novo, o conteúdo da sua expedição de observação de aves ficaria concentrado lá, sem necessidade de alterações no site que sua agência já administra.

Bloqueios: canned_empathy

Mensagem final liberada: nenhuma.

## Avaliação comercial

Bruma: contexto de coleção preservado, mas abordagem ainda parecida com roteiro e oportunidade fraca. Vértice: último texto pede avaliação da página geral, mas ainda inventa Instagram e pode induzir diagnóstico antes de checar rota específica. Rumo: última explicação é mais funcional e compreensível; a pergunta seguinte pode reiniciar descoberta desnecessária. Trilha: promessa de independência persiste, portanto não confiável. Não atribuir taxas de conversão a esses textos.

Estado: REPROVADA para uso comercial; correções parciais preservadas, nenhuma publicação autorizada ou realizada. Próxima implementação deve usar os pareceres integrais adjacentes como regressões, sem novos testes reais automáticos até ter correção justificável e validada localmente.
