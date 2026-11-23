# Betrieb, Wartung und Incident Response

## Vor Inbetriebnahme

Services und Owner, genutzte Domains, technische Ansprechpartner, externe Anbieter, Datenkategorien, Service-Level-Erwartung, RTO/RPO, Backupfenster, Audit-/Retentionfristen und Notfallzugänge müssen dokumentiert sein.

## SLO (Beispiel, nicht zugesichert)

| SLI | Zielformulierung | Messung |
|---|---|---|
| API Verfügbarkeit | nur nach Businessanforderung definieren | synthetischer Check, Nutzerpfade |
| p95 Latenz | produkt- und standortabhängig | Telemetrie und Lasttest |
| Datenintegrität | kein unbemerkter Verlust akzeptierter Writes | Checkpoints, Constraints, Wiederherstellungsproben |
| Fehlerrate | zielgruppenabhängige Fehlerbudgetgrenze | 5xx und fachliche Fehler getrennt |
| Backupalter | RPO-konform | externe Snapshotliste + Alert |
| Restore | innerhalb begründetem RTO | reale Drillprotokolle |

## Monitoring-Stack

Einfacher Einstieg Uptime Kuma für HTTPS/TLS/Heartbeat, dazu OS- und Container-Metriken und strukturiertes App-Logging ohne PII. In der Ausbaustufe OpenTelemetry für korrelierbare Traces und SLOs sowie dedizierte Alerts (keine Fehlalarmflut). Verschiedene Domänen nicht gemeinsam ausfallen lassen: Externe Checks sollten außerhalb desselben VPS laufen.

## Operations-Runbooks

1. **Healthcheck rot:** Erreichbarkeit, DNS, TLS, Proxy, App-Container, Datenbank, Host-Kapazität, externe Provider prüfen. Keine ungeprüften Neustartschleifen.
2. **Login funktioniert nicht:** Zeitabweichung, Auth Provider, Session Store, Cookies, Rate Limits, Secrets/Key Rotation, relevante Logs prüfen; niemals Passwort-/Tokenwerte veröffentlichen.
3. **DB voll/gesperrt:** Schreibrate und Disk analysieren, keine manuellen Datensätze löschen, Backupstand verifizieren, Verantwortliche alarmieren.
4. **Sicherheitsvorfall:** Zugang ggf. eindämmen, Beweissicherung, betroffene Daten/Zeiträume, zuständige Datenschutzstelle, Meldungsfristen und Nutzerinformationen prüfen.
5. **Anbieter-Ausfall:** Circuit Breaker/Retry-Limits aktivieren, Queue-Idempotenz, geplante Wiederaufnahme, Nutzersignal und Kosten prüfen.
6. **Kostenalarm:** teure Endpunkte begrenzen (vorher definierte Rate/Spend Caps), Provider-Usage prüfen, Ursache dokumentieren, keine stillen Abrechnungsänderungen.

## Incident-Klassifizierung

- SEV1: Datenabfluss, destruktiver Fehler, mehrmandantige Offenlegung, Kernservice großflächig nicht nutzbar.
- SEV2: erhebliche Degradation, persistente Fehler für relevante Nutzergruppe.
- SEV3: lokaler Fehler mit Workaround.
- SEV4: kosmetisch/dokumentarisch.

Diese Einstufung ist an reale Nutzerschäden und vertragliche Pflichten anzupassen. Meldefristen folgen geltenden gesetzlichen Regeln und werden nicht von einer KI automatisch entschieden.

## Postmortem

Was ist passiert (Timeline)? Welche Erwartungen waren falsch? Welche automatisierten Tests oder Alarme haben gefehlt? Wie wurden Betroffene informiert? Welche Kontrollmaßnahmen wurden eingeführt, durch Tests nachgewiesen und mit einem Owner versehen? Kein Schuldzuweisungstheater; trotzdem klare Verantwortlichkeiten.

## Wartungsrhythmus

- Täglich: Ausfälle, Backups/Alerts, kritische Security-Events, Abrechnungsvorgänge.
- Wöchentlich: fehlerhafte Jobs, Dependency-/Imagewarnungen, Fehlerrate, Speicherwachstum, Kosten, Support-Trends.
- Monatlich: Restore-Stichprobe, Capacity Review, Vertrags-/Providerrisiken, lokale Risiken, technische Schulden.
- Quartalsweise: umfassender Restore-Drill, DR-Szenario, Security-Policy-Review, Recht/Datenschutz/Providerlisten und Architektur-Review.

Die Intervalle sind Referenzwerte; maßgeblich sind konkrete Risiko- und Verfügbarkeitsziele.
