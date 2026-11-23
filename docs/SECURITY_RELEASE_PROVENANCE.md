# Agenten-Worktrees, Sandbox-Grenzen und Release-Provenance

## 1. Drei unterschiedliche Begriffe

- **Worktree:** Kopie eines Git-Checkout, damit Agenten an unterschiedlichen Aufgaben/Branches arbeiten können. Keine echte Betriebssystem- oder Netzwerk-Isolation.
- **Sandbox:** technisch getestete Beschränkung von Dateizugriff, Prozessen, Netzwerk und Geheimnissen. Wird aktuell **nicht** durch KORDANT bereitgestellt. Ein separates, überprüftes Worker-/Container-System muss diese Schranke durchsetzen.
- **Release-Provenance:** cryptographisch/anbieterseitig verifizierte Kette von Quellcommit → Build → Tests → Artefakt → Genehmigung. Lokale Hashes sind dafür notwendig, aber nicht hinreichend.

KORDANT führt keinen unüberwachten Schreibagenten aus. Der Standard bleibt `agent prompt` ohne Seiteneffekte. Für Remote-Checks ist `github checks` lesend und benötigt einen Token über die Umgebung, der niemals in das Projekt geschrieben wird.

## 2. Arbeitsablauf in vertrauenswürdigen lokalen Repositories

```bash
node bin/kordant.mjs --project ../app task claim TASK-xxxx
node bin/kordant.mjs --project ../app worktree plan TASK-xxxx
# Nur wenn Agentenzugriffe explizit konfiguriert und das Git-Repository vertrauenswürdig sind:
node bin/kordant.mjs --project ../app worktree create TASK-xxxx --execute
node bin/kordant.mjs --project ../app worktree status TASK-xxxx
```

Die Ausführung ist bewusst von `allowExternalAgents` abhängig. Git-Konfiguration, Git-Filter, Abhängigkeitsskripte und Hook-Mechanismen können trotzdem Risiken auslösen. Ein untrusted Repository gehört in eine separat isolierte Umgebung.

## 3. Lokale Build-Nachweise

```bash
node bin/kordant.mjs --project ../app build attest \
  --artifact dist/app.tar.gz --tests reports/test.txt --review reports/review.txt \
  --author engineer --reviewer independent-reviewer
node bin/kordant.mjs --project ../app build verify --file ../app/.kordant/reports/build-...json
```

Diese Funktion verifiziert lokale Prüfsummen und die Git-Revision. Sie behauptet nicht, dass der Reviewer wirklich unabhängig ist, GitHub-CI die gleichen Bytes gebaut hat, der Hersteller signiert hat oder ein Produktionsdeployment berechtigt ist.

## 4. Drittanbieter-Scanner/SARIF

```bash
node bin/kordant.mjs --project ../app security sarif --file ../app/reports/scan.sarif.json --block-at high
```

Das Format wird ausgewertet; Toolname, Version, Authentizität, tatsächlicher Scanumfang, CVE-Kontext und Fehlalarme müssen gesondert geprüft werden. Ein erfolgreicher SARIF-Import ist kein Penetrationstest.

## 5. Vor produktiven Aktionen zwingend

Eine separate Sandbox mit Negativtests, Identitäts- und Berechtigungsprüfung, Geheimnisverwaltung, erzwungene Providerlimits, unabhängiger Security-Review, Release-Signatur, Restore-Drill und eine produktive Staging-Abnahme. Die lokalen CLI-Gates bleiben bis dahin strukturelle Prüfungen, keine vollständige Betriebserlaubnis.
