# Status da execução no Work — 07/11/2026

## Concluído
- Instalação do ChatGPT Codex Connector com acesso somente ao repositório público do projeto. Escrita confirmada por criação de branch e commit.
- Código v0.3 publicado em work/v0.3-infra-tests; PR #1 aberto como rascunho, sem merge na main.
- npm install e 24 testes locais aprovados; GitHub Actions também aprovou a revisão inicial.
- Supabase gsw-sdr-prime-dev (ref vpwbzukryiqvqigeynwk), região sa-east-1, PostgreSQL 17.11, criado em organização autorizada.
- Migração gsw_sdr_initial aplicada; cinco tabelas com RLS ativada e sem USAGE para anon/authenticated. Nenhuma política de navegador criada.
- Teste SQL remoto sintético: duplicata descartada por external_id e modo HUMAN confirmado; ROLLBACK executado e ausência de dados de teste verificada em consulta posterior.
- Auditoria Supabase retornou apenas aviso INFO sobre RLS sem políticas nas cinco tabelas; comportamento intencional para schema interno. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Serviço Render gsw-sdr-prime-dev criado no My Workspace, plano free, região virginia, branch de desenvolvimento, auto-deploy desativado.
- Chaves administrativas/de teste geradas e salvas somente no ambiente privado do Render. Nenhuma chave real Meta configurada.
- ENABLE_DEMO=false; AUTO_DRAFTS=false; NODE_ENV=production; HOST=0.0.0.0.

## Bloqueio atual
O runtime do Render ainda não recebeu DATABASE_URL. O conector Supabase fornece SQL administrativo, mas não fornece a senha de conexão PostgreSQL nem os parâmetros completos do pooler. O servidor falha fechado sem DATABASE_URL. O serviço não deve ser tratado como implantação concluída.

Para concluir, cadastrar DATABASE_URL com a conexão do Supabase em modo Session pooler, incluindo a senha, diretamente nas variáveis privadas do Render; não enviar segredo para GitHub ou chat. O backend atual usa search_path de sessão, portanto o pooler deve preservar a sessão. Render não suporta saída IPv6, então o host direto IPv6 do Supabase não serve para este plano sem complemento IPv4 pago. Referência: https://render.com/articles/how-to-connect-a-render-service-to-supabase-postgres

Painel Render: https://dashboard.render.com/web/srv-dbnl94ijnfac73cmu2e0
PR: https://github.com/phzin24450-creator/gsw-sdr-prime-public/pull/1

## Ainda não verificado
- Inicialização Node conectada ao PostgreSQL remoto, /health com storage=postgres e persistência após reinício do backend.
- Lista de schemas expostos no Data API: configuração não foi alterada; consultas SQL não forneceram lista completa. Privilégios de anon/authenticated no schema foram negados e verificados.
- Credenciais e API de IA reais, envio Meta, coexistência WhatsApp, autenticação por operador e preparação para dados reais.
- Imagem Docker construída ou executada.

## Restrições preservadas
Nenhum WhatsApp comercial conectado, nenhuma mensagem enviada, nenhum dado real de cliente usado. Repositório privado e Prospecta preservados. Nenhum recurso de plano pago provisionado.

## Resultado do primeiro deploy
- Deploy dep-dbnl94qjnfac73cmu3eg terminou como update_failed.
- O build chegou ao npm start. O processo encerrou com status 1: produção exige DATABASE_URL.
- Serviço permanece sem implantação saudável. Não foram repetidos deploys sem corrigir a credencial ausente.
