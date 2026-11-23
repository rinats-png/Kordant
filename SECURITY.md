# KORDANT Security Policy

Diese Repository-Version ist ein lokales Engineering-Grundsystem, **keine validierte Sicherheitslösung**. Exploitbare Schwachstellen bitte zunächst vertraulich dem Repositorybetreiber melden, nicht mit echten Schlüsselwerten im öffentlichen Issue. Es gibt keinen zugesagten Reaktions-SLA.

## Schutzgrenzen
- Alle nichttrivialen Aktionen (externes Coding, Deployments, Datenmigration, Drittanbieter-Skripte) sind im Standardprofil gesperrt.
- `dashboard` bindet nur `127.0.0.1` und bietet ausschließlich GET-Schnittstellen. Nicht ohne Authentifizierung ins Internet exponieren.
- `audit` ist statisch und führt Code nicht aus. Seine Befunde ersetzen keinen Security-Test.
- Die lokalen Hashes für Evidence beweisen Veränderungsfreiheit der Datei, nicht die Unabhängigkeit oder Korrektheit der Aussage. Events sind nicht kryptografisch unveränderlich.
- Vor Einsatz mit Produktionsdaten: eine unabhängige Sicherheitsprüfung, Secret-Management, RBAC, Sandbox-Grenzen und externes Approval-System ergänzen.
- Den Security-Gate-Bericht nicht als OWASP-ASVS-Zertifikat ausgeben.
