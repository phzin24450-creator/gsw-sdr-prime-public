# PRIME — fechamento técnico e preparo de liberação

Atualizado em 24/11/2026. **Código comercial homologado na suíte definida; aplicação publicada ainda não homologada nessa versão.**

## Concluído

- Suíte local de fechamento: **222 testes passaram, zero falhas** em 24/11/2026, incluindo a nova integração API/PostgreSQL.

- Código comercial validado: `8dc3b42b75c6d5189ab1ce96ec18b5e6561c967a`.
- Cinco cenários comerciais e três controles passaram na mesma versão, dez chamadas HTTP 200. Relatório: [homologação comercial](PRIME-HOMOLOGACAO-COMERCIAL-RESULTADO.md).
- CI dessa versão: 45478777717, testes Node e interface em Chromium (360 e 1440 px, regras e provedor simulado).
- Verificação adicional `test/commercial-release-integration.test.js`: reprodução offline da resposta real fictícia de fornecedor, com API autenticada e PostgreSQL PGlite. Valida texto e auditoria persistidos, nova instância do store, edição, pedido repetido sem nova geração, ausência de rota de envio e opt-out preservado ao arquivar/restaurar.
- O replay não é outra avaliação semântica nem nova chamada Gemini: recompõe a resposta do revisor a partir do ledger preservado e testa sua integração com a aplicação.
- `git diff 8dc7447 -- db src/db` vazio: nenhuma mudança de banco introduzida pelas correções comerciais. Isso não prova que o banco publicado já esteja atualizado.
- Os novos commits de fechamento acrescentam teste e documentação; o código de execução continua o homologado.

## Pendências para uso no ambiente publicado

| Etapa | Estado | Critério de conclusão |
|---|---|---|
| Backup externo e recuperação | Não comprovado com dados atuais | Exportação cifrada para destino privado verificado, download e restauração em banco isolado com conferência de conteúdo e permissões |
| Identificar versão publicada e rollback | Registro antigo, requer reconferência | Registrar commit realmente em execução, configuração não secreta e ponto de retorno; não presumir que o registro de 14/11 continua atual |
| Publicar em desenvolvimento | Não executado | Deploy do SHA exato após backup validado e autorização específica, sem migração remota implícita |
| Smoke test publicado | Pendente | Login, ready, modo Humano, geração revisada, erro/fallback identificado e histórico preservado, só dados fictícios |
| Android físico | Pendente | Revisar/corrigir print, gerar, editar, copiar, abrir WhatsApp sem enviar, retornar e conferir histórico/opt-out |
| Liberação para uso real | Pendente | Registrar resultados das etapas anteriores e decisão do proprietário |

## Sequência preparada

1. Reconfirmar em leitura o serviço de desenvolvimento, branch, autoDeploy, commit publicado e presença das variáveis sem acessar valores. Não deduzir a configuração atual dos relatórios antigos.
2. Verificar o destino privado de backup já mencionado no histórico (`gsw-sdr-prime-v42-backups`), acesso e custódia da chave; não criar bucket ou ativar cobrança automaticamente. Seguir o procedimento de [backup e restauração](V4.2-PRE-HOMOLOGACAO-OPERACIONAL.md). Os ensaios sintéticos anteriores não substituem backup real restaurável.
3. Confirmar quais migrações já existem no destino. A presente correção comercial não adiciona migrações. Caso o destino seja anterior à V4.2, registrar as pendências e tratar a mudança de banco separadamente.
4. Fixar o SHA candidato e o SHA de rollback. Publicar apenas no desenvolvimento após liberação específica das operações remotas. Não fazer merge em branch que possa disparar deploy como atalho.
5. Executar o smoke test publicado e o roteiro de Android do documento operacional. Não enviar WhatsApp e não usar conversas reais como teste.
6. Se houver regressão, voltar somente a aplicação ao SHA de rollback verificado. Sem down migration, DROP ou restauração sobre dados novos. Guardar evidências sem credenciais nem dados pessoais.

## Configuração atual do código

Gemini: `gemini-3.1-flash-lite`, raciocínio MEDIUM. Limite de quatro chamadas por geração completa; até 45 s por chamada e janela total de 180 s. Retry de transporte e reparo comercial respeitam o mesmo teto; nem toda falha permite reparo se não houver orçamento para geração e revisão. Há telemetria de etapa, HTTP, duração, tokens quando fornecidos e término. Falha não equivale a aprovação. O 503 anterior permanece sem causa raiz determinada; a última rodada bem-sucedida não elimina risco de indisponibilidade.

## Limites desta entrega

Nenhum deploy, acesso a credenciais, consulta ou alteração de banco remoto, novo teste Gemini ou mensagem real foi executado neste fechamento. A restrição expressa a deploy e banco remoto permanece válida; autorização genérica para completar o sistema não foi tratada como revogação dela. Prospecta continua com fluxo operacional/manual, sem prometer integração automática não implementada. A evolução visual PRIME V1 é um projeto separado, fora desta homologação do Copiloto.
