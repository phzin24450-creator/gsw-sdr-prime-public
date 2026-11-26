# PRIME — estado real após teste de raciocínio MEDIUM

Data: 16/11/2026. Branch de aplicação: work/prime-commercial-reasoning-fix. Código: 06bc2150c4dbde0beb1d25574e2554891fa884ae. Baseline preservada: 8dc744752974c7e8c2dd61eef7f2e6a57fa17c20.

## Resultado

**NÃO APROVADO para homologação comercial.** A configuração foi implementada e passou nos testes locais e CI, mas a comparação real foi bloqueada pelo provedor antes de gerar texto. Não há respostas novas para apresentar nem evidência de melhoria comercial com MEDIUM.

- Testes locais: 192 aprovados, zero falhas. Evidência: docs/evidence/prime-functional-grounding/reasoning-node-tests.txt.
- CI: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43902835324 — Node, UI normal e UI com Gemini simulado aprovados. Larguras 360 e 1440; Android físico não testado.
- Rodada real: https://github.com/phzin24450-creator/gsw-sdr-prime-public/actions/runs/43902961463. Workflow prime-reasoning-validation-test.yml; commit do harness 8f5bd8d1fb58b80fc419d4fc58a2408c4eadd6e9, checkout fixo 06bc215.
- Artefato 14244365717, SHA256 086498fc8eb402c46fce2a950e67fe51e81e12499aaf972c1c9cee0d30c31fbc, integridade verificada.

## Diagnóstico da execução

| Cenário fictício | Resultado real |
|---|---|
| Ipê Madeira | Geração HTTP 503 duas vezes; nenhuma mensagem |
| Bruma Cerâmica | Geração HTTP 503 duas vezes; nenhuma mensagem |
| Vértice, Rumo e Trilha | Não executados: circuito interrompido por indisponibilidade |
| Pesquisa insuficiente, recusa e opt-out | Três controles aprovados sem chamada à API |

Total: quatro chamadas, todas HTTP 503. Durações: 3646, 42548, 3044 e 6489 ms. Sem HTTP 400/401/403/429. O erro observado é indisponibilidade do provedor; a causa interna, inclusive eventual relação com a configuração, não foi estabelecida. Não há evidência para atribuí-lo a chave, cobrança ou quota. Foram respeitados um retry transitório por caso e parada após dois casos com falha de provedor. Nenhum aumento de timeout nem repetição adicional.

## O que mudou

Geração e revisão usam MEDIUM no mesmo gemini-3.1-flash-lite. Teto de saída 4096 tokens; 45s por chamada, 180s por geração e quatro chamadas máximas preservados. Telemetria registra apenas nível enumerado e contagens; pensamento e credencial não são persistidos. O teste de transporte comprova a configuração, não qualidade real.

A documentação oficial confirma suporte do modelo a MEDIUM e Free tier para entrada/saída incluindo raciocínio. Links em PRIME-RACIOCINIO-VALIDACAO.md. Não foi ativado faturamento nem auditada novamente a conta de cobrança.

## Pendências que continuam abertas

1. Reexecutar uma rodada limitada quando o provedor estiver disponível, usando o mesmo commit fixo; não repetir tentativas durante a indisponibilidade.
2. Conferir Ipê (qualidade/familiaridade/canal principal inventados), Bruma (elogios e garantia), Vértice (rota equivalente e pergunta composta), Rumo (efeito na decisão e conteúdo não fornecido) e Trilha (não interferência técnica).
3. Comparar resultados integrais e latência de MEDIUM com a evidência MINIMAL preservada, sem declarar melhoria a partir de teste simulado.
4. Decidir configuração candidata apenas após respostas reais e revisão comercial humana.

As últimas respostas reais completas permanecem em PRIME-RACIOCINIO-VALIDACAO.md e PRIME-ALEGACOES-COMPOSTAS-RESULTADOS.md. Elas são anteriores à alteração MEDIUM e foram reprovadas comercialmente; não são novas saídas nem respostas desta rodada.

## Preservação e limites

Sem deploy, migração, banco remoto, mudança de credencial, alteração do Prospecta, redesign ou WhatsApp real. Na branch V4.2 foi adicionado somente workflow novo; código da aplicação permaneceu na branch isolada. Workflows anteriores e restrições do segredo não foram alterados. Manual integral não disponível no ambiente; não foi alegada nova leitura.

## Telemetria original e controles

### bruma-social.json
```json
{
  "id": "bruma-social",
  "pass": false,
  "error": {
    "code": "provider_unavailable",
    "httpStatus": 503,
    "stage": "generation"
  },
  "telemetry": {
    "startedAt": 1794844997769,
    "calls": [
      {
        "stage": "generation",
        "attempt": 1,
        "requestBytes": 12493,
        "httpStatus": 503,
        "durationMs": 3044,
        "timeoutMs": 45000,
        "thinkingLevel": "MEDIUM",
        "errorCode": "provider_unavailable"
      },
      {
        "stage": "generation",
        "attempt": 2,
        "requestBytes": 12493,
        "httpStatus": 503,
        "durationMs": 6489,
        "timeoutMs": 45000,
        "thinkingLevel": "MEDIUM",
        "errorCode": "provider_unavailable"
      }
    ]
  }
}
```

### interesse-explicacao.json
```json
{
  "id": "interesse-explicacao",
  "pass": false,
  "skipped": "provider_unreliable"
}
```

### ipe-madeira.json
```json
{
  "id": "ipe-madeira",
  "pass": false,
  "error": {
    "code": "provider_unavailable",
    "httpStatus": 503,
    "stage": "generation"
  },
  "telemetry": {
    "startedAt": 1794844943568,
    "calls": [
      {
        "stage": "generation",
        "attempt": 1,
        "requestBytes": 12431,
        "httpStatus": 503,
        "durationMs": 3646,
        "timeoutMs": 45000,
        "thinkingLevel": "MEDIUM",
        "errorCode": "provider_unavailable"
      },
      {
        "stage": "generation",
        "attempt": 2,
        "requestBytes": 12431,
        "httpStatus": 503,
        "durationMs": 42548,
        "timeoutMs": 45000,
        "thinkingLevel": "MEDIUM",
        "errorCode": "provider_unavailable"
      }
    ]
  }
}
```

### objecao-fornecedor.json
```json
{
  "id": "objecao-fornecedor",
  "pass": false,
  "skipped": "provider_unreliable"
}
```

### optout.json
```json
{
  "id": "optout",
  "pass": true,
  "decision": "blocked"
}
```

### pesquisa-insuficiente.json
```json
{
  "id": "pesquisa-insuficiente",
  "pass": true,
  "error": {
    "code": "research_required",
    "httpStatus": null,
    "stage": null
  },
  "telemetry": null
}
```

### recusa.json
```json
{
  "id": "recusa",
  "pass": true,
  "decision": "blocked"
}
```

### summary.json
```json
{
  "totalCalls": 4,
  "failed": 5,
  "stopReason": "provider_unreliable"
}
```

### vertice-turma.json
```json
{
  "id": "vertice-turma",
  "pass": false,
  "skipped": "provider_unreliable"
}
```

