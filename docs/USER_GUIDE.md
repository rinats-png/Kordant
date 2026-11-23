# Benutzerhandbuch: KORDANT ohne Programmierkenntnisse

## 1. Was du tatsächlich bekommst

KORDANT verwaltet **Softwareprojekte und die Arbeit von KI-Agenten**. Es kann einen strukturierten Plan erzeugen, eine bestehende Codebasis statisch prüfen, Aufgaben nach Abhängigkeiten aufbauen, Agentenprompts erstellen, Testnachweise registrieren und sichere Deployment- bzw. Migrationspläne vorbereiten. Es kann **nicht** ohne zusätzliche KI-Werkzeuge, Serverzugänge oder Fachprüfungen selbständig eine vollständige App produktiv online stellen.

### Installation

1. Node.js **mindestens 22** installieren (offizielle Website: https://nodejs.org/).
2. KORDANT ZIP entpacken. Im Ordner KORDANT ein Terminal öffnen (Windows PowerShell oder Terminal macOS/Linux).
3. `node bin/kordant.mjs doctor` eingeben. `nodeOk: true` ist Pflicht. Docker/Caddy/SSH dürfen für rein lokale Planung fehlen.
4. `node bin/kordant.mjs --help` zeigt alle Befehle.
5. `npm test` und `npm run check` prüfen die KORDANT-Kernfunktionen lokal.

`npm install` ist für die Kern-CLI nicht nötig; Node.js verwendet nur eingebaute Module.

## 2. Neues Produkt aufbauen

```bash
node bin/kordant.mjs init ../mein-produkt --name "Mein Produkt" --kind saas --risk 2 --budget 25
node bin/kordant.mjs --project ../mein-produkt plan scaffold --mode full
node bin/kordant.mjs --project ../mein-produkt plan status
```

In `../mein-produkt/docs/kordant-planning/` liegen 25 Planungsdokumente. Schreibe die Entscheidungen hinein, markiere Unbekanntes als offen und belege sie soweit möglich. Die Dateien sind ein eigener Offline-Planungsfundus. Für das vollständigere dialoggeführte System installiere das optionale upstream `idea-to-app` (siehe Integrationen).

```bash
node bin/kordant.mjs --project ../mein-produkt plan handoff --draft
node bin/kordant.mjs --project ../mein-produkt workflow start new-product
node bin/kordant.mjs --project ../mein-produkt task next
```

Der `--draft`-Handoff sagt ausdrücklich, welche Phasen unvollständig sind; das ist **keine** Projektfreigabe. Ohne `--draft` wird er bei unvollständigen Phasen verweigert.

## 3. Bestehende App übernehmen

```bash
node bin/kordant.mjs audit ../altes-repo
node bin/kordant.mjs adopt ../altes-repo --name "Altbestand" --risk 2
node bin/kordant.mjs --project ../altes-repo workflow start adopt-project
node bin/kordant.mjs --project ../altes-repo task next
```

Wichtig: Wenn eine App schon auf deinem VPS läuft, kann der Repo-Code älter als die Live-Version sein. Der lokale Audit sieht **nur Dateien**, nicht deinen VPS, nicht laufende Container, nicht DNS und keine Datenbankberechtigungen. Lass die Live-Analyse separat durch einen berechtigten Operator durchführen.

## 4. Mit Claude/Codex arbeiten

1. Aufgabe mit `task next` wählen.
2. `task claim <id>` reserviert diese Aufgabe, falls noch kein anderer Agent denselben Pfad bearbeitet.
3. `agent prompt <id>` erstellt `.kordant/prompts/<id>.md`.
4. Den Inhalt in Claude Code oder Codex öffnen oder über eine vertrauenswürdige, isolierte eigene Agenten-Laufzeit verwenden.
5. Nach erfolgreicher Durchführung echte Testberichte/Reviews unter `.kordant/reports/` speichern.
6. Mit `task evidence` registrieren, dann `task done` verwenden.

Beispiel:

```bash
node bin/kordant.mjs --project ../mein-produkt task claim TASK-abc
node bin/kordant.mjs --project ../mein-produkt agent prompt TASK-abc
node bin/kordant.mjs --project ../mein-produkt task evidence TASK-abc --type test --file .kordant/reports/tests.txt
node bin/kordant.mjs --project ../mein-produkt task evidence TASK-abc --type review --file .kordant/reports/review.txt
node bin/kordant.mjs --project ../mein-produkt task done TASK-abc
```

Keine Testberichte erfinden oder mit Platzhaltertext füllen: KORDANT kann zwar die Datei hashen, aber ihre fachliche Wahrheit noch nicht automatisch garantieren.

## 5. Lokales Dashboard

```bash
node bin/kordant.mjs --project ../mein-produkt dashboard --port 3333
```

Browser: `http://127.0.0.1:3333`. Diese Ansicht darf **nicht öffentlich erreichbar sein**. Es gibt keine Anmeldung und keine Schreibfunktion.

## 6. Mit Budget arbeiten

```bash
node bin/kordant.mjs --project ../mein-produkt model route --risk 3 --complexity 4 --type security
node bin/kordant.mjs --project ../mein-produkt cost reserve --usd 2 --reason "Designreview"
node bin/kordant.mjs --project ../mein-produkt cost release --usd 2
node bin/kordant.mjs --project ../mein-produkt cost record --provider Beispiel --model Modell --input 10000 --output 3000 --rate-input 1 --rate-output 4
```

`--rate-input` und `--rate-output` bedeuten **USD je eine Million Token**, nicht je Token. Werte musst du aus deinem tatsächlich verwendeten Anbieter übernehmen. Die CLI behauptet keine aktuellen Marktpreise. **Kosten für externe KI-Provider sind nicht automatisch gedeckelt.**

## 7. IONOS-Migration vorbereiten

```bash
node bin/kordant.mjs --project ../mein-produkt migrate plan --source "alter VPS" --destination ionos-vps --data "Dateien+DB"
node bin/kordant.mjs --project ../mein-produkt deploy plan --domain staging.example.com --target staging
node bin/kordant.mjs --project ../mein-produkt gate release
```

Das erzeugt Plan-Dateien. Es verbindet sich mit **keinem** Server. Die echte Migration gehört in eine separate, freigegebene und fachlich überprüfte Betriebsphase. Siehe `DEPLOYMENT_IONOS.md`.

## 8. Typische Fehler und schnelle Lösung

| Meldung | Ursache | Maßnahme |
|---|---|---|
| Kein KORDANT-Projekt | Kein `.kordant/project.json` im Zielordner | `--project` auf Projektordner setzen oder `init` |
| Scope-Kollision | Zwei Agenten würden gleiche Dateien bearbeiten | Arbeitspakete trennen oder ersten Agent abschließen |
| Abhängigkeiten offen | Vorherige Aufgabe noch nicht fertig | `task next` ausführen |
| Nachweise fehlen | Task hat Pflichtbelege | Tatsächlichen Bericht registrieren |
| Evidence beschädigt | Nachweisdatei nach SHA-Erfassung verändert | Neue gültige Evidenz erstellen und neu registrieren |
| Release Gate rot | Nachweise unvollständig oder Tasks offen | `gate release --json` ansehen, jeden Blocker prüfen |
| idea-to-app nicht installiert | Upstream nicht eingebunden | `idea install --from ...` oder `--online` |
| Docker nicht installiert | Nur für Deploy-Vorbereitung relevant | Auf Server bzw. Test-VPS korrekt einrichten |

## 9. Was du entscheiden musst

Du gibst die kritischen Produktmerkmale, die Rechte-/Datenflüsse, die Designrichtung, Budget und monetäre Abrechnung, Externe Anbieter, Migrationsfenster sowie Live-Freigaben vor. Alles andere kann nach klaren Regeln delegiert werden – aber auch dann muss das Ergebnis technisch geprüft werden.
