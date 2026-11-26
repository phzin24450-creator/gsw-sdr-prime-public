# Implantação do banco no Supabase — GSW SDR PRIME 0.3

## Situação

O SQL foi preparado e testado apenas de forma estrutural/simulada; **não foi aplicado a um projeto remoto** nesta entrega. A sessão atual não disponibilizou ferramentas operacionais do Supabase mesmo após o relato de conexão do usuário. Nenhuma tabela remota foi criada.

## Caminho com SQL Editor (desenvolvimento)

1. Entre no Supabase com autorização da GSW; abra um **projeto separado de testes**, não um banco do Prospecta ou de terceiros.
2. Abra **SQL Editor** e revise o arquivo `db/supabase-setup.sql` inteiro. Ele começa uma transação, cria schema `gsw_sdr`, revoga acesso público ao schema, fixa `search_path`, cria tabelas e registra a migração; termina com `COMMIT`.
3. Execute o script **uma única vez** no banco de desenvolvimento. O SQL é defensivo para criação das tabelas, mas não substitui revisão de alterações em schemas já existentes.
4. Confirme na interface de banco que as tabelas estão sob `gsw_sdr` com RLS ativada e sem políticas de acesso do navegador, e que o schema **não** está em `Integrations > Data API > Exposed schemas`.
5. Adicione `DATABASE_URL` **somente às variáveis secretas do backend** com uma conexão PostgreSQL compatível com o provedor. Nunca use a URL no frontend, repositório público ou chat.
6. Inicie o backend, consulte `/health` e verifique `storage: "postgres"`. Ative demo somente em ambiente isolado, registre um número fictício, reinicie o backend e confirme que a conversa persiste. Por fim, desative demo.

## Caminho por migração CLI

Em um ambiente Node com rede e `npm install` executado, defina `DATABASE_URL` e rode `node --env-file=.env src/db/migrate.js`. O migrador coloca as tabelas em `gsw_sdr` e registra cada arquivo SQL na **mesma transação** do DDL. Nunca execute `db/001_init.sql` isoladamente sem definir o schema; para SQL Editor use `db/supabase-setup.sql`.

## Segurança

- O browser deve acessar **o backend**, não uma conexão direta ao Postgres.
- Este MVP não implementa Auth de múltiplos operadores nem RLS para acesso do browser. O schema é intencionalmente interno/não exposto, com RLS ativada sem políticas do navegador; **não o exponha** para contornar essa limitação.
- Se futuramente houver Data API para operadores, crie uma camada apropriada com RLS por organização e autenticação/autorizações revisadas.
- Antes de dados reais: retenção, backups, exclusão, privacidade, logs sem PII e controles de acesso.

Documentação oficial: https://supabase.com/docs/guides/api/securing-your-api e https://supabase.com/docs/guides/api/using-custom-schemas
