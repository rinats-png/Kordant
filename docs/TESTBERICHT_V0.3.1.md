# KORDANT v0.3.1 – Prüfbericht (23.11.2026)

## Ausgeführte lokale Tests

- `npm test`: **47/47 erfolgreich** (Node.js 22+, Testlauf ohne kostenpflichtige Provider).
- `npm run check`: **76 Skills, 18 Agentenrollen, 28 Workflows validiert**.
- `npm run demo:safe`: `release=BLOCKED`, `production=BLOCKED`, ohne reale Server- oder KI-Provider-Aufrufe.
- Plattformkatalog: sieben integrierte neutrale Plattformtypen, Custom-JSON ohne Secrets und ohne Skriptausführung.
- 28 Standard-Workflows haben keine Abhängigkeit zum Legacy-Skill `ionos-deploy`.
- Regressionstest prüft, dass auch der Kataloggenerator standardmäßig `provider-agnostic-deploy` verwendet.

## Was die Tests nicht beweisen

- Keine OS/Netzwerk-Sandbox gegen bösartige Agenten und Skills bewiesen.
- Keine belastbaren Live-Providerkostenlimits, produktiven SaaS-Billing-Integrationen oder Cloud-/VPS-Deployments.
- Kein vollautomatisches Mobile-/Store-Release, kein unabhängiger Pentest, keine rechtliche Prüfung.
- Die Profilvalidierung ist eine Datenprüfung, **keine** Provider-API-Anbindung oder Berechtigungsprüfung.

## Releasepolitik

Neue Staging- und Produktivadapter dürfen erst nach getrennten negativen Sandbox-/Identitäts-/Secret-Tests, realem Restore-Drill, unabhängiger Prüfung und Betreiberfreigabe als produktionsreif gelten.
