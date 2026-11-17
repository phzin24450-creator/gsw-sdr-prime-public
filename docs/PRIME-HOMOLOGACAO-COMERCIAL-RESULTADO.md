# Homologação comercial — estado em 17/11/2026

**Homologação completa pendente. Não liberar para uso real com base nestes resultados.**

Código final: fe65c8d84d489a025cb50f72367b678a3b61d9f4, branch work/prime-commercial-reasoning-fix.
220 testes locais passaram; CI com testes Node e interface aprovado:
https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/44148167073

## O que foi corrigido
- Premissas sem fonte (plataforma, acompanhamento, exclusividade, canal/rota principal e conteúdo não confirmado) não podem se esconder em classificações permissivas do revisor.
- Status neutro de pesquisa e intenção de respeitar fornecedor são diferenciados de alegações factuais ou garantias técnicas.
- Descoberta de rota existente antecede oferta; explicação usa conteúdo confirmado.
- Respostas burocráticas à objeção de fornecedor e variantes “sem precisar alterar/mexer” são bloqueadas localmente.
- Um retry de transporte não elimina o reparo comercial quando ainda cabem geração e revisão no teto de quatro chamadas. Testes reproduzem 503 seguido de rejeição local e reparo; rejeição sem orçamento continua bloqueada.
- Respostas reais e ledgers preservados sem reescrever os casos para fazê-los passar.

## Avaliação da rodada completa
Código 9bc6928, execução https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/44146848824
12 chamadas: 11 HTTP 200 e um timeout de revisão. Cinco casos comerciais, três controles.

| Caso | Resultado observado |
|---|---|
| Ipê | Resposta final contextual, identidade clara, pergunta sobre outra rota; aceita nesta amostra |
| Bruma | Instagram inventado bloqueado no primeiro candidato; reparo retirou a invenção. Pergunta ainda pode ser mais específica; não é prova de excelência comercial |
| Vértice | Observação específica e pergunta sobre programa da turma; aceita nesta amostra |
| Rumo | Explicação de apresentação do programa e inscrição, sem inventar diferenciais; aceita nesta amostra |
| Trilha / fornecedor | Não homologado: promessa técnica no candidato e timeout da revisão |
| Recusa, opt-out, pesquisa insuficiente | Três controles passaram, zero chamadas |

Essa rodada não corresponde ao código final: as correções posteriores afetaram objeção de fornecedor e orçamento de reparo. Não há rodada completa aprovada no código final.

## Diagnóstico separado de transporte
Teste mínimo MINIMAL/MEDIUM anterior respondeu HTTP 200 em ambos; isso não determina a causa dos erros.
Na execução 44147619657, código bdff4d9:
- geração retornou HTTP 503 em 33.499 ms;
- retry retornou HTTP 200 em 6.588 ms;
- candidato com promessa de não alterar o site foi bloqueado localmente;
- identificado o acoplamento indevido entre retry de transporte e reparo comercial, corrigido em fe65c8d.

Validação final direcionada: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/44148187163
Código fe65c8d: uma chamada, timeout na geração em 45.003 ms, nenhum candidato. Os três controles passaram sem chamadas.
Portanto não foi possível validar a correção com resposta real nessa rodada. Não atribuir 503 ao MEDIUM sem comparação controlada suficiente. Não confundir indisponibilidade com reprovação comercial.

## Evidências integrais
- evidence/prime-supplier-targeted-real.json: aprovação automática com texto burocrático, rejeitado na avaliação editorial.
- evidence/prime-full-final-real.json: rodada completa e candidato técnico indevido.
- evidence/prime-supplier-503-real.json: 503, retry e bloqueio local.
- evidence/prime-retry-validation-real.json: timeout final, sem texto gerado.
Os arquivos anteriores de regressão continuam preservados.

## Critério para concluir
Retomar apenas o caso de fornecedor quando o transporte responder, mantendo limite de quatro chamadas e revisão obrigatória; avaliar texto e plano, não apenas status verde. Após aprovação, executar a suíte completa no mesmo código e revisar os cinco textos. Não alterar limiares para obter aprovação, não substituir geração por resposta fixa rotulada como Gemini e não repetir chamadas sem diagnóstico diante de indisponibilidade.

Sem deploy, banco remoto ou envio de mensagens. Uso apenas do segredo dedicado no runner; nenhum valor de credencial foi lido ou registrado. Proteções de ambiente e autorização mantidas. Mudanças remotas avançaram com conferência do SHA anterior, sem sobrescrever trabalho.
