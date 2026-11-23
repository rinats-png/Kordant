# KORDANT v0.3.0 – Providerneutral und stärkere lokale Nachweise

## Implementiert (lokal testbar)

- `deploy plan` und `migrate plan` sind hostinganbieterneutral (VPS, Container, Managed PaaS, Kubernetes, Serverless, Bare Metal, lokale Umgebung).
- `plan import` übernimmt idea-to-app-Markdown und protokolliert sichtbare F-/AK-/TEST-/TASK-Ketten ohne Schreibzugriff auf die Quelle.
- `journal seal/verify` erstellt eine lokale SHA256-Kette; mit einem separat verwalteten HMAC-Key lässt sich eine externe Kopie nachprüfen.
- `skill pin/verify` verankert Quelle, Commit, Lizenz, Verantwortliche und Datei-Hashes.
- `git inspect`, `worktree plan/create/status` unterstützen lokales Arbeiten an getrennten Git-Checkouts, nicht Sandbox-Isolation.
- `eval run` importiert transparent bewertete Tests, Scores und Kosten; `capability check` ist eine Default-Deny-Vorprüfung.
- `recovery inspect/block` erkennt veraltete Taskansprüche und fordert eine manuelle Reaktion.
- `build attest/verify` verbindet lokalen Commit mit Hashes von Test-, Review- und Build-Dateien.
- `security sarif` importiert Scannerresultate, `github checks` liest Remote-CI bei expliziter Berechtigung.
- Budgetbuchung verweigert doppelte Provider-Request-IDs.

## Unverändert offen / erfordert externe Infrastruktur und Abnahme

Ein real erzwungener Sandbox-Worker, echte providerseitige Kostendeckelung, transaktionale verteilte Jobqueue, unabhängige signierte CI-Provenance, automatische Design- und Browserprüfung, Live-Infrastrukturinventar, produktiver Deploy-/Rollback-Controller, End-to-End-Payment-/Mobile-/Store-Pipelines, SSO/Mandanten-Cloud-Dashboard und externe Rechts-/Sicherheitsfreigaben.

**Wichtig:** Weder ein hoher Testzähler noch eine KI-Zweitprüfung ersetzt einen echten Restore-Test, Penetrationstest, Freigabeprozess oder erforderliche rechtliche Prüfung.
