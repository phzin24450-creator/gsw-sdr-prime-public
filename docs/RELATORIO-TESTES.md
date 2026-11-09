# Relatório de testes — GSW SDR PRIME 0.3

Data: 2026-11-06 (America/Sao_Paulo; execução neste ambiente de desenvolvimento).

Comando: `npm test` em Node.js 22.16.0, sem exigir rede.

**Resultado:** 24 testes; 24 passaram; 0 falharam.

Cobertura funcional: classificador pt-BR de intenções, opção de humano, opt-out, modos de atendimento, resposta local por serviço, preço sem inventar valor, deduplicação, invalidação de rascunho por nova mensagem e takeover, webhook sintético com HMAC válido/inválido e challenge, chave administrativa, aprovação sem envio, contexto validado, qualificação sem dados inventados, migração simulada com BEGIN/COMMIT/ROLLBACK e geração automática opcional de **rascunho**.

**Não significa** que PostgreSQL/Supabase real, Meta WhatsApp, OpenAI, autenticação completa, hospedagem e envio funcionem em produção. A instalação do driver `pg` neste ambiente não foi concluída porque a rede de dependências ficou indisponível; o driver deve ser instalado e o banco testado em Work ou num ambiente com rede.
