# Diagnóstico de transporte MINIMAL/MEDIUM

Executado com autorização explícita do proprietário, em 16/11/2026 (America/Sao_Paulo).
Workflow adicionado: .github/workflows/prime-transport-two-call.yml, branch work/v4.2-visual-copilot, commit d147bae4469fe2eb6c993251110b50439147aa94. Proteções existentes preservadas; segredo dedicado usado no runner sem leitura/exibição do valor.
Execução: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43990131371
Job: 133728299236. Resultado: success.

| Nível | HTTP | Duração | Finish reason |
|---|---|---|---|
| MINIMAL | 200 | 1735 ms | STOP |
| MEDIUM | 200 | 1814 ms | STOP |

Exatamente duas chamadas, sem retry. Modelo gemini-3.1-flash-lite, prompt fictício mínimo e schema status=ok idênticos, teto 4096, timeout 45s. Somente nível de raciocínio variou. Diferença de um byte no corpo corresponde ao tamanho dos nomes dos níveis.

O 503 não foi reproduzido neste diagnóstico. Ambos os níveis responderam agora. Isso não comprova causa raiz dos erros anteriores, estabilidade continuada, qualidade comercial ou sucesso com prompt/schema completos da aplicação. Não trocar configuração com base em duas amostras mínimas. A rodada comercial do código corrigido continua pendente. Sem deploy, banco remoto ou mensagem real.

## Telemetria permitida
```text
2026-11-17T00:45:09.5654908Z {"stage":"transport","thinkingLevel":"MINIMAL","attempt":1,"requestBytes":390,"httpStatus":200,"tokens":{"promptTokenCount":19,"candidatesTokenCount":6,"totalTokenCount":25},"finishReason":"STOP","durationMs":1735,"pass":true}
2026-11-17T00:45:11.3768661Z {"stage":"transport","thinkingLevel":"MEDIUM","attempt":2,"requestBytes":389,"httpStatus":200,"tokens":{"promptTokenCount":19,"candidatesTokenCount":5,"thoughtsTokenCount":164,"totalTokenCount":188},"finishReason":"STOP","durationMs":1814,"pass":true}
2026-11-17T00:45:11.3770723Z {"completed":true,"calls":2}
```
