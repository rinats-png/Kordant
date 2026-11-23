> **2026-11-23 · v0.2.0-Update:** Anbieterneutrale Plattformprofile und Migrationspläne implementiert; zusätzlicher idea-to-app-Markdown-Importer/Traceability-Report, Skill-Pinning, Journal-HMAC-Check, Evals, read-only Git-Inspektion, Fähigkeitsprüfung und operator-gesteuerte Recovery. Die darunter aufgeführten restlichen Plattform- und Produktionspunkte sind weiterhin offen; ein lokaler Test ist keine reale Produktionsabnahme.

# KORDANT – Implementierungsstand und vollständige Roadmap

## Warum eine ehrliche Abgrenzung wichtig ist

Ein universelles Agentic-Engineering-System kann nicht durch eine Sammlung von Prompts vollständig in Betrieb genommen werden. Es braucht ausführbare, regelmäßig getestete Kernmodule, Sandbox-Grenzen, Provider-Verträge, echte Freigabemechanismen und einen realen Infrastrukturtest. Dieses Repository ist eine **ausführbare, getestete Referenzversion** mit breitem Konzept- und Skillumfang, aber **keine schon autonom betreibbare All-in-one-Produktionsplattform**.

### Implementiert und lokal testbar (Version 0.1.0)

- ✅ Node-22-CLI ohne Drittanbieter-Abhängigkeiten im Kern.
- ✅ Projektinitialisierung/adopt und statischer Read-only-Audit ohne Ausführung von Fremdcode.
- ✅ Offline-Planungsgerüst mit 25 Phasen und Draft-Handoff.
- ✅ Workflow-DAG, Abhängigkeiten, Cycle-Validation, Persistenz in JSON/JSONL.
- ✅ Aufgaben-Claim, Zustandswechsel, Arbeitsbereich-Kollisionsprüfung und lokaler exklusiver Write-Lock.
- ✅ Evidence-Store mit Datei-SHA256 und Integritätsprüfung vor Taskabschluss.
- ✅ Gate-Checklisten, einschließlich absichtlicher Sperre von `production`.
- ✅ Budgeterfassung, Reservierung, Warnung bei Überschreitung und grobe riskbasierte Modellauswahl ohne erfundene Preise.
- ✅ Prompt-Komposition aus 75 SKILL.md und 18 Rollen, 28 Workflowpakete.
- ✅ Externe CLI-Adapter als explizit opt-in und mit ungemessenen Kosten klar gekennzeichnet; der Standard bleibt Prompt-Export.
- ✅ Optionaler idea-to-app-Install aus lokalem Clone oder bewusstem Git-Download, mit festgelegtem Upstream SHA.
- ✅ Docker/Caddy/Backup/Restore/VPS-Beispielkonfigurationen, ohne automatische Live-Ausführung.
- ✅ IONOS-Deployment- und Migrationsplanung als nicht ausführende JSON-Runbooks.
- ✅ Lokales ausschließlich lesendes Dashboard auf 127.0.0.1.
- ✅ Laufender Node-Web-Demostarter mit `/health`, responsiver UI und eigenen Tests.
- ✅ 29 lokale automatisierte Tests, sichere End-to-End-Demo und Self-Check; GitHub-CI-Konfiguration ist noch keine bestätigte Remote-CI-Ausführung.

### Nicht implementiert / nicht nachgewiesen

- ❌ Vollständig integrierter Claude/Codex-Agenten-Scheduler mit nachweislich erzwungenen OS-/Netzwerk-/Kostenlimits.
- ❌ Verteilte Datenbank, robuste parallele Locks, Multi-Tenant-RBAC, SSO und authentifiziertes Cloud-Dashboard.
- ❌ Automatisches Parsing aller idea-to-app-Phasen und bidirektionale Synchronisierung mit Code/PR/CI.
- ❌ Echte Online-VPS-Inventory-Tools, Live-Caddy-Validierung, echtes Deployment oder automatische Migration.
- ❌ Proof of Build, signierte SLSA Provenance, SBOM-/CVEs im aktuellen Release-Gate aus einer echten Pipeline.
- ❌ Garantie rechtlicher Konformität, unabhängiger Pentest, externe Freigaben, Datenschutzfolgenabschätzung.
- ❌ Provider-übergreifendes metered billing und echte harte Provider-Spend-Caps.
- ❌ Produktive Mobile-/Desktop-Build- und App-Store-Pipelines, SaaS-Payment-Integration, globale Echtzeit-Metrikplattform.
- ❌ Vollautomatisierte Hallmark-/Taste-Skill-Ausführung und Visual-Eval.

## Roadmap nach Abhängigkeit und Risiko

### P0 – Vor echtem autonomem Agentenlauf

| Ticket | Aufgabe | Akzeptanzkriterium |
|---|---|---|
| K-001 | Transaktionaler Zustand und Queue | 100 gleichzeitige Task-Transitions ohne Lost Update; Recovery nach Crash |
| K-002 | Sandboxed Worker | File/Network/Process-Policy technisch nachweisbar durch Negativtests |
| K-003 | Tool-Capability-Broker | Default-Deny für Shell, Netzwerk, Secrets und Production Actions |
| K-004 | Provider-Abrechnung/Reservierung | Echte Usage pro Run + nachprüfbare Limits oder verpflichtender Human-Mode |
| K-005 | E2E-Agentenlauf | Task → Worktree → Tests → Review → PR → Evidence reproduzierbar |
| K-006 | Identitätsbasierte Freigabe | Signoff vom berechtigten Operator, kein Self-Approval |
| K-007 | Audit-Log-Attestation | Signierte, append-only Evidence-Kette und Prüfwerkzeug |
| K-008 | Versions- und Dependency-Pins | überprüfte Lockfiles, GitHub Action v5+ Pins, Repro-Build |

### P1 – Vollständige Planungs- und Git-Integration

| Ticket | Aufgabe | Akzeptanzkriterium |
|---|---|---|
| K-011 | idea-to-app Adapter | Alle 25 Phasen und B0–B2 können importiert/exportiert werden |
| K-012 | Traceability Graph | F/AK/TEST/TASK ↔ PR/Commit/CI/Release automatisch validiert |
| K-013 | GitHub/Forge Adapter | Repos lesen, Branches/PRs erstellen, Status prüfen, keine unkontrollierten Merges |
| K-014 | Semantische Repo-Map | deterministische Relevanzsuche; Tokenverbrauch gegen Baseline gemessen |
| K-015 | Skill Policy Scanner | Script/Hook/Netzwerk/Symlink-Suche + Lizenz/SHA + Test-Evals |
| K-016 | Modell-/Skill-A/B Evaluation | bekannte Aufgaben, blindes Scoring, Kosten, Rework und Halluzinationsrate |
| K-017 | PR Review-Komposition | Unterschiedliche Agenten, standardisierte Findings und Disposition |
| K-018 | Ticket-/Meilenstein-Synchronisierung | Retries, Dead Letter, Abhängigkeitsänderungen, Owner |

### P2 – Product Quality und Design

| Ticket | Aufgabe | Akzeptanzkriterium |
|---|---|---|
| K-021 | Hallmark Adapter | geprüfter Skill-Pin, Tokens, Baselines, auditierbare Installation |
| K-022 | Taste Adapter | abgegrenzter Reviewmodus ohne Designsystem-Konflikt |
| K-023 | Playwright Runner | isolierte Browser, Video/Trace/Screenshot pro Review |
| K-024 | Accessibility Matrix | WCAG-2.2-Prüffälle, manuelle Checks und Nachweisketten |
| K-025 | Security Scanner Aggregation | Trivy/Gitleaks/Semgrep/SBOM mit CVE-Risikotriage |
| K-026 | Build Attestation | Commit, SHA, Buildjob, Signatur und immutables Image verknüpft |
| K-027 | Teststrategie pro Risikostufe | testbare negative und positive Gate-Suites |
| K-028 | Cost/Quality Dashboard | akzeptierte Taskkosten, Durchsatz und Rework real gemessen |

### P3 – Eigene Infrastruktur und Betrieb

| Ticket | Aufgabe | Akzeptanzkriterium |
|---|---|---|
| K-031 | VPS Inventory Adapter | Host/Container/Domains/Volumes read-only mit begrenztem SSH-Account |
| K-032 | Infrastruktur-Drift | Ist-Zustand vs deklaratives Manifest mit read-only Diff |
| K-033 | Secret Management | Vault/SOPS oder vergleichbar mit getrennter Betreiberidentität |
| K-034 | Staging Provisioner | wiederholbares, getrenntes Staging ohne Live-Risiko |
| K-035 | Migration Engine | simulierbarer Dry-run, Datenintegrität, Checkpoint/Resume, Rollforward |
| K-036 | Backup/Restore Gate | Offsite-Backup, unabhängiger Restore, RPO/RTO-Protokoll |
| K-037 | Deploy Controller | Operator signiert Release, Digest validiert, Healthchecks & Rollforward |
| K-038 | Observability Connector | unabhängige SLO-Daten und Alarme, Privacy Filter |
| K-039 | Incident Handler | On-call-Workflow, Timeline, Safe Rollback, Postmortem |
| K-040 | Key Rotation/Asset Lifecycle | sichere Prozesse für Zertifikate, Providerkeys, EOL |

### P4 – Plattformen und Business

| Ticket | Aufgabe | Akzeptanzkriterium |
|---|---|---|
| K-041 | Mobile iOS/Android | Signierung, Store-Test, Buildmatrix, Release und Notfallrollbacks |
| K-042 | Desktop/Native | Signierung/Updater/Installer/Security-Tests |
| K-043 | SaaS-Billing Adapter | Revisionsfähige Events, Testwebhooks, Preis-Snapshots, Steuern |
| K-044 | Provider Marketplace | Capabilities, Lizenz, Pricing, DPA, Risk und installierte Version |
| K-045 | KI-Gateway/RAG | evaluiertes Routing, Zugriffstrennung, Token-/Datenlimits |
| K-046 | Multi-User Web UI | SSO/MFA, Teamrollen, Audit-Logs, keine öffentlichen Adminflächen |
| K-047 | Customer Support | Onboarding, Ticketing, Löschung, Usage-Analytics nach Einwilligung |
| K-048 | Store/Release Recht | Rechtscheck, DPA, Lizenzprüfung und branchenspezifische Abnahme |

## Qualitätsschranken für die Roadmap

- Keine neuen autonomen Produktionsaktionen vor P0-Sandbox und Identitätsfreigaben.
- Kein echtes VPS-Deployment vor P3-Inventory und Restore-Gate.
- P2-Design nur nach Abnahme einer führenden Richtung; keine „drei Designer gleichzeitig“.
- P4 erst vertiefen, wenn P0–P3 in realen Referenzprojekten durch belastbare Tests nachgewiesen sind.

**Zeit-/Kostenplanung:** Ohne Teamgröße, Providerpreise und Integrationsziel sind seriöse feste ETA/Eurobeträge nicht möglich. Erst reale Durchsatz- und Reworkmessungen bilden eine belastbare Projektprognose.
