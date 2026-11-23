#!/usr/bin/env bash
# Template: must be reviewed for data consistency and repository policy before enabling.
set -euo pipefail
: "${RESTIC_REPOSITORY:?set RESTIC_REPOSITORY in secret environment}"
: "${RESTIC_PASSWORD_FILE:?set RESTIC_PASSWORD_FILE in secret environment}"
: "${BACKUP_SOURCE:?set the consistent/snapshotted data directory}"
[[ -d "$BACKUP_SOURCE" ]] || { echo 'Backup source missing' >&2; exit 2; }
restic backup --one-file-system --tag kordant-example -- "$BACKUP_SOURCE"
restic snapshots --json > "${BACKUP_REPORT_DIR:?set private report directory}/restic-snapshots.json"
# This script does not claim backup integrity or RPO compliance until a restore drill passes.
