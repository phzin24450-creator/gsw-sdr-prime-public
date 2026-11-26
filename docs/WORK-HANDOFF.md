# Tarefa pronta para ChatGPT Work

## Objetivo

Concluir infraestrutura de testes, sem clientes reais, para o GSW SDR PRIME Híbrido com o arquivo ZIP v0.3 fornecido pelo usuário.

## Instruções ao Work

> Utilize o ZIP `gsw-sdr-prime-v0.3-banco-ia.zip` como fonte do código. Repositório de destino: `https://github.com/phzin24450-creator/gsw-sdr-prime-public` (é público; NÃO publique segredos). A integração GitHub de chat consegue ler mas tentativas de escrever retornaram 403 `Resource not accessible by integration`, então use a navegação Work com a conta do usuário, após as autorizações necessárias, para publicar o código. Preserve o repositório privado anterior.
>
> 1. Revise o código, execute `npm install` e `npm test`, corrija eventuais falhas. Verifique versão 0.3.
> 2. Publique os arquivos em branch de desenvolvimento ou Pull Request. O `.env` e dados reais nunca podem entrar no repositório. Ative a Action de testes.
> 3. No Supabase conectado, localize ou crie **apenas com autorização específica** um projeto gratuito de desenvolvimento separado. Antes de executar SQL, confirme que não é um projeto de terceiros ou produção. Revise e aplique `db/supabase-setup.sql` dentro de transação; verifique tabelas em `gsw_sdr`, que NÃO deve ser exposto pelo Data API. Não altere o banco do Prospecta.
> 4. Configure a conexão do Postgres e segredos apenas no provedor de backend, nunca no GitHub. Teste migração, persistência após restart, webhook assinado, deduplicação e troca para modo humano. Faça deploy de backend de teste HTTPS se houver serviços gratuitos disponíveis, sem pagamentos automáticos nem exposição desnecessária.
> 5. Mantenha `ENABLE_DEMO=false`, `AUTO_DRAFTS=false` no backend público até concluir segurança e políticas. Não conecte número comercial Meta nem envie WhatsApp real sem etapa de autorização e verificação de coexistência, opt-in, templates e política de mensageria.
> 6. Gere relatório do que foi verificado, falhou, requer credenciais e depende de produção. Não invente resultados, permissões ou horas de disponibilidade.

## Pendências que nem o Work resolve sem ação/autorização do usuário

- Autorização/instalação GitHub com escrita ou sessão de navegador autenticada.
- Projeto Supabase e permissão de gerenciar SQL (a conexão declarada no chat não expôs ferramentas nesta sessão).
- Provedor de hospedagem, aprovações de plano e domínio (somente se necessário).
- Conta Meta for Developers, WhatsApp Business Account, número de teste e credenciais salvas no host.
- API de IA válida, política de privacidade, regras de consentimento e limites de custo.
- Integração oficial Prospecta caso o administrador ofereça documentação de API/webhooks.
