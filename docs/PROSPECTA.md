# Integração futura Prospecta

Foi observada a interface do Prospecta com importação de CSV/TSV/XLSX, pipeline, templates e follow-ups. Não foi localizada API ou documentação de webhooks na interface. A instância mostrava 'Sandbox · Teste descartável'. Não se pressupõe que o sistema GSW SDR PRIME tenha permissão para modificar o CRM diretamente.

Nesta versão **não há sincronização**. Para integração oficial será preciso validar, com o administrador do Prospecta, o método de importação e os nomes de colunas aceitos, deduplicação, autorização, estratégia de conflitos e confirmações de transmissão. Nunca marcar 'Abordado' apenas porque um rascunho foi aprovado: esse status exige confirmação real de envio.
