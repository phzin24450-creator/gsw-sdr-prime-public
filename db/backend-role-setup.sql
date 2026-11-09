-- Execute com a role administrativa somente no projeto de desenvolvimento.
-- A senha deve ser configurada separadamente no provedor; nunca neste arquivo.
BEGIN;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='gsw_sdr_backend') THEN
    CREATE ROLE gsw_sdr_backend NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT CONNECT ON DATABASE postgres TO gsw_sdr_backend;
GRANT USAGE ON SCHEMA gsw_sdr TO gsw_sdr_backend;
GRANT SELECT,INSERT,UPDATE,DELETE ON gsw_sdr.conversations,gsw_sdr.messages,gsw_sdr.drafts,gsw_sdr.audit_events TO gsw_sdr_backend;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA gsw_sdr TO gsw_sdr_backend;
ALTER ROLE gsw_sdr_backend SET search_path=gsw_sdr,pg_catalog;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['conversations','messages','drafts','audit_events'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='gsw_sdr' AND tablename=t AND policyname='backend_runtime') THEN
      EXECUTE format('CREATE POLICY backend_runtime ON gsw_sdr.%I FOR ALL TO gsw_sdr_backend USING(true) WITH CHECK(true)',t);
    END IF;
  END LOOP;
END $$;
COMMIT;
