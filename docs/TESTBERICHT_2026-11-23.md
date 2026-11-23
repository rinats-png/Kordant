# KORDANT 0.1.0 – lokaler Prüfbericht

**Datum:** 23.11.2026  
**Prüfumgebung:** lokaler Container, Node.js (Version aus `node --version` zur Laufzeit ermitteln).  
**Umfang:** Kernmodule, CLI, Projektplanung, Aufgaben und Abhängigkeiten, Nachweishash, Budget, Dashboard, idea-to-app-Importer, Skill-Inspector, Starter und sichere Demo.

## Ausgeführte Befehle

```bash
npm test
npm run check
npm run demo:safe
```

## Ergebnis

- `npm test`: **29 bestanden, 0 fehlgeschlagen** (drei Testdateien).
- `npm run check`: **75 Skills, 18 Agenten, 28 Workflows** einschließlich Cross-Referenzen erfolgreich kontrolliert.
- `npm run demo:safe`: lokale Lite-Planung und Bugfix-DAG erstellt; sowohl Release- als auch Produktionsfreigabe erwartungsgemäß `BLOCKED`.
- `node-web`-Starter: eigener minimaler HTTP-Test erfolgreich.

## Getestete negative Fälle

- Erneute Projektinitialisierung wird abgelehnt.
- Task ohne Pflichtbelege wird nicht abgeschlossen.
- Nachweisdatei mit verändertem Hash wird abgelehnt.
- Evidenz außerhalb des Projektordners oder über Symlink wird abgelehnt.
- Konkurrierende Dateiscopes werden blockiert.
- Workflow-Zyklen werden erkannt.
- Unvollständiger Handoff ohne Draft-Schalter wird verweigert.
- Produktionsgate gibt kein automatisches grünes Signal.
- idea-to-app-Kopie übernimmt keine `.git`- und `.env`-Dateien und keine Symlinks.
- Unsichere Shell-Befehle in fremden Skills werden statisch als Reviewbefund erkannt.

## Ausdrücklich nicht nachgewiesen

- Echte KI-Agentenläufe mit externen Providerkonten oder harte Kostenobergrenzen.
- Isolation auf Betriebssystem-/Netzwerkebene gegen bösartige Agenten.
- Reale GitHub-CI-Workflows, signierte Build-Provenance, SAST/DAST/Pentest.
- Sichere Produktivmigration oder Wiederherstellung echter Daten auf IONOS.
- Rechtskonformität, Datenschutz-Fachprüfung, Store-Veröffentlichung oder fehlerfreier Betrieb unter Last.
- Externe Hallmark-/Taste-Codeausführung, Agenten-Training oder vollständige UX-Abnahme.

**Interpretation:** Ein erfolgreiches Testprotokoll belegt die lokal getesteten Funktionen. Es ist keine Freigabe, KORDANT selbst oder damit erstellte Anwendungen ohne zusätzliche Prüfungen produktiv einzusetzen.
