# Status da execução no Work

## Verificado nesta execução
- Código-fonte recuperado do ZIP gsw-sdr-prime-v0.3-banco-ia.zip.
- Instruções lidas de docs/WORK-HANDOFF.md dentro do ZIP; o anexo avulso estava indisponível.
- npm install concluído; package-lock.json gerado.
- npm test: 24 testes aprovados, 0 falhas.
- Dockerfile para Node 22 com usuário sem privilégios e .dockerignore preparados. Imagem Docker ainda não construída.
- Workflow atualizado para npm ci e branches work/**, além de main e pull requests. Workflow não publicado/executado no GitHub.
- Render conectado; workspace listado: My Workspace. A ferramenta exige confirmação explícita do workspace antes de usar seus recursos.

## Não concluído
- GitHub: leitura funciona; criar branch retornou 403 Resource not accessible by integration. As duas tentativas de upload pelo navegador terminaram em timeout. Última leitura da main mostrou somente README.md; não houve confirmação de commit.
- Supabase: plugin não conectado nesta sessão; dashboard pediu login. Nenhum SQL remoto foi executado.
- Deploy HTTPS: nenhum serviço criado ou publicado no Render.
- PostgreSQL remoto, persistência após reinício e RLS/Data API remotos: não verificados.

## Configuração preparada para backend de testes
- Build Node: npm ci --omit=dev --ignore-scripts
- Start: npm start
- HOST=0.0.0.0; NODE_ENV=production; ENABLE_DEMO=false; AUTO_DRAFTS=false.
- DATABASE_URL e chaves ADMIN_API_KEY, META_APP_SECRET, META_VERIFY_TOKEN somente no ambiente privado do host.
- Antes do primeiro start: aplicar migração no projeto Supabase separado de desenvolvimento e verificar schema gsw_sdr, RLS e ausência desse schema na Data API.
- O Dockerfile é alternativa ao runtime Node. Nunca incluir .env ou contatos reais no GitHub.
- Manter acesso restrito para testes: o painel atual usa chave administrativa compartilhada, sem login por operador. Não usar para dados reais.

## Restrições preservadas
Nenhum WhatsApp comercial conectado, nenhuma mensagem enviada, nenhuma chamada de IA real executada. Nenhum banco do Prospecta ou repositório privado modificado. Nenhum serviço pago contratado.

## Atualização de infraestrutura
- Instalação GitHub 179624900 concluída com acesso apenas ao repositório público do projeto; criação da branch work/v0.3-infra-tests verificada.
- Supabase: projeto gsw-sdr-prime-dev criado em sa-east-1; migração aplicada. As cinco tabelas gsw_sdr têm RLS habilitada, sem USAGE para anon/authenticated. A lista remota de schemas expostos ainda precisa de verificação por API/Dashboard.
- Conexão Node/PostgreSQL, credenciais do runtime e deploy Render continuam pendentes nesta revisão.
