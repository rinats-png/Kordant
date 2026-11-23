# Eigener Server: IONOS VPS, Docker, Caddy und Migration

## Grundsatz

Es gibt **keinen universell sicheren Ein-Befehl-Deploy** auf einen VPS, dessen Konfiguration nicht inventarisiert wurde. KORDANT arbeitet deshalb mit einem sicheren Zustandsgang: READ-ONLY → PLAN → STAGING → RESTORE DRILL → APPROVAL → CHANGE WINDOW → VERIFY → OPERATE. Die bereitgestellten YAML- und Shell-Dateien sind **Anpassungsvorlagen**, keine direkte Konfiguration für einen bestehenden Live-Server.

## 1. Bestandsinventar vor jeder Änderung

Dokumentiere und sichere zunächst (geheimnisfrei):

- Betriebssystem, SSH-Key-/Zugriffsverfahren, User-/sudo-Verteilung, Firewall, offene Ports, Security Updates.
- Docker Engine und Compose-Version, Container, Images/Digests, Netzwerke, Volumes, Restart-Policies.
- Caddy- oder Nginx-Konfiguration und sämtliche aktiven Domains, DNS-/DNSSEC-/TLS-Details.
- Datenbanktyp, Version, Speicherort, Nutzerrollen, Backup-Prozess, Migrationen, Multi-Tenant-Isolation.
- Externe Provider: Mail, SMS, KI, Payment, Object Storage, Push, Analytics; Verträge und Datenstandorte.
- Tatsächlich laufendes Bundle, Service Worker, Build-ID und Release-SHA vs GitHub `main`.
- Nutzer-/Transaktionsfenster, RTO/RPO, offene Incidents, Kapazität und Budget.

Die Vorlage `infra/preflight-readonly.sh` liefert einige **technische** Angaben, aber keine vollständige Inventur. Sie soll nur nach Prüfung auf einer autorisierten Maschine verwendet werden.

## 2. Referenz-Topologie

```
Internet → DNS → IONOS VPS (Ubuntu)
  └─ TCP 80/443: Caddy (TLS, Reverse Proxy, Header)
        └─ privates Docker-Netz
             ├─ Web-App (non-root, read-only, no-new-privileges, resource limits)
             ├─ Backend API (sofern getrennt)
             └─ Datenbank (kein öffentlicher DB-Port; getrennte Credentials/Volumes)

Extern: verschlüsseltes Offsite-Backup + Alerting + Image Registry + GitHub Actions
```

Für mehrere Apps: jedes Projekt eigener Stack und Datenbankrolle, Caddy-Routing ohne Portkonflikte, keine gemeinsame App-Secrets-Datei, klare Speicher-/CPU-Ressourcen und Backupregel. Ein einzelner VPS bleibt ein Single Point of Failure; die Verfügbarkeit ist entsprechend realistisch zu kommunizieren.

## 3. Konfiguration

- `infra/compose.staging.example.yml` ist Beispiel für ein Image **mit Digest**, nonroot-User, nur private interne Ports und getrenntes Caddy-Frontend.
- `infra/Caddyfile.example` ist eine Caddy-Vorlage mit HTTPS-Terminierung, security-relevanten Headern und Healthcheck.
- `infra/.env.example` benennt nur die notwendigen Variablen; niemals echte Schlüssel einchecken.
- Es gibt keine `docker.sock`-Mounts und keine heimliche Aufnahme von Datenbankcredentials in diese Dateien.

**Vor Verwendung:** Image-Digest validieren; Dockerfile/Base-Image digestpinnen, tatsächliche App-Port-/Healthcheck-Verfügbarkeit prüfen, DNS und Zertifikatserstellung sicherstellen. Feste HTTP Security Header müssen zur Anwendung (insb. CSP) passen. Compose `depends_on` ist kein Ersatz für Healthcheck oder Migrationstransaktion.

## 4. Deploymentablauf in einzelnen Gates

**G0 Inventar**: Betreiber hat Rechte und Produkt-/Dateninventar geprüft; Quell-/Ziel-SHA bekannt.

**G1 Code**: PR auf definierter Branch, CI erfolgreich, Security-Check, akzeptierte Änderungen, Rechte-/Datenschutzfolgen, nachvollziehbare Buildpipeline.

**G2 Artefakt**: unveränderliches Image-Digest, SBOM, bekannte CVEs bewertet, Artifact-Manifest signiert sofern verfügbar.

**G3 Staging**: gleichartige Konfiguration mit Fake-Daten, dynamische E2E-Tests, AuthZ-/Tenant-Tests, SMTP-/Provider-Sandboxes und Monitoring.

**G4 Backup/Migration**: konsistente Daten, offsite snapshot, Restore-Test, schema-kompatibler Migrations-/Rollforward-Plan, Wartungsfenster.

**G5 Go/No-Go**: verantwortlicher Betreiber prüft rote Gates, Datenschutz-/Vertragsthemen und entscheidet. Technische Verifikation ist keine automatische Rechtsfreigabe.

**G6 Cutover**: Operator führt definierte Befehle aus, Logs/Health prüfen, Migration verifizieren, Dienst erreichbar, Backups laufen, Alarmierung aktiv.

**G7 Nachbeobachtung**: synthetische Tests, Fehlerrate/Latency/Memory, echte Nutzerflüsse, Datenkonsistenz, Zahlungsereignisse und Zugangssitzungen; Incident-Rollback-Schwelle vorab festlegen.

## 5. Migration auf eigene Infrastruktur

**Quellvergleich:** Anzahl Datensätze, Indizes, Tabellen, Berechtigungsrollen, Dateien, Metadaten, Zeitstempel und Checksums. Für personenbezogene Daten Test-Snapshots pseudonymisieren oder synthetische Daten verwenden.

**Schema:** Datenbankmigrationen versioniert und nach Möglichkeit rückwärtskompatibel. Expand → Data Move → Contract; bei großen Änderungen Backfill/Batching/Locks und Migrationsdauer messen. Für irreversible Datenänderungen ist Roll-forward oft realistischer als Rollback.

**Cutover:** Dual-Write nur bei sehr guter Konsistenzstrategie; sonst Wartungsfenster/Schreibsperre. DNS-TTL und Cache berücksichtigen, noch eingehende Requests, Webhooks und Jobs sauber abfangen.

**Check:** Nach Migration stimmt der Datensatz- und Dateistand; Rollen, Sessions, E-Mail-Benachrichtigung, Zahlungen und Uploads funktionieren, ohne dass Nachrichten erneut/doppelt verarbeitet werden.

**Rückweg:** Alter DB-Stand, Zeitfenster, idempotente Wiederaufnahme und Punkt ab dem eine Rückmigration nicht sicher möglich ist, vorher dokumentieren.

## 6. Backup / Restore

Restic (https://restic.readthedocs.io/) mit separatem Repository und Offsite-Storage; getrennte Zugangsdaten; gesicherte DB-Konsistenz, Anhänge, App-Konfig, Signaturschlüssel/Secret-Restore-Prozess. Regelmäßiges `restic check` und praktische `restic restore`-Übungen auf isolierten Systemen. Ohne Restore-Test keinen grünen Backup-Nachweis ausgeben.

Die Skripte unter `infra/` verlangen explizite Umgebungsvariablen; sie sind **bewusst kein Cronjob** und werden nicht automatisch gestartet.

## 7. Monitoring und Störungsfall

Prüfe HTTPS-TLS-Ablauf, HTTP Response/Health, DB-Connections, Disk, RAM, Queue, Crash Loops, Antwortlatenz p95, Fehlerquote, Backupalter, fehlgeschlagene Jobs, Authz-Events, Zahlungswebhooks und nutzerrelevante synthetische Journeys. Alarme müssen eine erreichbare Person und ein Runbook haben.

## 8. Sicherheits- und Datenschutzkriterien

Kein Produktionscredential in Worktrees, Mail-/Payment-/KI-Dienste mit Testkonten in Staging, Löschfristen und AVV für Offsite-Backups beachten, keine internen Daten in Debug-Logs. Auf einem VPS dürfen Docker-Root, SSH-Root und App-Accounts nicht unkontrolliert vermischt werden.

## 9. KORDANT CLI-Planung

```bash
kordant migrate plan --source alter-server --destination ionos-vps
kordant deploy plan --domain staging.example.com --target staging
kordant gate release
```

Der letzte Befehl prüft ausschließlich **lokale Nachweisdateien**, nicht den tatsächlichen IONOS-Server. Live-Verifikation und echte Umsetzung bleiben getrennte Prozesse.
