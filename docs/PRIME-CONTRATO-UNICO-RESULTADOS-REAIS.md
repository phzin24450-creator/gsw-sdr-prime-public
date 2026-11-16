# PRIME — validação real do contrato de auditoria por chaves

## Identificação

Código: 227186b8019fac5768315cb8b25287545ead6155. Branch de código: work/prime-commercial-reasoning-fix. Workflow novo somente na branch permitida: 6be55d44a80ea761ccaa1905e162ec850a3c0cfd. Nenhum workflow anterior foi alterado.
Execução real: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43846928294 . Artefato 14215273610, 20735 bytes, expira 30/11/2026. SHA-256 conferido: ee3570ca778c5262061ea5a33c034e81ffeecc6dd61bde57cd35e849c8c45dda.
CI técnico do código: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43846867964 — success; Node e UI nos modos local e Gemini simulado. 181 testes locais aprovados. Não houve Android físico nem nova análise multimodal nesta rodada textual.

## Resultado

13 chamadas reais ao gemini-3.1-flash-lite, todas HTTP 200 e STOP. Duração por chamada 1302–4829 ms; 36.522 tokens totais reportados (entradas repetidas inclusas), sem estimativa inventada de custo em dinheiro. Nenhum timeout, quota ou erro de autenticação. Somadas às cinco da tentativa anterior desta etapa: 18 chamadas, abaixo do teto de 20. Não executar outra suíte automaticamente.
6 PASS e 2 FAIL técnicos: Bruma e Vértice têm mensagem final; Ipê recomenda pesquisa; os três controles passam sem rede. Rumo e Trilha falham após uma tentativa de reparo. Os seis PASS não representam seis abordagens comerciais aprovadas. O revisor semântico ainda pode aprovar extrapolações ou classificar mal funções, intenções e perguntas.
A estrutura por chaves não teve omissão de unidades nem HTTP 400 neste ensaio, diferente da estrutura anterior. Isso comprova compatibilidade neste conjunto de casos, não estabelece a causa exata do 400 anterior nem garantia universal.

## Limites de segurança

Somente dados fictícios. O segredo existente permaneceu no ambiente gemini-v42-tests restrito a work/v4.2-visual-copilot. Não houve leitura de chave, mudança de restrições, acesso ao banco remoto, exportação de dados, migração, deploy, faturamento ativado ou mensagem WhatsApp. Render consultado somente para leitura, autoDeploy=no. Na V4.2 foram adicionados apenas workflows de teste; código de aplicação permanece na branch isolada. Marca PRIME e serviços exclusivos de sites/landing pages preservados.

## Avaliação dos cinco casos

### ipe-madeira

Contexto fictício completo:
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

Recomendação de pesquisa é apropriada quando a existência de domínio próprio é incerta. Não há mensagem. O plano deve ser lido criticamente: pesquisar não valida automaticamente os demais campos.

Plano sem mensagem:
```json
{
  "action": "research",
  "strength": "plausible",
  "service": "site",
  "evidenceRefs": [
    "public:observation"
  ],
  "buyerTask": "apresentar portfólio de cozinhas autorais",
  "contactReason": "observação de perfil ativo sem domínio próprio identificado",
  "pageRole": "centralizar a visualização das cozinhas autorais e facilitar o contato direto",
  "nextMove": "confirmar se a Ipê Madeira Fictícia já possui um site ou se centraliza tudo via redes sociais",
  "researchNeeded": "verificar se existe domínio registrado em nome da empresa ou se o cliente possui interesse em estruturar um catálogo próprio"
}
```

Não houve mensagem final liberada.

### bruma-social

Contexto fictício completo:
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

Melhora factual: não afirma ausência de domínio e não inventa Instagram nesta tentativa. Usa coleção e catálogo concretos. Ainda sugere familiaridade em “acompanhei o trabalho”, apresenta o remetente tarde e segue pergunta genérica sobre considerar site. Naturalidade 3/5, personalização 3/5, força comercial 2/5. Não considero pronta para envio só porque o revisor passou.

Candidato original 1, integral:

> Olá. Acompanhei o trabalho da Bruma Cerâmica e a coleção Terra. Como não encontrei um domínio oficial, gostaria de saber se vocês já consideraram ter um site próprio para organizar essa coleção e facilitar a consulta das peças pelos interessados, fora do catálogo social. Sou o Pedro, da PRIME, e trabalho justamente com a criação desses espaços de apresentação.

Mensagem final integral — idêntica ao candidato original:

> Olá. Acompanhei o trabalho da Bruma Cerâmica e a coleção Terra. Como não encontrei um domínio oficial, gostaria de saber se vocês já consideraram ter um site próprio para organizar essa coleção e facilitar a consulta das peças pelos interessados, fora do catálogo social. Sou o Pedro, da PRIME, e trabalho justamente com a criação desses espaços de apresentação.

### vertice-turma

Contexto fictício completo:
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

Motivo específico e função compreensível, porém pula a verificação de rota equivalente e passa à oferta. “Anúncio” é mais forte que post, podendo sugerir campanha não verificada. Naturalidade 3/5, personalização 4/5, força comercial 3/5. A progressão continua inadequada; sem aprovação comercial.

Candidato original 1, integral:

> Olá. Notei o anúncio da turma de fotografia noturna da Vértice e vi que o link leva à página geral de cursos. Trabalho na PRIME criando landing pages e pensei que uma página focada apenas nessa turma poderia facilitar a consulta do programa pelos interessados. Faz sentido para vocês separar a divulgação de cursos específicos dessa forma?

Mensagem final integral — idêntica ao candidato original:

> Olá. Notei o anúncio da turma de fotografia noturna da Vértice e vi que o link leva à página geral de cursos. Trabalho na PRIME criando landing pages e pensei que uma página focada apenas nessa turma poderia facilitar a consulta do programa pelos interessados. Faz sentido para vocês separar a divulgação de cursos específicos dessa forma?

### interesse-explicacao

Contexto fictício completo:
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

Primeiro candidato volta a prometer filtragem de interessados. Reparação removeu essa frase, mas foi bloqueada em “centraliza as informações essenciais”. Há explicação útil, mas conteúdo e comunicação geral ainda presumidos. O revisor usou fonte inadequada ou compromisso inadequado no trecho funcional, de modo que ainda pode haver falso positivo. Segurança factual e adequação comercial exigem avaliar a frase, não só os códigos. Não há mensagem final.

Candidato original 1, integral:

> A ideia seria criar um ambiente focado apenas no intensivo, separado do restante da sua comunicação. Nela, organizamos os benefícios do curso, o cronograma e os diferenciais para o público adulto, com o botão de inscrição posicionado logo após as informações principais. Isso ajuda a filtrar quem já tem interesse no programa, entregando o link de inscrição para quem já percorreu o conteúdo. Faz sentido para o que você planejou?

Bloqueios: unbounded_inference
Parecer original: A mensagem está clara, profissional e alinhada com as políticas da PRIME, focando na função da página sem prometer resultados de vendas.

Candidato original 2, integral:

> A ideia é criar uma página focada exclusivamente no intensivo, separada da sua comunicação geral. Nela, organizamos os diferenciais do curso, o cronograma e o público-alvo, permitindo que o interessado consulte esses detalhes antes de seguir para o link de inscrição que você já utiliza. Dessa forma, a página centraliza as informações essenciais para quem busca esse programa específico. O que acha dessa organização?

Bloqueios: unbounded_inference
Parecer original: A mensagem está clara, profissional e responde diretamente à solicitação do cliente sem promessas indevidas.

Não houve mensagem final liberada.

### objecao-fornecedor

Contexto fictício completo:
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

Promessa de não interferência continua nas duas gerações. O revisor agora aponta concretamente a premissa técnica, avanço frente às primeiras rodadas, embora também confunda intenção de preservar fornecedor com garantia técnica e conte perguntas em excesso. Reparo não resolve o defeito comercial; bloqueio preservado. Não há mensagem final.

Candidato original 1, integral:

> A intenção não é substituir o trabalho da sua agência nem alterar o seu site institucional. Como o seu objetivo é apresentar especificamente a expedição de observação de aves, podemos estruturar uma landing page independente para esse serviço. Ela funcionaria como um destino exclusivo para essa oferta, sem tocar na estrutura que você já mantém. Faz sentido explorarmos essa possibilidade?

Bloqueios: unsupported_claim, unbounded_inference, factualSafety
Parecer original: As unidades u2 e u9 foram marcadas como inaceitáveis pois afirmam que a nova página não interferirá na estrutura atual do site, o que é uma premissa técnica não sustentada. O restante do plano e da mensagem está adequado.

Candidato original 2, integral:

> A intenção não é substituir sua agência nem alterar o site que você já mantém. A landing page é uma página dedicada exclusivamente a essa expedição de observação de aves, focada em apresentar os detalhes e o próximo passo para o interessado. Como ela é um projeto à parte, ela não precisa interferir no seu site institucional. Faz sentido explorarmos como essa página poderia ser estruturada para o seu objetivo?

Bloqueios: claim_not_entailed, unsupported_claim, factualSafety, multiple_questions
Parecer original: As unidades u1, u7 e u9 afirmam viabilidade técnica de não interferência no site de terceiros sem evidência. Embora a landing page seja um produto da agência, a independência técnica em relação a um site gerido por outra agência não é um fato garantido.

Não houve mensagem final liberada.

## Alterações implementadas nesta etapa

Classificação única por commitment e campos redundantes calculados no servidor. Auditoria com IDs obrigatórios como chaves e validação local de cobertura. Achados de omissão apontam texto e caminho. Harness distingue pesquisa/não abordagem de falha de provedor. Limite complementar reduzido para 15 chamadas e controles sem rede continuam após parada das gerações.

## Pendências reais e recomendação

Fatos e propostas ainda podem receber julgamento incorreto do Gemini. Novos ajustes devem tratar separadamente premissas contextuais e função proposta, investigar por que o revisor conta perguntas demais e por que confunde intenção com compatibilidade. Vértice precisa verificar existência de página equivalente antes de sugerir a criação. Bruma precisa de motivo mais forte e menos fórmula genérica. Rumo precisa de explicação funcional com conteúdo validado; Trilha precisa estudar viabilidade e respeitar agência sem garantir independência.
Não aprovar uso comercial ou deploy. Não é correto declarar o problema resolvido só porque duas mensagens foram liberadas. Os registros completos adjacentes servem para corrigir as próximas falhas sem repetir investigação ou gastar chamadas em regressões já documentadas.
