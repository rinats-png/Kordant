# KORDANT MASTERBLUEPRINT – End-to-End-Agentic-Engineering-System

**Revision:** 2026-11-23 · **Ziel:** Alle wesentlichen Produktlebenszyklus-Domänen und deren überprüfbare Grenzen einheitlich steuern.

## 0. Leitprinzipien

KORDANT optimiert nicht Tokens pro Minute und nicht Anzahl paralleler Agenten, sondern **akzeptierte, getestete und tatsächlich ausgelieferte Funktionalität pro Euro und Arbeitstag**. Das System ist agenten- und vendorunabhängig, lokal-first und erfüllt das Prinzip *fail-closed* für kritische Operationen. Produktplanung, Coding und Betrieb bleiben unterschiedliche Rollen mit getrennten Berechtigungen.

Die Entwicklung eines Produkts ist kein linearer Riesenprompt. Sie ist ein gerichteter Graph kontrollierter Zustandsübergänge mit Evidenz, Einschränkungen und definierter Fehlerbehandlung. Der Product Owner entscheidet über Ziele, Datenrisiken, vertragliche Pflichten, Kosten, externe Dienstleister und Go-live. Normale Umsetzungsdetails dürfen Agenten autonom erledigen, sofern sie im genehmigten Scope liegen.

## 1. 28 Kontrollbereiche

| Domäne | Mindestliefergegenstand | Verifikation / Verantwortliche Rolle |
|---|---|---|
| Discovery | Problem, JTBD, Zielgruppentest, Gegenhypothese | Produkt / Quellenprüfung |
| Markt | Wettbewerber, Positionierung, Preissegment | Product/Finance, mit datierten Quellen |
| Geschäftsmodell | Deckungsbeitrag, Zahlungsbereitschaft, MRR/ARR, Churn | Finance, Szenarioprüfung |
| Product Requirements | PRD, F-ID, AK-ID, Rollen, Grenzen | Product + Reviewer |
| Bestandübernahme | B0/B1/B2, Risk Register, Charakterisierungstests | Analyst + Security |
| UX Research | Journey, Information Architecture, Fehlerpfade | Designer + echte Nutzer |
| UI Design | Hallmark-Designsystem, Tokens, Prototypen | Designer + Visual Review |
| UI-Kritik | Taste, Layout/Humanität, visuelle Regression | getrennte Designprüfung |
| Accessibility | WCAG 2.2, Tastatur, Screenreader, Kontrast, Zoom | QA, manuelle Prüfung ergänzen |
| Architektur | ADR, Threat Boundaries, APIs, Data Contracts | Architect/Security |
| Datenbank | Migrationen, RLS/ACL, Transaktionen, Retention | DBA, Integritäts- und Restore-Tests |
| Authentisierung | MFA, Recovery, Rate-Limits, Sitzungen | Security/QA, Missbrauchstests |
| Mandantenfähigkeit | Tenant-Isolation pro Datenzugriff | Security/QA, Cross-Tenant-Tests |
| Frontend | Responsives UI, Lade-/Fehlerzustände, Performance | Frontend/QA |
| Backend | Idempotenz, Schemas, Fehler, Verfügbarkeit | Backend/QA |
| KI-Funktionen | Privacy, Prompt Injection, Evals, Model Routing | AI/Security/Finance |
| Integrationen | Anbieter-DPAs, Secrets, Timeouts, Retries, Webhooks | Architect/Security |
| Teststrategie | Unit, Contract, Integration, E2E, Security, Load | QA + unabhängige Prüfer |
| Supply Chain | Dependencies, SBOM, Scans, Signaturen | Security/Platform |
| CI/CD | Pipelines, Artifacts, Branch-Permissions, Release-ID | Platform + Reviewer |
| Infrastruktur | Netzwerk, TLS, VPS, Secrets, Ressourcenlimits | Platform/SRE |
| Migration | Checkpoint, Snapshot, Consistency, Roll-forward | DBA/Platform/QA |
| Observability | SLO, Logging, Tracing, Privacy, Alerting | SRE |
| Resilience | Backup, Restore, DR, RTO, RPO | SRE, unabhängiger Restore-Test |
| Datenschutz/Recht | GDPR, Verträge, Lizenzen, DSFA-Prüfung, BFSG | Compliance + fachliche Beratung |
| App-Stores | iOS/Android, Signing, Stores, Payments, Updates | Mobile/Compliance |
| Billing | Tarife, Zustimmung, Events, Webhook, Audit | Finance/Backend/Legal |
| Support/Wachstum | Onboarding, Tickets, Nutzerfeedback, Produktanalytik | Growth/SRE/Privacy |

Die Tabelle ist ein **Steuerungskatalog**, keine Behauptung, dass jedes Feld bereits als automatisierter Gate durchgesetzt ist. Implementierte vs. geplante Bausteine sind im `STATUS_AND_ROADMAP.md` gekennzeichnet.

## 2. Fünf Ebenen der Architektur

### Ebene A – Planung

idea-to-app führt neue und bestehende Apps in 25 Phasen zu einem versionierten Handoff. Für eine Neuplanung gibt es Produkt-, Erlebnis-, Technik-, Betrieb-/Rechts- und Umsetzungsblöcke. Im adaptiven Modus werden unkritische Detailannahmen markiert; Entscheidungen über Daten, Rollen, Außenwirkung, Kosten, Live-Deployment, Schlüsselinfrastruktur bleiben beim Betreiber.

### Ebene B – Orchestrierung

Workflowdefinitionen enthalten `id`, `agent`, `skill`, `scope`, `dependsOn`, `requiredEvidence`. Der Orchestrator erstellt task-spezifische Aufträge, liest Abhängigkeiten, verhindert konkurrierende Schreibbereiche und setzt Stopps bei unbekannten Voraussetzungen. Diese Referenzimplementierung persistiert Tasks in JSON und Ereignisse als JSONL; ein späterer Multi-User-/Cloud-Ausbau braucht transaktionale DB, verteilte Locks und Idempotency Keys.

### Ebene C – Ausführung

Jeder Agent besitzt eine nur notwendige Rolle, ein Budget, einen Timeout und einen eindeutigen Schreibbereich. Isolation muss vom ausführenden Tool oder Sandbox-Layer durchgesetzt werden; **nur im Prompt stehende Scope-Regeln sind keine technische Sandbox**. Externe KI-Läufe sind aus Sicherheits- und Kostengründen per Default gesperrt.

### Ebene D – Prüfung und Evidenz

Jede Änderung muss auf eine Anforderung zurückgeführt werden können. Tests, Builds, Reviews, Sicherheits- und Datenschutzbefunde und Release-Manifeste sind getrennte Artefakte. Hashes verhindern eine spätere unbemerkte lokale Änderung; sie beweisen nicht die fachliche Richtigkeit oder externe Herkunft. Nach vollständiger Implementierung sollten Nachweise an Commit-SHA, CI-Job-ID, Artefakt-Digest, ausführende Identität, Timestamp und signierte Attestations gebunden werden.

### Ebene E – Betrieb

Ein Release wird nach Staging-Prüfung, Sicherheitsgates, Datenmigration, Backup, Restore-Drill und manueller Freigabe bereitgestellt. Referenz ist eine konfigurierbare, anbieterneutrale Plattform (VPS, Container-Host, PaaS, Kubernetes, Bare Metal, Serverless oder lokal). Docker Compose/Caddy sind nur Beispiele. Provider-Adapter müssen per Capability-Profil gewählt und separat geprüft werden. Default ist weiterhin **keine direkte Verbindung zu Produktionsservern**.

## 3. Zulässige Zustandswechsel

`pending -> in_progress -> done` nur mit registrierten Nachweisen. `pending/in_progress -> blocked -> pending` nur mit Grund und Dokumentation. `cancelled` bleibt irreversibel ohne neue Task-ID. Abhängigkeiten müssen vor Claim abgeschlossen sein. Auf Schreibbereiche überschneidender Aufgaben dürfen keine zwei Agenten gleichzeitig zugreifen. Ein Review erzeugt einen separaten Gate-Eintrag; der Task-Ersteller sollte nicht über seine eigene Arbeit entscheiden.

### Zukunft: Robustheit gegen parallele Änderungen

Ein orchestriertes Echtzeit-System benötigt atomare Transaktionen, Lease-TTL mit sicheren Recovery-Regeln, Dead-letter-Queue, Retry-Backoff mit Limits, Outbox-Muster für externe Events, Wiederaufnahmepunkte, Worktree-Metadaten und bounded concurrency. Diese Punkte sind in V0.1 **noch nicht** produktionsreif implementiert.

## 4. Sicherheitsrichtlinien als Kontrollmatrix

**Produktangriffsflächen:** Identity, Sessions, Objekt- und Tenantzugriffe, API-Versionierung, Uploads, Parsing, SSRF, XSS, CSRF, SQL-Injection, Webhook-Verifikation, Adminaktionen, Billing, Logs, personenbezogene Daten, Verschlüsselung, Backups und Third-Party Supply Chain. Referenz: OWASP ASVS 5.0.0 (Anforderungen über Versions-ID verknüpfen).

**Agentenangriffsflächen:** Prompt Injection aus Repos und Web, bösartige Skills, vergiftete Abhängigkeiten, Tool-Exfiltration, Dateisystem-/Netzwerkzugriff, Secrets im Kontext, Rollenübernahme, falsche Testergebnisse, kompromittierte CI, Kostenexplosion. Abhilfe: untrusted input isolation, Tool-Allowlisting, eingeschränkte Workspaces, Egress-Policies, Secrets-Hygiene, getrennte Reviewer, Artifact Signing und Red-Team-Evaluation.

**Freigabeklassen:** Routine-UI niedrig; Rechtemodell mittel/hoch; Nutzer- und Zahlungsdaten hoch; produktive Datenbankmigration oder Schlüsselrotation kritisch. Kritische Aktionen erfordern explizite dokumentierte menschliche Freigabe, Reproduktionsnachweise und ggf. externe Fachprüfung. Formal akzeptierte Risiken befreien nicht von Gesetzespflichten.

## 5. Evidenzmodell / Definition of Done

Minimum: Requirement-ID → Task-ID → Code-Diff/Commit → automatisierte Test-ID → Review → CI-Ergebnis → Artefakt-Digest → Staging-Run → Release-ID. Zu jedem Schritt: Ausführungszeit, Kontext, Ergebnis, nicht prüfbare Aspekte und klare Verantwortlichkeit. `UNKNOWN` darf nie in `PASSED` umbenannt werden. Der aktuell implementierte Evidence-Store ist ein Anfang; CI-verifizierte Signaturen und Fremdfreigaben sind eine nächste Stufe.

## 6. Designspezifikation

Hallmark ist die **einzige führende Stilsprache** pro Produkt. Taste ist ein getrenntes Review-/Verbesserungswerkzeug. Vor der Umsetzung: Marke/Referenzen → Screens/Flows → Tokens → Komponentenkatalog → responsive Seiten → visuelle Tests → WCAG-Prüfung. Keine globale Gestaltungsmutation in einem Feature-Task. Screenshots benötigen definierte Browser, Fonts, Viewports und Testdaten. Designfreigaben sind eigenständige Artefakte.

## 7. Kostenoptimierung ohne Qualitätsverlust

- **Vor der Arbeit:** Nutzen, Scope und Risiko bestimmen, nur benötigte Skills laden, Prompt vor Filterung des Kontexts begrenzen.
- **Während der Arbeit:** Single Writer pro Modul, höchstens zwei bis drei wirklich unabhängige Autoren, begrenzte Retry-Zyklen, frühe Unit-/Contract-Checks.
- **Nach der Arbeit:** Rework-Rate, akzeptierte Features, Energie-/Token-/Providerkosten, Review-Durchläufe und Testdefekte messen.
- Modellwahl wird über projektbezogene Evals bestätigt: Routineaufgaben günstig, Architektur/High-Risk mit höherem Reasoning, finale Reviews unabhängig. Keine festen Leistungsbehauptungen für Modellmarken.
- Externe API-Kosten sind **kein technisch sicheres Budget**, solange die tatsächlich autorisierten Providerlimits nicht mit KORDANT verknüpft sind. Warnung und dokumentierte Kostenbuchung sind keine Garantie.

## 8. Eigenserver-Referenzarchitektur

Browser → DNS → TLS/Caddy → private Container-Netzwerke → Anwendung → getrennte Datenbank / persistente Volumes. Keine öffentlich erreichbare Datenbank, kein Docker Socket im App-Container, keine Secrets in Git oder Browser. DNS, Firewall, Fail2ban oder vergleichbare Mechanismen, automatische OS-Sicherheitsupdates, SSH-Key und least privilege separat prüfen. Managed Secrets/DB sind je nach Datenschutz und Aufwand sinnvoller als Eigenbau.

Bestehende VPS-/Cloud-Installation: zuerst Docker-/Caddy-Konfiguration, verfügbare Ports, Domains, Volumes, Datenbanken, laufende Live-Version, Backups, Nutzeraktivität und E-Mail-Anbieter erfassen. Nie stillschweigend die bestehende Caddy-Konfiguration überschreiben. Alle Datenbewegungen auf Testkopien proben. Vor Migration konsistente Snapshots und Restore-Test.

## 9. Mobile, Desktop, PWA, API

Die Plattformentscheidung ist produktabhängig. Für Web/PWA: Offline, Updates, Service Worker, Push, Cachekonsistenz und Barrierefreiheit testen. Für iOS/Android: App Store/Play, Signierung, TestFlight/Internal Testing, Datenschutzangaben, Payments, Gerätefunktionen, Push und Zertifikatsrotation. Desktop: Auto-Updates, Betriebssystemberechtigungen, Codesignatur, Offline-Datenbank, Installer/Rollback. Für reine APIs: Auth, Quotas, Versionierung, OpenAPI, SDKs und Rate-Limits.

## 10. Recht, Datenschutz und Nachweise

Datenschutz muss auf echte Datenflüsse bezogen sein, nicht nur auf eine Datenschutzerklärung. Erforderlich: Controller/Processor, AVV, Zweck, Datenminimierung, Rechtsgrundlage, Aufbewahrung/Löschung, Rechteauskunft, Vertrags-/Drittlandtransfer, TOM, ggf. DSFA und Behörden-/Branchenanforderungen. EU AI Act Pflichten und Zeitpunkt ihrer Anwendbarkeit sind versions- und anwendungsspezifisch zu prüfen. KORDANT gibt keine Rechtsfreigabe.

## 11. SaaS und Abrechnung

Alle Tarifpreise als Integer-Cent, versionierte Tarifdefinitionen, wirksame Zeitpunkte, revisionsfähige Ereignisse, Zustimmungssnapshots, Pilot-Regeln, Upgrade/Downgrade ohne stillschweigende Rückwirkung, robuste Webhook-Idempotenz, Gebühren/Steuern, Audit und Stornobuchungen. Testfälle für konkurrierende Requests, ungültige Werte, Sommerzeit, Zero/Null, temporäre Providerstörungen und Fehlzustellungen sind Pflicht.

## 12. Reliability, SLO und Notfallbetrieb

Produktivbetrieb: SLOs passend zur Anwendung, synthetische Checks, Telemetrie ohne PII, Alarme mit Owner/Severity, Backupfrequenz nach RPO, Wiederherstellungsübungen nach RTO, Keyrotation, Incident-Runbooks, User-Kommunikation und Postmortems. Eine hohe Uptime-Anzeige beweist keine Datenkonsistenz, kein Restore und keinen wirksamen Datenschutz.

## 13. Governance und Ownership

KORDANT ist eine Werkzeugschicht. Jedes Projekt besitzt: verantwortlichen Betreiber, Quelle der Wahrheit, Entscheidungshistorie, technischen Owner, Datenschutzverantwortung, On-Call-Zuständigkeit und Budget. Kritische Entscheidungen gehen an den Owner; Routineprüfungen können automatisiert werden. Bei hoher Sensitivität zusätzliche Freigaben und externe Nachweise.

## 14. Technische Teststrategie nach Stufe

**Stufe 1:** Linter, Unit, Build, minimale Dependency-Prüfung, UI-Basics. **Stufe 2:** Zusätzlich Security-/AuthZ-Integrationstests, E2E, Backup-Test, CSP/Headers, Kosten- und Missbrauchsgrenzen. **Stufe 3:** Zusätzlich Threat Model, Cross-Tenant/Privacy Negativfälle, dynamische Tests, Externprüfung, Load-/Restore-Drills, Betriebs-/Fachfreigabe. Stufe 3 ist nicht allein durch einen KI-Reviewer freigabefähig.

## 15. Erfolgsmessung

`Accepted Work Units / tatsächliche Menschstunden`, `KI-Kosten / akzeptiertes Work Unit`, `Review-Runden / Change`, `Rework-%`, `Escaped Defects`, `Incident Rate`, `Time-to-Restore`, `False-Positive-Rate der Agenten`, `Lead Time`, `Deployment Failure Rate`, `Privacy Incidents`, `User Activation`, `Net Revenue Retention`. Werte projektbezogen als Zeitreihen erfassen, nicht branchenübergreifend unkritisch vergleichen.

## 16. Standard-Projektlauf (neues Produkt)

1. Idee in 1 Satz, Zielgruppe, wirtschaftlicher Zweck und Budget.
2. idea-to-app: Produktvalidierung, PRD, Designentwurf, Daten-/Security-/Rechtscheck, Handoff.
3. `kordant init` + `workflow start new-product` mit klarer Aufgabe und Scope.
4. Architecture + Design freigeben; Test-/CI-Umgebung und Datenmodell sichern.
5. Vertikalen Schnitt entwickeln; unabhängiger Review; wiederholen bis MVP.
6. Staging, Sicherheits- und Datenschutzprüfungen; Migrationstests und Restore.
7. Releasemanifest mit Digest; Betreiber entscheidet über Live-Launch.
8. Monitoring, Betrieb und Nutzerfeedback in wiederkehrende Workflows übernehmen.

## 17. Standard-Projektlauf (bestehende App)

1. `kordant audit <pfad>` (liest nur), idea-to-app B0/B1/B2 (weitere Dateien/Server nur mit Erlaubnis).
2. Inventar der tatsächlich laufenden Version, Datenbestände und Abhängigkeiten.
3. Nicht geänderte Funktionen per Charakterisierungstests sichern.
4. Risiken und Backlog nach Schaden × Wahrscheinlichkeit × Aufwand sortieren.
5. Kritische Fehler zuerst; anschließend neue Features klein und testbar.
6. Freigabegates vor Staging und Produktion; keine technische Neubewertung ohne Anlass.

## 18. Was bewusst nicht automatisch geschieht

Produktive Deployments, DNS-Umschaltung, Datenlöschung, Datenbankmigration auf Live, Schlüsselrotation, Store-Publishing, Abrechnungskorrekturen, AVV-Abschlüsse oder rechtliche Freigaben. Diese Aktionen sind als reviewte Playbooks geplant, nicht als unkontrollierter Agentenbefehl.

## 19. Definition "fertig"

Ein Produkt ist erst dann **betriebsfähig**, wenn der konkrete Zielbetrieb mit echten Zugangs-/Daten-/Infrastrukturbedingungen sicher geprüft wurde. Ein generiertes Projektgerüst, ein grüner Testreport und ein Dashboard sind **noch keine produktive Bereitstellung**. Die Fähigkeiten und Grenzen dieses Repositories sind strikt von den späteren Zielen zu unterscheiden.

## 20. Referenzen und Quellen (regelmäßig prüfen)

- Upstream Planungsfundament: https://github.com/rinats-png/idea-to-app (v1.2.0 pinned)
- Agent Skills: https://agentskills.io/specification
- Hallmark: https://github.com/Nutlope/hallmark
- Taste Skill: https://github.com/tasteskill/tasteskill
- Superpowers: https://github.com/obra/superpowers
- GitHub Spec Kit: https://github.com/github/spec-kit
- OWASP ASVS 5.0: https://asvs.owasp.org/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- EU AI Act: https://ai-act-service-desk.ec.europa.eu/en/ai-act/eu-ai-act-implementation-timeline
- Caddy Reverse Proxy: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy
- Restic: https://restic.readthedocs.io/

Alle externeren Standards müssen vor fachlichem Einsatz auf gültige Versionsstände geprüft werden.
