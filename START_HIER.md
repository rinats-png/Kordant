# KORDANT START HIER – ohne Programmierkenntnisse

## Was ist KORDANT jetzt?

KORDANT ist ein **lokal lauffähiges System zur Organisation und Kontrolle von KI-gestützter Softwareentwicklung**. Du kannst damit bereits Projekte anlegen oder übernehmen, Planung erstellen, Aufgaben verteilen, die passenden Rollen-/Skill-Anweisungen erzeugen, Nachweise sammeln und den Fortschritt in einem lokalen Dashboard sehen. Hinzu kommen 76 Skills, 18 Rollen, 28 Workflows und Anleitungen für Design, Sicherheit, Geschäftsmodelle sowie Migration auf unterschiedliche Server- und Cloudplattformen.

KORDANT **schreibt nicht ohne gesondert eingerichtete KI-Tools automatisch eine komplette App** und **stellt keine App ohne überprüfte Zugänge selbständig auf einem VPS bereit**. Es ist eine getestete erste Version, kein produktionsreifer autonomer Deploy-Dienst. Das ist eine wichtige Sicherheitsgrenze.

## Variante A: Du willst KORDANT selbst mit Claude Code/Codex fertig entwickeln

1. ZIP entpacken und den darin enthaltenen Ordner `kordant` öffnen.
2. Diesen Ordner in Claude Code oder Codex als Projekt/Workspace öffnen.
3. Den nachfolgenden Auftrag kopieren (oder exakt auf `prompts/KORDANT_SELF_BUILD.md` verweisen):

> Lies `AGENTS.md`, `prompts/KORDANT_SELF_BUILD.md`, `docs/STATUS_AND_ROADMAP.md` und `docs/MASTERBLUEPRINT.md`. Führe zuerst `npm test` und `npm run check` aus. Analysiere die implementierten Module und den P0-Backlog. Erstelle die nächste kleinste abgeschlossene Implementierung mit neuen Tests und unabhängigem Review. Arbeite seriell an gemeinsamen Dateien und parallel nur an getrennten Modulen. Keine Änderung am Live-Server; keine produktiven Zugangsdaten; keine externen KI-Kosten ohne meine Freigabe. Dokumentiere Resultate und Blocker mit echten Testausgaben.

4. Lass die KI zunächst den **Ist-Stand** und den nächsten P0-Meilenstein zeigen. Entwickle fehlende Module in gesonderten Branches. Lass jedes Ergebnis testen und überprüfen.

## Variante B: Du willst mit KORDANT eine neue App starten

**Voraussetzung:** Node.js 22 oder neuer (https://nodejs.org/). Das ist ein einmaliger Installationsschritt auf dem Rechner.

Öffne im KORDANT-Ordner ein Terminal und führe Folgendes **Zeile für Zeile** aus:

```bash
node bin/kordant.mjs doctor
node bin/kordant.mjs init ../meine-app --name "Meine App" --kind saas --risk 2 --budget 25
node bin/kordant.mjs --project ../meine-app plan scaffold --mode full
node bin/kordant.mjs --project ../meine-app plan status
node bin/kordant.mjs --project ../meine-app workflow start new-product
node bin/kordant.mjs --project ../meine-app task next
node bin/kordant.mjs --project ../meine-app dashboard --port 3333
```

Im Browser `http://127.0.0.1:3333` öffnen; das Dashboard bleibt **nur auf diesem Rechner** erreichbar. Beenden mit **Strg+C** im Terminal.

In `../meine-app/docs/kordant-planning/` entstehen 25 Planungsdateien. Für geführte, umfangreichere Planung kannst du dein vorhandenes `idea-to-app` einsetzen; die optionale KORDANT-Anbindung ist im nächsten Abschnitt beschrieben.

## Variante C: Vorhandene App (z. B. CENTRIC) verstehen

```bash
node bin/kordant.mjs audit /pfad/zum/repository
```

Dieser Befehl ist lesend; er installiert keine Pakete, ändert den Code nicht und greift nicht auf deinen Server zu. Er liefert einen **Struktur-Audit**, keinen Penetrationstest. Bei einem realen Live-System ist anschließend ein getrennter, autorisierter Infrastrukturabgleich notwendig.

**Erst anschließend**, wenn du das möchtest, KORDANT im Projekt initialisieren:

```bash
node bin/kordant.mjs adopt /pfad/zum/repository --name "Bestehende App" --risk 2
node bin/kordant.mjs --project /pfad/zum/repository workflow start adopt-project
```

Wenn du die bestehende App nicht ändern möchtest, die zweite Gruppe nicht ausführen: `adopt` erstellt einen `.kordant`-Ordner im bestehenden Repository.

## idea-to-app und Hallmark / Taste

- `idea-to-app` liegt im eigenen GitHub-Repo `rinats-png/idea-to-app`. KORDANT bindet es **optional** über einen überprüften Versionsstand ein. Bestehende Dateien dort werden nicht verändert. Bei installiertem Git und Netz kann KORDANT es bewusst beziehen: `node bin/kordant.mjs --project ../meine-app idea install --online`.
- Hallmark ist die **führende Designrichtung**, Taste wird als getrennte visuelle Kritik verwendet. Die konkreten externen Skills müssen vor Verwendung auf Version, Lizenz und Skriptverhalten geprüft und separat eingerichtet werden.

## Kosten und Freigaben

**Nur das Auspacken, die Kern-CLI und die lokalen Tests verursachen keine KI-API-Kosten.** Provider-CLI-Tools, Onlinezugriffe, Hosting und externe Dienste können Kosten verursachen. Für diese sind Zugang und ausdrückliche Freigabe erforderlich. KORDANT kann derzeit nicht alle Providerlimits garantieren.

Bei riskanten Aufgaben (Konto-/Rechteverwaltung, Billing, Gesundheits-/Kinderdaten, Migration, Live-Deployment) sind unabhängige Prüfungen und fachliche Freigaben notwendig. Die aktuelle `gate production`-Prüfung gibt ausdrücklich **kein grünes Produktionssignal** aus.

## Der praktisch beste Start

1. Entpacke das Paket.
2. Starte `npm test` und `npm run check` im Ordner.
3. Öffne KORDANT in Claude Code oder Codex und gib den Auftrag aus Variante A.
4. Erst wenn der Produktionsunterbau in isolierter Testumgebung funktioniert, benutze KORDANT zur echten autonomen Softwareentwicklung in einer von dir kontrollierten, zuvor geprüften Infrastruktur.

**Mehr Details:** `docs/USER_GUIDE.md`, `docs/MASTERBLUEPRINT.md`, `docs/STATUS_AND_ROADMAP.md`.
