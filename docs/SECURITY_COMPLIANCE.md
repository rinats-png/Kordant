# Security-, Datenschutz- und Compliance-Architektur

**Geltungsbereich:** KORDANT-Framework, ausführende Agenten, damit entwickelte Produkte und die eigene Infrastruktur. **Kein** Freigabezertifikat, keine Rechtsberatung.

## 1. Drei getrennte Vertrauenszonen

- **KORDANT-Kontrollschicht:** Projektzustand, Taskdaten, Policies, Budget, Evidenzmanifeste und Reviewrechte. Nur der Betreiber darf lokale Policies ändern. In V0.1 ist die CLI eine Single-User-Lokalinstallation; kein echtes RBAC.
- **Agenten-Schreibumgebung:** Kopie/Worktree, Testdaten, begrenzte Dateibereiche, gesperrte Produktionscredentials. Ein Prompt-Scope ist keine Sicherheitsgrenze. Echte technische Grenzen benötigen Container, VM oder Provider-Sandbox plus Egress-Kontrolle.
- **Produktionsumgebung:** echte Nutzer, Daten, externe Verträge und Abrechnung. Agenten sollten ausschließlich überprüfte Artefakte bereitstellen; der Releaseprozess erfolgt über getrennte Betriebsberechtigungen.

## 2. Bedrohungsmodell für Agenten

| Bedrohung | Konkretes Beispiel | Gegenmaßnahmen | Nachweis |
|---|---|---|---|
| Prompt Injection | README enthält fremde Tool-Anweisungen | Untrusted Content markieren, feste Policies, separate Review-Gates | Injection-Eval und Policy-Test |
| Credential Exfiltration | Agent liest `.env` und ruft externe URL auf | Kein Secret in Agent-Sandbox, Egress-Allowlist, Redaction | Sandbox-Policy/Netzwerk-Audit |
| Supply Chain Poisoning | manipulierte Skill-/MCP-Installation | Checksum, Pin, Code-Review, Permission-Manifest | Prüfreport + Hash |
| CI-Manipulation | Agent deaktiviert fehlschlagende Tests | Protected Branch, externe Statusprüfung, diffbasierte Checks | GitHub-Run + Ruleset |
| Falsches Grün | Agent erzeugt einen Text „Tests bestanden“ | Artefaktgebundene CI-Belege, unabhängiger Reviewer | Externe CI-Run-ID |
| Kostenexplosion | Endlose Agent-Retries / Modellaufrufe | Max Retries, Timeouts, echte Providerlimits, Alerts | Billing-/Usage-Log |
| Schreibkollision | Zwei Agenten verändern Auth-Logik | Write-Scope/Worktree-Isolation, Merge-Queue | Branch-/Task-Eigentümer |
| Datenverlust | Agent führt DB-Schema-Update live aus | deny default, Backup, Staging, Migrationstransaktion | Restore-Drill + Owner-Signoff |

### Grenzen der aktuellen Implementierung

KORDANT bietet `withMutation` als lokale exklusive Schreibsperre und prüft Task-Scope-Kollisionen. Eine lokale Sperrdatei ist **kein** geeignetes verteiltes Lock für mehrere Maschinen. JSONL-Evidenz ist **nicht** WORM oder rechtssicher revisionsfest. Das Read-only-Dashboard hat keine Benutzerverwaltung und ist nur auf `127.0.0.1` nutzbar.

## 3. Produkt-Sicherheitsmatrix

### Identität und Session

- Authentisierung über bewährte Implementierung oder dedizierten Provider, keine eigene Kryptografie.
- MFA besonders für privilegierte Konten, Recovery mit Vier-Augen- oder ähnlich wirksamen Identitätsverfahren.
- Session-Rotation, HttpOnly/Secure/SameSite Cookies, sichere Logout-/Reset-/Invitesemantik.
- Rate Limiting für Login, Reset, Registration, teure API-Aktionen pro Konto und IP.

### Autorisierung und Mandanten

- Jede Datenoperation serverseitig gegen aktuelle Rechte prüfen – einschließlich Listen, Suchen, Exporte, Uploads und Dateien.
- Negativtests: fremde Nutzer-ID, fremde Tenant-ID, historische Rolle, Gast, deaktivierter Account, Session nach Passwortwechsel.
- Bei Datenbank-RLS: Policies für alle Tabellen und Datenbankrollen; keine alleinige UI-Versteckung.

### Eingaben und Integrationen

- Schema Validation, Mass Assignment Allowlist, parametrisiertes SQL/ORM, Output Escaping.
- CSP, CORS auf erlaubte Origins, CSRF-Schutz, Upload-Typprüfung nach Inhalt, Dateigrößen-/Zeitlimits, ZIP-Bomben-Prävention und SSRF-Schutz.
- Webhooks: Signatur, Replay-Zeitfenster, Idempotency Key, Atomic Writes, Reihenfolge, Retry- und DLQ-Verhalten.
- KI: Prompt Injection, Datenminimierung, Modell-Fallback, Rate- und Kostenlimits, Output Schemas, Human Review bei folgenreichen Aktionen.

### Operations

- TLS, SSH-Key, Firewall, getrennte Secrets, Least Privilege, externe Backups, Restore-Tests, zentrale Fehlersignale ohne personenbezogene Daten.
- Lieferkette: SBOM, geprüfte Abhängigkeiten, gepinnte Actions, Image-Digests, Signaturen/Attestations und Versionspflege.

## 4. OWASP ASVS

Basis: OWASP Application Security Verification Standard **v5.0.0**. Jede in ein Produkt übernommene Security-Anforderung muss eine versionierte Referenz (z. B. `v5.0.0-X.Y.Z` nur für tatsächlich gefundene Identifikatoren) und einen echten Test haben. Die generischen Empfehlungen hier sind keine Vollimplementierung des gesamten Standards. Siehe https://asvs.owasp.org/.

## 5. EU-Datenschutz

In der Produktplanung dokumentieren: Beteiligte Verantwortliche und Auftragsverarbeiter, Rechtsgrundlage je Zweck, Datenarten und -kategorien, betroffene Personengruppen, Speicherorte, Empfänger/Drittstaaten, technisch-organisatorische Maßnahmen, Zugriff und Betroffenenrechte. Eine Datenschutzerklärung alleine ersetzt keinen Datenfluss- und Löschplan.

**Risikostufe 3:** ggf. DSFA nach Art. 35 DSGVO, externe fachliche Prüfung, Schutz von Kinderdaten, Standort-/Gesundheitsdaten und rechtlich geschützten Kategorien. Explizit akzeptiertes Risiko ersetzt keine zwingenden Pflichten. Produktionsfreigabe wird unabhängig von grünen lokalen Tests blockiert, solange Verantwortlichkeiten und Nachweise nicht geprüft wurden.

## 6. EU AI Act und KI-Features

Die Verordnung hat gestufte Anwendbarkeit und wird weiterentwickelt. Prüfe die offiziellen aktuellen Daten statt einer unbewiesenen Pauschalfrist: https://ai-act-service-desk.ec.europa.eu/en/ai-act/eu-ai-act-implementation-timeline. Kategorisiere die konkrete Rolle als Anbieter/Betreiber, Zweck, Daten, automatisierte Entscheidungen, Transparenz, Hochrisiko- und Dokumentationspflichten. Jede relevante Modellfunktion benötigt eine versionierte AI-Systemkarte und Nutzungs-/Eval-Nachweise.

## 7. Bedrohungsregister-Template

| Feld | Pflicht |
|---|---|
| Risiko-ID | BD-0001 (niemals wiederverwenden) |
| Angreiferziel und Asset | Was könnte beschädigt/entwendet werden? |
| Eintrittspunkt | API, UI, Upload, Agent Tool, CI, Third Party |
| Auswirkung | Nutzer, Daten, Abrechnung, Verfügbarkeit, Recht |
| Wahrscheinlichkeit | Begründete Bewertung, nicht bloße Farbe |
| Kontrolle | Präventiv und detektiv |
| Test | Test-ID/CI-Lauf/Prüfperson |
| Risikoentscheidung | Owner, Datum, Ablauf, Rechtsprüfung |

## 8. Security-Release-Gate

1. Versionsstand und Hash der genau ausgelieferten Software belegen.
2. AuthZ- und Cross-Tenant-Negativtests grün, gefährliche Befunde eingestuft und bearbeitet.
3. Drittanbieter-Abhängigkeiten/Lizenzen und SBOM geprüft.
4. Keine aktiven kritischen Befunde ohne wirksame Sperre und technische Behebung.
5. Datenfluss, AVV, Verschlüsselung, Logging und Export/Löschung passend zum Produkt geprüft.
6. Offsite-Backup und Testrestore, Incident-Plan, Monitoring und Alarme getestet.
7. Unabhängige menschliche/Fachfreigabe je nach Datenrisiko dokumentiert.
8. Live-Ressourcen und Geheimnisse vom Entwicklungsagenten getrennt.

**V0.1:** Der Befehl `gate release` prüft zunächst nur lokale Evidenzstruktur. Eine tatsächliche Sicherheitsfreigabe kann nur außerhalb dieses Tools erteilt werden.
