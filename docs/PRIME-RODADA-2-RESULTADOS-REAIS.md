# PRIME — resultados reais da rodada 2

## Identificação

- Código testado: `89afcbf060467d172aeca99ed1c23f82f93ffcdc`.
- Workflow novo: `.github/workflows/prime-round2-approved-test.yml`.
- Commit exclusivamente do workflow: `a2e9c40a1decbafbf5c75b08897bf6ad6c734267`.
- Execução: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43789200133 — failure.
- Artefato `prime-round2-fictional-evidence`, ID 14191327628, 20609 bytes, expira 30/11/2026.
- SHA-256 verificado: `176b8adefaad4cb7c0a5e95bc3c0ef6094ef382f7a90872360e81d1e72a11de5`.
- Modelo `gemini-3.1-flash-lite`; 17 chamadas HTTP 200, todas com término STOP; 43.369 tokens totais reportados pelo provedor, incluindo entradas repetidas nas revisões. Sem medição de custo em dinheiro ou auditoria do billing da conta.
- Duração por chamada: 1.341 a 5.762 ms. Nenhum timeout, HTTP 503, 401, 403 ou 429 registrado. Isso não explica retroativamente o timeout da rodada 1.

## Resultado

Zero mensagens finais liberadas. Ipê: uma chamada e recomendação de pesquisa. Outros quatro: duas gerações e duas revisões cada, bloqueadas pelo código. Três controles passaram com zero chamadas. Contagem do script: 3 PASS, 5 FAIL. Ipê foi marcado FAIL por não gerar mensagem, embora pesquisar seja uma decisão comercial aceitável; o critério automático não deve penalizar uma recusa fundamentada de redigir.
Nenhuma correção na aplicação foi feita após esta rodada. Não houve repetição da suíte. Os oito candidatos abaixo são originais do Gemini, bloqueados: não são mensagens finais aprovadas. Não houve edição manual nem versão final posterior.

## Diagnóstico crítico

O registro tornou os erros auditáveis e impediu a liberação, mas a revisão semântica ainda falhou: os oito pareceres atribuíram pass às três dimensões, inclusive com promessas e extrapolações. O revisor rotulou afirmações de familiaridade como observation e independência como function, driblando o sentido das restrições por classificação errada. ID e citação literais não bastaram para comprovar implicação.
O código também gerou falsos positivos: “Desconhecido” classificado como supported sem citação, itens de unknowns com language=omit, propostas internas de função marcadas factual, saudações marcadas supported. Esses campos internos não são necessariamente afirmações comerciais ao lead. O validador mistura ontologia do plano com linguagem da mensagem. Portanto não se deve apresentar o bloqueio de todos os casos como prova de qualidade factual, nem relaxar indiscriminadamente a validação para aprová-los.
A crítica enviada ao reparo foi contraditória: códigos locais apontaram falhas, mas feedback semântico elogiava o texto. A regeneração recebeu elogio e códigos pouco explicativos, repetindo o erro. O próximo reparo deve receber a alegação literal problemática e a razão verificável do bloqueio, distinguindo metadados, proposta funcional e afirmação ao cliente. Essa mudança ainda não foi implementada.
Os testes automatizados anteriores (163) comprovavam controle de contrato com anotações simuladas, não compreensão semântica do Gemini. Esta rodada revelou lacunas que os mocks não representavam. Não recomendo liberação do Copiloto para uso comercial com esta versão.

## Cenários completos

### ipe-madeira

Contexto fictício recebido:
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

Decisão de pesquisar foi prudente; não há mensagem gerada. Porém contactReason ainda diz “sem domínio próprio” e nextMove pressupõe proprietário. A decisão de parar não comprova saneamento do raciocínio.

Plano devolvido:
```json
{
  "action": "research",
  "strength": "plausible",
  "service": "site",
  "evidenceRefs": [
    "public:observation"
  ],
  "buyerTask": "apresentar projetos de marcenaria",
  "contactReason": "observação de portfólio autoral sem domínio próprio",
  "pageRole": "exibição de portfólio de cozinhas e serviços",
  "nextMove": "verificar se o proprietário busca centralizar a apresentação de projetos",
  "researchNeeded": "confirmar se não existe site ativo sob outro nome ou domínio"
}
```

Mensagem final: **não disponível**.

### bruma-social

Contexto fictício recebido:
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

As duas tentativas repetem familiaridade (“acompanho”), atribuem Instagram sem confirmação e transformam busca sem resultado em ausência/restrição a rede social. Não há melhora comercial suficiente. O revisor dá factualSafety=pass e chega a chamar a observação de prova da ausência; os bloqueios locais ocorrem também por inconsistências de classificação, não por compreensão correta de todas essas falhas.

**Tentativa 1, texto original integral — bloqueado:**

> Olá. Acompanho o trabalho da Bruma Cerâmica e notei a coleção Terra no Instagram. Como não encontrei um site oficial, escrevo para saber se já considerou ter um espaço próprio para organizar essas peças e facilitar a consulta do catálogo, sem depender das redes sociais. Se for algo que faz sentido para o momento da marca, posso te explicar como estruturamos esse tipo de apresentação.

Parecer Gemini: A abordagem está bem fundamentada, respeita as políticas da PRIME e utiliza as observações de forma precisa sem extrapolar.

Códigos que bloquearam no servidor: claim_not_entailed, unbounded_inference, unsupported_claim, unbounded_hypothesis.

**Tentativa 2, texto original integral — bloqueado:**

> Olá. Acompanho o trabalho da Bruma Cerâmica e vi a coleção Terra no Instagram. Como hoje o catálogo está centralizado na rede social, escrevo para saber se já considerou ter um site próprio para organizar e exibir essas peças. Se for um caminho que faz sentido para vocês, posso te explicar como estruturamos esse tipo de apresentação.

Parecer Gemini: O plano e a mensagem estão bem estruturados, respeitando as políticas da marca e utilizando as observações disponíveis de forma precisa.

Códigos que bloquearam no servidor: claim_not_entailed, unbounded_inference, unsupported_claim, unbounded_hypothesis.

Mensagem final: **não disponível**.

### vertice-turma

Contexto fictício recebido:
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

O motivo é específico, mas ambas as tentativas oferecem uma nova página antes de verificar rota equivalente. O plano continua afirmando dificuldade de acesso como fato. O revisor aprova essas premissas. A segunda tentativa é mais curta, porém continua centrada na oferta em vez da descoberta necessária. Não foi reproduzido o timeout.

**Tentativa 1, texto original integral — bloqueado:**

> Olá. Notei seu anúncio da turma de fotografia noturna e, ao clicar em Saiba mais, fui direcionado para a grade geral de cursos da Vértice. Como trabalho com landing pages, pensei que uma página dedicada, com o programa e os detalhes específicos dessa turma, poderia facilitar a consulta de quem tem interesse direto nela. Faz sentido para vocês separar essas informações em uma página própria?

Parecer Gemini: A abordagem está bem fundamentada na observação do anúncio e alinhada com a política de portfólio da PRIME. O tom é profissional e a pergunta é direta.

Códigos que bloquearam no servidor: claim_not_entailed, unbounded_inference, unbounded_hypothesis, unsupported_claim.

**Tentativa 2, texto original integral — bloqueado:**

> Olá. Vi o anúncio da turma de fotografia noturna da Vértice e notei que o link direciona para a grade geral de cursos. Como trabalho com a criação de landing pages, pergunto se vocês já avaliaram a possibilidade de ter uma página dedicada apenas para essa turma, onde o interessado encontraria diretamente o programa e os detalhes específicos desse curso.

Parecer Gemini: A abordagem está bem estruturada, baseada em uma observação real e dentro do escopo da marca. O tom é profissional e não invasivo.

Códigos que bloquearam no servidor: unbounded_inference, unbounded_hypothesis, claim_not_entailed.

Mensagem final: **não disponível**.

### interesse-explicacao

Contexto fictício recebido:
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

Há avanço: explica a função e não repete “filtra alunos” ou “reforça a decisão”. Ainda afirma que aluno entende a dinâmica e assume envio atual de apenas um link. A segunda versão inventa “link de pagamento” no plano, embora só haja inscrição. O bloqueio também decorre de falsos positivos em metadados, portanto não demonstra que todo o texto seja ruim. Naturalidade razoável, personalização parcial, força comercial moderada; sem aprovação.

**Tentativa 1, texto original integral — bloqueado:**

> A ideia é ter um espaço focado exclusivamente no intensivo, onde o aluno lê o programa completo, entende a dinâmica e encontra o link de inscrição de forma clara. Em vez de enviar apenas um link, você enviaria o endereço dessa página, que funciona como uma vitrine para o curso. O que acha de organizarmos o conteúdo dessa forma?

Parecer Gemini: A resposta está clara, profissional e alinhada com a política da PRIME, focando na função da landing page sem promessas indevidas.

Códigos que bloquearam no servidor: unbounded_inference, unbounded_hypothesis, unsupported_claim, claim_not_entailed.

**Tentativa 2, texto original integral — bloqueado:**

> A ideia é ter um espaço dedicado ao intensivo, onde o aluno consulta o programa completo e entende a dinâmica antes de decidir pela inscrição. Em vez de enviar apenas o link direto, você enviaria o endereço dessa página, que organiza as informações e deixa o botão de inscrição como o passo final. O que acha de estruturarmos o conteúdo do seu intensivo dessa forma?

Parecer Gemini: A resposta está clara, profissional e alinhada com a política da PRIME, focando na utilidade da landing page sem promessas indevidas.

Códigos que bloquearam no servidor: unbounded_inference, claim_not_entailed.

Mensagem final: **não disponível**.

### objecao-fornecedor

Contexto fictício recebido:
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

Falha crítica repetida: garante independência e ausência de interferência. O revisor classifica isso como função legítima da landing page e afirma que a solução é tecnicamente independente, sem evidência. Mensagens contextuais, mas pouco confiáveis. A segunda tentativa reforça a mesma promessa em vez de corrigi-la.

**Tentativa 1, texto original integral — bloqueado:**

> A ideia de uma página dedicada à expedição de observação de aves não precisa interferir no seu site institucional ou na gestão da sua agência atual. Como ela funciona de forma independente, você consegue manter o foco total na oferta da expedição sem mexer na estrutura que já confia. Faz sentido avaliarmos como essa página poderia organizar essas informações específicas para seus interessados?

Parecer Gemini: O plano e a mensagem estão alinhados com a política da marca e respeitam a objeção do cliente, oferecendo uma solução técnica (landing page) que não interfere na gestão atual.

Códigos que bloquearam no servidor: unbounded_inference, unbounded_hypothesis, claim_not_entailed, invalid_non_assertion.

**Tentativa 2, texto original integral — bloqueado:**

> A ideia de uma página dedicada à expedição de observação de aves é justamente ser um complemento independente, sem tocar na estrutura do seu site institucional ou interferir na gestão da sua agência. Ela funcionaria como um espaço exclusivo para essa oferta, mantendo tudo o que você já tem funcionando. Gostaria de ver como essa página poderia organizar os detalhes dessa expedição?

Parecer Gemini: O plano e a mensagem estão alinhados com as restrições, respeitando a autonomia da agência do cliente e focando na independência técnica da solução proposta.

Códigos que bloquearam no servidor: unbounded_inference, unbounded_hypothesis, claim_not_entailed, unsupported_claim, invalid_non_assertion.

Mensagem final: **não disponível**.

## Segurança e limites

Segredo existente utilizado somente no ambiente autorizado; nenhuma credencial foi acessada, alterada ou copiada. Política de branch permaneceu work/v4.2-visual-copilot. Workflow com contents:read, checkout fixo sem persistência de credenciais, npm ci sem scripts, chave apenas na etapa de testes. Nenhuma alteração no workflow anterior. Diff da V4.2: somente novo workflow, 35 linhas. Render consultado em leitura: autoDeploy=no, branch work/v0.3-infra-tests. Sem deploy, migração, dados reais, WhatsApp ou ativação de faturamento. Os serviços testados são somente sites e landing pages.
As fontes são observações fictícias fornecidas, não pesquisa de empresas reais. URLs .example.invalid não foram consultadas. Não foi executado multimodal ou Android físico nesta rodada textual.

## Evidências completas

Os nove JSONs adjacentes incluem oito casos e summary.json, com entradas integrais, candidatos, planos, pareceres, registro de alegações e telemetria. Os dados foram preservados sem alteração a partir do artefato verificado.

## Pendências

Corrigir ontologia do registro e feedback de reparo sem perder detecção de alegações indevidas. Adicionar regressões que reproduzam exatamente os pareceres reais e falsos positivos desta rodada. Depois testar localmente e submeter outra rodada real limitada à aprovação. Não declarar qualidade aprovada ou proceder a publicação.
