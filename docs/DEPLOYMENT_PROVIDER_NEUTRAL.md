# Provider-neutrale Infrastruktur und Migration

KORDANT setzt **keinen Hosting-Anbieter voraus**. Ein Betreiber kann auf eigenem oder gemietetem VPS, Bare Metal, Container-Host, Managed PaaS, Kubernetes, Serverless oder lokal bereitstellen. Plattformen unterscheiden sich in DNS, TLS, Datenhaltung, Netzwerk, SSH-Zugriff, Backups, Kosten und Nachweispflichten.

## Planungsbefehle (ohne Serverkontakt)

```bash
node bin/kordant.mjs --project ../meine-app deploy plan --domain app.example.com --platform generic-vps --vendor eigener-server --target staging
node bin/kordant.mjs --project ../meine-app deploy plan --domain app.example.com --platform managed-paas --vendor provider-beispiel --capabilities dns-api,backups,tls-termination --region eu-central
node bin/kordant.mjs --project ../meine-app migrate plan --source legacy --destination kubernetes --vendor cluster-operator --data postgres-files
```

Die CLI schreibt strukturierte Pläne unter `.kordant/reports/`. **Kein Plan führt SSH-Befehle, API-Aufrufe oder Datenbankmigrationen aus.** Angabe eines Regionstexts ist kein Datenresidenznachweis.

## Adaptervertrag

Für einen künftig ausführbaren Adapter sind mindestens `discoverReadOnly`, `validateConfig`, `stage`, `verify`, `restoreDrill` und `release` getrennt zu implementieren. Er erhält genau benannte, minimal benötigte Capabilities. Secrets stammen aus einer externen Secret-Quelle, nicht aus `SKILL.md`, Git oder Chatprotokollen. Alle destruktiven Aktionen sind standardmäßig gesperrt. Adapterverhalten wird mit einem Mock-Provider und einer gesonderten realen Stagingumgebung getestet.

## Gate vor Produktivwechsel

Notwendig sind ausgefülltes Inventar, verifiziertes Build-Artefakt, Betreiberidentität, Tests auf Staging, Migrations-/Cutoverplan, Backup und unabhängig getesteter Restore, Datenintegritätsprüfung, Rollback- oder Rollforwardentscheidung sowie Monitoring und Incident-Verantwortliche. Ein UI-Button oder Markdown-Haken ist kein Beweis dafür.

## Beispiele

`infra/compose.staging.example.yml`, `infra/Caddyfile.example`, `infra/backup-restic.example.sh` sind optionale Technologien. IONOS-spezifische Dokumentation unter `docs/DEPLOYMENT_IONOS.md` ist nur ein Legacy-Beispiel und wird **nicht** automatisch aktiviert.

Die Option `--vendor` ist ein neutraler **Bezeichner**, keine Behauptung einer vorhandenen, freigeschalteten Cloud-API. `--provider` ist aus Kompatibilitätsgründen ein Alias für den **Plattformtyp**, nicht die Anbieterkennung.

## Eigene Providerprofile ohne Programmierung

```bash
node bin/kordant.mjs platform list
node bin/kordant.mjs platform inspect --file ./mein-provider.json
```

Das Profil ist **reines JSON**, niemals ein ausführbarer Plugin-Code. Folgende Beispielkonfiguration kann für beliebige Anbieter angepasst werden:

```json
{
  "schemaVersion": 1,
  "platform": "container-host",
  "vendor": "mein-provider",
  "capabilities": ["containers", "tls-termination", "backups"],
  "status": "DRAFT",
  "credentialHandling": "external-secret-manager-only",
  "approval": "manual-verified",
  "operations": ["discoverReadOnly", "plan", "verify"],
  "notes": "Keine Secrets; tatsächlicher Zugang wird separat geprüft."
}
```

Der Validator lehnt unbekannte Felder (insbesondere inline Zugangsdaten), Symlinks und übergroße Profile ab. Das Label `REVIEWED` macht keinen Provider ausführbar. Für echte Deployments braucht es eine eigenständige geprüfte Adapterimplementierung mit Testsystem und Freigabemechanismus.
