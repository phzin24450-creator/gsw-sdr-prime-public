#!/usr/bin/env bash
# Synthetic local-only Docker databases. Never reads DATABASE_URL/B2 credentials.
set -euo pipefail
umask 077
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/recovery" "$work/storage"
# Ephemeral synthetic identity: never emitted or committed; independent location from ciphertext.
age-keygen -o "$work/recovery/identity" 2>/dev/null
age-keygen -y "$work/recovery/identity" > "$work/recipient"
docker exec prime-backup-pg createdb -U postgres prime_source
docker exec prime-backup-pg createdb -U postgres prime_restored
# Fixture only, then full actual application migrations.
for sql in db/001_init.sql db/20261109015059_gemini_provider_metadata.sql db/20261109090000_elite_opening_drafts.sql db/20261109190000_conversation_archive.sql; do
 docker exec -i prime-backup-pg psql -X -U postgres -d prime_source -v ON_ERROR_STOP=1 -c 'CREATE SCHEMA IF NOT EXISTS gsw_sdr' >/dev/null
 # Migration files expect search_path; same session for file.
 { echo 'SET search_path TO gsw_sdr;'; cat "$sql"; } | docker exec -i prime-backup-pg psql -X -U postgres -d prime_source -v ON_ERROR_STOP=1 >/dev/null
done
# App fixture generated through its store, no remote connections.
PRIME_REHEARSAL_PORT=55487 node scripts/prime-backup-fixture.mjs
# Consistent pg_dump -> age pipe. No plaintext dump stored.
docker exec prime-backup-pg pg_dump -U postgres -Fc prime_source | age -R "$work/recipient" -o "$work/storage/synthetic.dump.age"
sha256sum "$work/storage/synthetic.dump.age" | cut -d' ' -f1 > "$work/checksum"
cp "$work/storage/synthetic.dump.age" "$work/recovered.dump.age"
test "$(sha256sum "$work/recovered.dump.age" | cut -d' ' -f1)" = "$(cat "$work/checksum")"
# Recover independently held identity to decrypt, restore atomically into a new empty database.
age -d -i "$work/recovery/identity" "$work/recovered.dump.age" | docker exec -i prime-backup-pg pg_restore -U postgres -d prime_restored --exit-on-error --single-transaction
PRIME_REHEARSAL_PORT=55487 PRIME_REHEARSAL_VERIFY=1 node scripts/prime-backup-fixture.mjs
# Authenticated encryption must reject damaged backup.
cp "$work/recovered.dump.age" "$work/corrupt.age"
python3 - "$work/corrupt.age" <<'PY'
import sys
p=sys.argv[1]
b=bytearray(open(p,'rb').read());b[-1]^=1;open(p,'wb').write(b)
PY
if age -d -i "$work/recovery/identity" "$work/corrupt.age" >/dev/null 2>/dev/null; then echo 'FAIL tamper'; exit 1; fi
printf '%s\n' '{"synthetic":true,"postgres":17,"encryptedBeforeStorage":true,"externalUpload":false,"independentEphemeralRecoveryIdentity":true,"restoreVerified":true,"tamperRejected":true}' > test-results/prime-backup.json
