# Evaluationsprogramm für Agenten, Skills und Softwarequalität

## Ziel

Nicht die Zahl der gestarteten KI-Agenten zählt, sondern die **erfolgreiche Produktänderung** bei nachvollziehbaren Kosten, minimalem Nacharbeitsaufwand und ohne Sicherheitsverschlechterung.

## Testkorpus

| Testgruppe | 5–20 repräsentative Fälle | Zu prüfende Risiken |
|---|---|---|
| Feature/TDD | UI-Form, API-Validierung, DB-Transaktion, Fileimport | fehlende Negativfälle, unpassende Scope-Ausweitung |
| Bugfix | typischer Regression, Flaky Test, Race, falsche Zeitzone | Pseudo-Fix ohne Ursache |
| Security | IDOR, Cross-Tenant, Reset, Upload, untrusted URLs | unberechtigte Datenfreigabe |
| Design | Landing, Dashboard, Tabelle, Mobile, Dark Mode | generische KI-UI, Kontrastprobleme, falsche Prioritäten |
| Infrastructure | Dockerfile, Caddy, TLS, DNS, Backup, Migration | zerstörerische Befehle, Datenverlust, false green |
| Compliance | Löschanfrage, AVV, DSFA-Auslöser, Anbieterwechsel | erfundene Rechtsbehauptungen |
| KI | RAG ACL, Injection, Tokenlimit, Tool-Missbrauch | Datenexfiltration, Kostenexplosion |

## Evaluationsmethode

1. Repräsentative eigene Aufgaben mit festem Input, sicherer Testumgebung und deterministischem Testoracle definieren.
2. „Blind“-Bewertung der Ergebnisse: Vollständigkeit, Architektur, Tests, Security, Design, Rework, Zeit und reale Providerkosten.
3. Varianten mit identischen Aufgaben vergleichen: Einzelagent vs. zwei Autoren, günstiges vs. starkes Modell, mit und ohne vorgeladenes Skill, lange vs. gezielte Kontexte.
4. Nicht erfolgreiche Runs einschließlich Abbrüche, Retry-Limits und manueller Korrekturen erfassen. Kein Cherry Picking.
5. Ergebnisse als Regression-Suite versionieren; nach Updates an Skills/Modellen neu evaluieren.

## Scorecard (Beispiel)

| Dimension | Gewicht (Beispiel) | Operationalisierung |
|---|---|---|
| Akzeptanzkriterien | 30% | unabhängige fachliche Tests |
| Sicherheit/Daten | 25% | Negativtests, Prüfbericht |
| Wartbarkeit | 15% | Diffs, Verträge, Regressionsrisiko |
| Bedienbarkeit/Design | 10% | definierte Nutzertests, A11y |
| Kosten | 10% | echte Token/API/CI- und Reviewkosten |
| Geschwindigkeit | 10% | End-to-End Lead Time bis akzeptierte Task |

Gewichte müssen risikobasiert verändert werden. Für sensible Daten gilt ein Security-Mindestgate unabhängig vom Gesamtscore.

## Benchmark-Artefakte

- `evals/<case-id>/requirements.md`
- `evals/<case-id>/fixture/`
- `evals/<case-id>/tests/`
- `evals/<case-id>/baseline.json`
- `evals/<case-id>/run-<provider-version>.json`
- `evals/<case-id>/review.md`

Automatische Evaluierung verschiedener Provider ist Roadmap P1/P2, nicht Bestandteil von KORDANT 0.1.
