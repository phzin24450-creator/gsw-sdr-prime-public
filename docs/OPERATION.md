# Operação assistida — GSW SDR PRIME

Ambiente: https://gsw-sdr-prime-dev.onrender.com/

## Acesso

O operador configurado é `pedro`. A senha é a definida pelo titular, armazenada somente como hash scrypt nas variáveis privadas do Render. Não registrar senha neste documento ou no repositório.

A sessão usa cookie HttpOnly, Secure e SameSite=Strict, expira em uma hora e é revogada ao sair. Um reinício/novo deploy encerra as sessões. Login com senha incorreta é limitado; as tentativas e sessões são locais ao processo. Este ambiente suporta um operador e uma instância. Não oferece gestão multiusuário, MFA nem trilha de auditoria por pessoa.

## Fluxo disponível

1. Entrar com usuário e senha.
2. Informar o telefone internacional do lead, apenas dígitos.
3. Colar a mensagem efetivamente recebida em “Registrar mensagem recebida”. A operação registra o histórico no banco; não representa recebimento pela API Meta.
4. Preencher contexto comercial verificado.
5. Se o lead não recusou contato nem pediu humano, selecionar “IA (rascunhos)” e salvar.
6. Gerar e revisar o rascunho. A interface mostra o provedor usado: `rules`/`rules_fallback` indica regras locais, não uma resposta da OpenAI.
7. Aprovar registra a decisão, sem enviar. O operador deve conferir o texto antes de qualquer uso manual no WhatsApp.
8. Sair ao terminar. Pedidos de humano e opt-out interrompem a geração; opt-out impede reativar o modo IA.

Não há rota de envio WhatsApp neste código. Não há promessa de disponibilidade contínua no plano gratuito do Render.

## Configuração privada

- `OPERATOR_USERNAME`, `OPERATOR_PASSWORD_SCRYPT`, `PUBLIC_ORIGIN`: acesso do operador.
- `ADMIN_API_KEY`: acesso técnico separado; nunca inserir no painel. Exclusão exige essa chave e confirmação `DELETE`.
- `DATABASE_URL`: role restrita do backend, pooler em sessão e TLS verificado.
- `NODE_EXTRA_CA_CERTS=db/supabase-ca.crt`.
- `OPENAI_API_KEY` e `OPENAI_MODEL`: necessários para validar IA real. A ausência de chave usa regras locais. Não copiar a chave para chat, GitHub ou navegador.
- `META_APP_SECRET` e `META_VERIFY_TOKEN`: os valores atuais são exclusivos de testes sintéticos, não credenciais de aplicativo Meta real.
- `META_CONFIGURED=false`, `ENABLE_DEMO=false`, `AUTO_DRAFTS=false`.

Para gerar um hash de senha, usar `passwordHash()` de `src/auth.js` em um terminal privado com entrada sem eco. Nunca colocar a senha literal em comando, arquivo versionado ou histórico do shell. Após atualizar o hash no Render, o deploy revoga as sessões anteriores.

## Validação de integrações pendentes

### OpenAI

Configurar uma chave de projeto válida com acesso ao modelo no ambiente privado do servidor. A conexão do plugin por si só não configura `OPENAI_API_KEY` no Render nem comprova saldo/limite de API. Usar somente conversa sintética no primeiro teste e verificar `provider=openai`; fallback por regras não aprova a integração real.

### WhatsApp oficial

É necessário identificar o aplicativo Meta, a conta WhatsApp Business e a existência de um número de teste. O WhatsApp funcionando no celular não comprova habilitação da Cloud API. Validar primeiro webhook e recebimento com credenciais reais em número de teste. Não migrar, excluir ou desconectar o número comercial para testar.

Recebimento e envio são etapas distintas. O backend atual recebe eventos assinados; envio pela Cloud API ainda precisa ser implementado e testado com destinatário autorizado, incluindo janela de atendimento, consentimento, templates quando aplicável, idempotência e estado de entrega. Não ativar atendimento automático com base em webhook sintético ou aprovação de rascunho.

## Diagnóstico

- `/health`: processo ativo e tipo de armazenamento; não consulta o banco.
- `/ready`: executa `SELECT 1`; HTTP 503 se o banco não responder, sem revelar detalhes.
- `/api/status`: exige login ou chave administrativa, informa a configuração presente sem valores secretos. “Configurado” não significa teste de integração aprovado.
- Registros de cliente ficam no PostgreSQL. Rascunhos são limitados e sempre sujeitos a revisão. Dados sintéticos usados em testes devem ser removidos pelo administrador ao final.
