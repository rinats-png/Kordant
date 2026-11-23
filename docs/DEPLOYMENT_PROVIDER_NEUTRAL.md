# Provider-neutrale Infrastruktur und Migration

KORDANT setzt **keinen Hosting-Anbieter voraus**. Ein Betreiber kann auf eigenem oder gemietetem VPS, Bare Metal, Container-Host, Managed PaaS, Kubernetes, Serverless oder lokal bereitstellen. Plattformen unterscheiden sich in DNS, TLS, Datenhaltung, Netzwerk, SSH-Zugriff, Backups, Kosten und Nachweispflichten.

## Planungsbefehle (ohne Serverkontakt)

```bash
node bin/kordant.mjs --project ../meine-app deploy plan --domain app.example.com --provider generic-vps --target staging
node bin/kordant.mjs --project ../meine-app deploy plan --domain app.example.com --platform managed-paas --capabilities dns-api,backups,tls-termination --region eu-central
node bin/kordant.mjs --project ../meine-app migrate plan --source legacy --destination kubernetes --data postgres-files
```

Die CLI schreibt strukturierte Pläne unter `.kordant/reports/`. **Kein Plan führt SSH-Befehle, API-Aufrufe oder Datenbankmigrationen aus.** Angabe eines Regionstexts ist kein Datenresidenznachweis.

## Adaptervertrag

Für einen künftig ausführbaren Adapter sind mindestens `discoverReadOnly`, `validateConfig`, `stage`, `verify`, `restoreDrill` und `release` getrennt zu implementieren. Er erhält genau benannte, minimal benötigte Capabilities. Secrets stammen aus einer externen Secret-Quelle, nicht aus `SKILL.md`, Git oder Chatprotokollen. Alle destruktiven Aktionen sind standardmäßig gesperrt. Adapterverhalten wird mit einem Mock-Provider und einer gesonderten realen Stagingumgebung getestet.

## Gate vor Produktivwechsel

Notwendig sind ausgefülltes Inventar, verifiziertes Build-Artefakt, Betreiberidentität, Tests auf Staging, Migrations-/Cutoverplan, Backup und unabhängig getesteter Restore, Datenintegritätsprüfung, Rollback- oder Rollforwardentscheidung sowie Monitoring und Incident-Verantwortliche. Ein UI-Button oder Markdown-Haken ist kein Beweis dafür.

## Beispiele

`infra/compose.staging.example.yml`, `infra/Caddyfile.example`, `infra/backup-restic.example.sh` sind optionale Technologien. IONOS-spezifische Dokumentation unter `docs/DEPLOYMENT_IONOS.md` ist nur ein Legacy-Beispiel und wird **nicht** automatisch aktiviert.
