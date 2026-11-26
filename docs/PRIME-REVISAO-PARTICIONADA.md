# Revisão particionada — diagnóstico do transporte

A execução 43850648192, código 901569f, parou após duas chamadas: geração HTTP 200 e revisão HTTP 400. Artefato 14217287594, SHA256 98a3ffd7d8595b9eb08deec29b0df717c2ceef7db3951fe5f380089c681a0525. Nenhuma resposta foi apresentada como revisada. Quatro cenários seguintes não executados; controles sem chamada executados.

O corpo de erro não foi coletado; não há evidência suficiente para afirmar a causa exata do HTTP 400, nem atribuí-lo a quota ou autenticação. O esquema dinâmico repetia a estrutura de parts para cada unidade, crescendo com o tamanho do plano/mensagem. Substituído por array de itens id/parts compartilhando o mesmo esquema. IDs, duplicações, omissões, fontes e reconstrução literal continuam verificados localmente. Não há contorno de credenciais ou mudança de modelo.

191 testes locais aprovados. O limite de saída do revisor é 4096; a contagem de chamadas e os timeouts não foram aumentados. Validar o transporte e a qualidade semântica ao vivo antes de concluir correção.
