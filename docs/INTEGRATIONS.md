# Integrationsarchitektur: idea-to-app, Claude, Codex, Hallmark, Taste, GitHub und Tools

## 1. Integrationstypen

Es gibt vier Klassen: **A: eingebaut**, **B: per gepinntem Quellcode installierbar**, **C: vorhandene externe CLI**, **D: künftiger Adapter**. Ein Name im Katalog bedeutet nicht, dass das Werkzeug installiert, angebunden oder kompatibilitätsgetestet ist.

| Baustein | Status in KORDANT 0.1 | Aufgabe | Verbindliche Grenze |
|---|---|---|---|
| idea-to-app 1.2.0 | B – CLI-Install aus lokalen Dateien oder git | 25-Phasen-Planung | Upstream-SHA fix, fremdes Skript standardmäßig nicht ausgeführt |
| KORDANT Planungsgerüst | A – offline | 25 Phasen strukturieren, Handoff als Draft | Inhaltliche Abnahme manuell |
| KORDANT Workflows | A – offline | DAG/Scopes/Tasks | Kein verteiltes Scheduling |
| Claude Code | C – Prompt-Export, experimenteller Read-only-Adapter | Code und Design nach Auftrag | Externes Pricing und Berechtigungen außerhalb des Frameworks |
| OpenAI Codex CLI | C – Prompt-Export, experimenteller Sandbox-Adapter | isolierte Aufgaben | Sandbox per Provider; keine eigenständige Sandbox-Verifizierung |
| Hallmark | B/C – Anleitung, Wrapper-Skill | führendes Designsystem | Fremdinstallation nicht automatisch |
| Taste Skill | B/C – Anleitung, Wrapper-Skill | unabhängiger Designreview | keine konkurrierende Designspezifikation |
| Superpowers | D – Methodik in Skills, kein Code eingebettet | TDD, Planung, Review | doppelte Orchestrierung vermeiden |
| GitHub Spec Kit | D – optionaler Planimport | Spezifikationsformat | Anforderungen deduplizieren |
| GitHub Actions | A – Beispiel-CI für KORDANT | Tests und Self-Check | Für konkrete App eigene CI nötig |
| Trivy/Gitleaks/Semgrep | D – Hinweise | scanning | erst installiert und konfiguriert wirksam |
| Docker/Caddy/Restic | A – geprüfte Vorlagen, nicht Live ausgeführt | Infrastruktur/Backups | keine automatische Prod-Mutation |
| Stripe/Resend/IONOS-SMTP | D – Anforderungen | Business/Mail | kein aktiver Zahlungs-/Mail-Adapter |
| Apple/Google Stores | D – Runbooks | Mobile Veröffentlichung | keine Store-Anmeldedaten / Uploads |

## 2. idea-to-app

Repository: https://github.com/rinats-png/idea-to-app

Pin: `00dc23b8f3a20a829f07bd3b7411d6b7a0e12bda` (Upstream `main` vom 14.10.2026). Dokumente liegen absichtlich **nicht dupliziert** im KORDANT-Core: Lizenz, Updates und Änderungen bleiben nachvollziehbar. Installation: `kordant idea install --online` oder `--from /lokaler/clone`. Das Modul landet unter `.kordant/vendor/idea-to-app` und wird nicht an `AGENTS.md` im Projektroot hineingeschrieben.

- Neue Produkte: idea-to-app Phase 0–24, Planungsmodus guided/adaptive und Risikoprofil nach Handoff.
- Bestehende Produkte: B0–B2, dann nur relevante Phasen; niemals im Audit bereits laufende Software einfach umbauen.
- Handoff: `F-xx`, `AK-...`, `TEST-...`, `TASK-...`, `BD-...`, `BF-...`, `E-...` durchreichen. Keine IDs neu vergeben.
- Rückkopplung: PR/Commit/Build/Releasemanifest an IDs binden, Entscheidungen im Plan nachführen. Implementierung der automatischen Bidirektionalität ist offener Epic.
- Das bereits vorhandene `pruefe-projekt.mjs` ist ein struktureller Checker; ohne Prüfung der Inhalte kein Sicherheitsnachweis.

## 3. Hallmark + Taste Skill

Hallmark: https://github.com/Nutlope/hallmark
Taste: https://github.com/tasteskill/tasteskill

**Schritt A – fremde Skills prüfen:** License, Maintainer, Version, SKILL.md, Skripte, Hook-Installation, benötigte Browserrechte, Dependency-/Netzwerkzugriff und Datenschutz. Gepinnte Versionen bevorzugen. Ungeprüft kein `curl|bash` oder globale Installation.

**Schritt B – Marken-/Produktinventar:** Logos, visuelle Referenzen, Nutzerfälle, Bildrechte, Typografie-Lizenzen, Brand-Tokens, zugängliche Kontraste, Dark-/Light-Mode.

**Schritt C – Hallmark als System-Owner:** Typografieskala, Spacing, Farben, Radius, Komponenten, Zustände, Mobile und Dark Mode verbindlich festlegen. Output unter `design/tokens.json`, `design/components.md`, `design/approvals.md`.

**Schritt D – Taste als Reviewer:** Nur fertige Screens gegen Hierarchie, visuelle Klarheit, Wiederholungsmuster, Überladung, Animation und Qualität bewerten. Änderungen gegen Hallmark-Tokens müssen zuerst als Vorschlag genehmigt werden.

**Schritt E – reproduzierbares Review:** Playwright-Screenshots bei festen Viewports, mit festen Fonts und Testdaten, manuelle Fokus-/Screenreader-Prüfung, visuelle Regression und reales Nutzerfeedback. Hallmark `sloplint` optional aus dessen separat geprüfter Installation.

## 4. Claude-Code-Aufruf

KORDANT erstellt in `.kordant/prompts/<TASK-ID>.md` den Auftrag. Claude Code kann daraus in einem kontrollierten Arbeitsverzeichnis Code erstellen. Die experimentelle CLI-Ausführung verwendet die Read-only-Plan-Permission und behauptet keine Schreibfähigkeit. Vollautonome Schreibausführung benötigt eine externe Sandbox, Berechtigungs-Allowlist und echtes Kostenmanagement.

## 5. Codex-CLI-Aufruf

CLI: `codex exec --sandbox workspace-write --ephemeral -` liest einen Prompt von stdin. KORDANT bietet hierfür einen **opt-in experimentellen** Adapter. Achte auf verwendete Codex-Version, Sandbox-Mechanismen und Provider-Zugangsrechte; diese werden nicht von KORDANT selbst bewiesen. Automatisches Executing benötigt `allowExternalAgents=true`, explizites `--execute` und `--accept-unmetered-cost`. Mit Providerlimits/echter Verbrauchserfassung ist es später sicherer integrierbar.

## 6. GitHub-Integration (zu implementieren)

Workflow-Run-IDs, PR-Änderungen, CI-SHA, Signaturen und Branch Protection sind in KORDANT noch nicht synchronisiert. Für ein produktives System sind *commit-pinned* Aktionen, read-only Token für Analyse, Schreibrecht nur für dedizierten Branch, branch protection, Pflichtreviews, Secret-Scanning, SCA und Artefakt-Provenance notwendig. Ein Agent darf keine eigenen grünen Checks fälschen oder Branch Protection deaktivieren.

## 7. MCP und Drittanbieter-Tool-Rechte

Jedes MCP/Plugin sollte über ein Manifest mit `name`, `version`, `owner`, `capabilities`, `allowedPaths`, `allowedHosts`, `read/write`, `dataSensitivity`, `costModel` und `reviewBy` verfügen. Der Broker muss die Freigabe technisch prüfen, nicht nur in den Prompt schreiben. Kein globaler Shellzugriff für Web-/Rechercheagenten. Mehrstufiges Tool-Approval für Produktion, Zahlungen und persönliche Daten.

## 8. Weiterführende Referenzen

- https://agentskills.io/specification – Skillstruktur und Metadaten
- https://github.com/obra/superpowers – TDD und strukturierte Entwicklungsarbeit
- https://github.com/github/spec-kit – Spezifikationsworkflows
- https://learn.chatgpt.com/docs/non-interactive-mode – Codex CLI non-interactive
- https://caddyserver.com/docs/ – Caddy
- https://restic.readthedocs.io/ – Backups
