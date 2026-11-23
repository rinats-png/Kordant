# Qualitätsstrategie, Gate-Verträge und Nachweise

## Testpyramide und Risikoabdeckung

### Produktanforderungen

Jede F-ID braucht eine nachvollziehbare AK-ID (eindeutiges beobachtbares Verhalten) und mindestens einen TEST-Identifier. Sicherheitseigenschaften brauchen eigene Negativtests, nicht nur Happy-Paths. Jede AK-ID wird einer Task-ID und später einem Commit/CI-Run zugeordnet. Keine vermeintliche Testabdeckung aus leeren Testdateien.

### Unit und Contract

Geschäftsregeln zuerst als Unit-Test; insbesondere Geldbeträge (Integer-Cent), Datums-/Zeitzonenwechsel, Rollen, Idempotenz, Parsing, Löschen, Berechtigungsgrenzen. API-Verträge mit Schema-Validierung und Fehlermeldungen. Mutationstests oder kritische Assertions stichprobenartig unabhängig überprüfen.

### Integration und E2E

Staging mit isolierten, plausiblen Fake-Daten. Teste reale Nutzerreisen: Login, Reset, MFA, Mitarbeiteranlage, Rechtewechsel, Import, Export, Billing, Abrechnungskorrektur, Account-Löschung, Offline-Sync und Schadenfälle. Konkurrierende Anfragen, Wiederholschutz und Lieferausfälle simulieren. Playwright mit reproduzierbarem Browser und echten Sicht-/Netzwerkchecks.

### Security

Secret-Suche, Dependency-Scans, SAST/DAST nach Umfang, autorisierungsbezogene API-Tests, Datenbank-RLS und Cross-Tenant-Tests. Compliance nicht allein durch Scans nachweisen.

### Design

Hallmark gegen genehmigte Tokens, Taste-Review auf echte Screens, visuelle Regression unter festen Viewports und Fonts, WCAG-2.2-orientierte Tests und manuelle Screenreader-/Keyboard-Tests. Keine Blindfreigabe geänderter Baselines.

### Resilience

Backup- und Restore-Drill, Migration mit konsistenten Daten, unerwartete Neustarts, Ausfall externer Dienste und sicheres Restart-Verhalten. Deployment-Rollback darf bei irreversiblem Datenschema-Upgrade nicht nur „alter Container“ bedeuten; oft ist Roll-forward erforderlich.

## Quality-Gates in KORDANT 0.1

| Gate | Pflichtnachweise | Was zusätzlich nötig bleibt |
|---|---|---|
| `handoff` | `source`, `review` | Vollständiges PRD, echte Entscheiderfreigabe |
| `merge` | `test`, `review` | geprüfter PR, Branch Protection, Commitbindung |
| `staging` | `test`, `review`, `build`, `security` | Tatsächlich deploytes Staging und Nutzerreise |
| `release` | obige + `privacy`, `backup`, `rollback`, `staging` | Fachliche Abnahme, CI-Provenance, Datenschutzprüfung |
| `production` | alle + `approval`, `deployment` | In V0.1 **immer BLOCKIERT**, externe echte Prüfung notwendig |

Ein nachweisführendes Local Gate kann **nicht** erkennen, ob der Bericht mit echten Daten gefüllt ist. Diese bewusste Einschränkung muss im Report stehen. Die lokale SHA-Prüfung stellt lediglich fest, ob derselbe Dateiinhalt verwendet wird.

## Agenten-Reviews

Reviewer erhält Anforderung, Diff und relevante Testlogs, aber nicht die Erfolgsbehauptung des Autors. Reviews müssen Befunde mit Datei/Zeile, Severity, Auswirkung, Reproduktion und Fixvorschlag enthalten. Der Reviewer darf „nicht prüfbar“ sagen. Testflakiness wird nicht durch bloßen erneuten grünen Lauf als geklärt gewertet: Ursache bestimmen, Test stabilisieren, mehrfache Wiederholungen dokumentieren.

## Gate-Failure-Policy

Bei fehlendem Artefakt → STOP und Grund. Bei ungültigem Hash → STOP. Bei nicht grünem Test → Task blockiert, kein Staging. Bei Security-Critical → kein Release, Repro und Fix; Risikoakzeptanz ersetzt keinen Nachweis der Behebung. Bei unklarer API-Änderung → Contract/Backwards-Compatibility prüfen. Bei widersprechenden KI-Reviews → unabhängige Messung/Fachperson, nicht Mehrheitsentscheid.

## Traceability-Vorlage

```
F-010 Dienstplan exportieren
  AK-F010-1: Export beinhaltet nur erlaubte Mandantendaten
    TEST-F010-1: Tenant B kann Export von Tenant A nicht abrufen
      TASK-xyz: serverseitige Tenantprüfung implementieren
        PR #123 -> CI Run #456 -> Image sha256:... -> Release 1.2.3
```

**Definition of Done:** Verhalten implementiert, Tests laufen im CI auf exakt dem Commit, Review behandelt Befunde, Changelog und Dokumentation stimmen, Security-/Privacy-Folgen bewertet, Infrastrukturfolgen benannt und alle offenen Risiken sichtbar.
