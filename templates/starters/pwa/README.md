# KORDANT pwa Starter – Planungsprofil

Diese Vorlage ist absichtlich **kein ungetestetes Framework-Scaffold**. Ein passender Stack soll nach Planung, ADR, Sicherheitsklassifikation, Kostenvergleich und Plattformregeln gewählt werden. Nutze dazu das Skill-/Workflow-Paar aus dem KORDANT-Katalog.

## Abnahmekriterien

- Reproduzierbarer Build, Tests, Fehlerpfade, Dokumentation und Artefakt-Digest
- Authentisierung, Rollen, Mandantentrennung und Datenlöschung soweit nötig
- PWA: Offline- und Service-Worker-Update; Mobile: Signing und Stores; Desktop: Code Signing und Updater; API: Versionierung und Rate-Limits; SaaS: Billing und Verträge
- Servermigration mit Backup/Restore-Test, Monitoring und rollbackfähiger Releaseplanung

**Noch nicht implementiert:** Applikationscode und komplette Build-Pipelines für diese Plattform. Für funktionierende Codebasis: node-web verwenden.
