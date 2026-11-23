#!/usr/bin/env bash
set -euo pipefail
: "${RESTIC_REPOSITORY:?}"
: "${RESTIC_PASSWORD_FILE:?}"
: "${RESTORE_TEST_DIR:?set isolated non-production destination}"
[[ "$RESTORE_TEST_DIR" == /tmp/kordant-restore-* ]] || { echo 'Use a dedicated /tmp/kordant-restore-* folder' >&2; exit 2; }
mkdir -p "$RESTORE_TEST_DIR"
restic restore latest --target "$RESTORE_TEST_DIR"
echo "Restore materialized at $RESTORE_TEST_DIR – manually verify data integrity and application startup."
