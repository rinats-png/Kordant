# Architekturentscheidungen und bewusste Grenzen

## ADR-001 – Node 22 mit eingebauten Modulen

**Entscheidung:** Keine npm-Runtime-Abhängigkeiten im KORDANT-Core; ESM JS, `node:test`. **Grund:** geringer Installations-/Supply-Chain-Aufwand und sofortige lokale Ausführbarkeit. **Trade-off:** JSONL/Datei-Locks sind keine transaktionale Multi-User-Datenbank. Für Cloudprodukt später strukturierte DB.

## ADR-002 – Einzelner lokaler Operator

**Entscheidung:** CLI und Dashboard sind lokal auf eine Person ausgelegt. **Grund:** Steuerung für nichtprogrammierende Projektinhaber ohne zwingenden Server/Account. **Trade-off:** kein SSO/RBAC/Cloud UI. Produktionsbereitstellung als Teamsoftware nicht geeignet.

## ADR-003 – Fail-closed bei Produktion

**Entscheidung:** `gate production` bleibt unabhängig von Artefakten gesperrt. **Grund:** lokale Dateien reichen nicht, um Nutzeridentität, echte Deploymentprüfung, Pentest, Datenschutz und Recovery zu beweisen. **Trade-off:** kein One-Click-Deploy. P3 ergänzt signierte Operatorfreigabe.

## ADR-004 – idea-to-app nicht ungesehen kopieren

**Entscheidung:** Pinned Upstream-Clone optional pro Projekt. **Grund:** keine unsichtbare Vendor-Library oder Lizenzen im Kern; vollständiger 25-Phasen-Workflow bleibt zugänglich. **Trade-off:** für die vollständige Upstream-Mentor-Funktion muss der User den geprüften Clone importieren bzw. online installieren. KORDANT liefert ein eigenes Offline-Gerüst.

## ADR-005 – Hallmark vor Taste

**Entscheidung:** nur eine führende Designrichtung; Taste ist Review. **Grund:** zwei autonome UI-Agenten verursachen Tokenkosten und inkonsistente Designs. **Trade-off:** weniger zufällige kreative Varianz; gezielte Exploration bleibt erlaubt.

## ADR-006 – Evidence als SHA-Register

**Entscheidung:** Berichte mit Dateihash registrieren und vor Taskabschluss prüfen. **Grund:** schnell implementierbare Integrität gegen versehentliche Änderungen. **Trade-off:** kein unveränderlicher, unabhängiger Beleg für Inhalt, Autor oder Provider. Signierte CI-Attestations sind als P0/P2 vorgesehen.

## ADR-007 – Providerstart explizit, nicht automatisch

**Entscheidung:** Prompt-Export ist Standard. Externer Provider erfordert Policy + Execute + bewusstes Kostenrisiko. **Grund:** Tools haben verschiedene Sandboxes und Bezahlmodelle. **Trade-off:** noch kein echter autonomer Kosten-Cap-Runner.

## ADR-008 – Infrastruktur nur planen

**Entscheidung:** Der Basiskern generiert Deploy-/Migrationspläne, keine Remote-Ausführung. **Grund:** bestehender VPS kann produktive Daten und unbekannte Dienste enthalten. **Trade-off:** Betriebsautomation folgt erst mit echten sicheren Operatorrechten und geprüfter Umgebung.
