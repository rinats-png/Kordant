# FinOps für Agentic Engineering und SaaS

## 1. Kostenmodell

Gesamtkosten = KI-Token + Tools/API + CI/Build/Registry + Server/DB/Netzwerk/Storage + Backups/Monitoring + menschliche Reviewzeit + Wiederholungsarbeit + kommerzielle Transaktionsgebühren. Eine bloße Tokenstatistik ist kein Gesamt-ROI.

**Kernkennzahl:** Vollständig akzeptierte, getestete Change-Sets je Euro Gesamtkosten und je Woche.

## 2. Modellrouting

- Niedriges Risiko, kurze Aufgaben, klare Kriterien → günstiges schnelles Modell mit Tests.
- Architektur, Mandantentrennung, Zahlungslogik, Datenschutz, Migration → stärkeres Reasoning und unabhängiger Review.
- Designs: führender Hallmark-Durchlauf, separater Taste-Check nur bei relevanter UI-Arbeit.
- QA: deterministic tests zuerst; KI nur für Ursachenanalyse, neue Testideen und Review.
- Unklarheit: erst Spezifikation, dann Coding; sonst Tokenverbrauch durch Fehlimplementierungen.

Die tatsächliche Modellwahl ist eine **Hypothese**, die anhand von evaluierten Ergebnissen zu prüfen ist. KORDANT gibt keine erfundenen aktuellen Tokenpreise aus.

## 3. Budgetregeln

1. Budget in USD pro Projekt/Feature und pro Provider festlegen, daneben erwartete menschliche Arbeitszeit.
2. Ein Arbeitsauftrag erhält `maxTokens`, `maxAttempts`, `timeout`, `estimatedUSD`, `maxCostUSD` und Eskalationsgrenze.
3. Vor Start Reservierung buchen; bei Fehlern nicht automatisch unbegrenzt neu starten.
4. Nach Lauf tatsächlichen Usage-/Billingwert buchen; wenn Kosten fehlen, `UNKNOWN`, kein vorgetäuschtes Grün.
5. Keine Überschreitung durch neue Aufgaben. Bereits aufgelaufene echte Kosten **müssen weiterhin erfasst werden**, selbst wenn das Budget überschritten wurde.
6. Bei Provider ohne harte Caps tägliche externe Preis-/Usagekontrolle und explizite Entscheidung über das Kostenrisiko.

## 4. Kontextstrategie

Eine zentrale Chat-Historie mit Hunderttausenden Tokens ist ineffizient und fehleranfällig. Stattdessen Task-Diff + aktuell relevante Schnittstellen + PRD-Auszug + Security-Policy + vorherige Bugs. Repositorystruktur und Symbolsuche ohne Volltextkopien; die richtige Kontextmenge durch Evaluierung messen.

## 5. Parallelisierung

Maximal so viele Schreibagenten wie wirklich disjunkte Arbeitspakete. Worktrees, Scope-Locks, unabhängige Prüfungen. Bei oft denselben Dateien und großen Refactorings lieber seriell. Die optimale Anzahl basiert auf tatsächlicher Integrations- und Review-Rework-Rate, nicht einer pauschalen Zahl.

## 6. Messblätter

| Messgröße | Definition |
|---|---|
| Kosten / akz. Task | Summe echte Kosten / abgeschlossene und geprüfte Task |
| Rework | nach Review erneut bearbeitete Task-zeit / Gesamtzeit |
| Pass Rate | abgenommene Features / begonnene Features |
| CI Flake | instabile Tests / CI-Runs |
| Lead Time | Ticketstart bis produktive Bereitstellung |
| Review-Zyklen | Bewertungen je Change Set |
| MTTR | Zeit bis wiederhergestellter Betrieb |
| AI Hallucination | nicht belegte technische Behauptungen / Reviews |

## 7. Schwellenwert-Protokoll

```
Feature-Budget: 12 USD
Stufe A: <60% → normal
Stufe B: 60–85% → keine zusätzliche agentische Parallelisierung
Stufe C: 85–100% → nur priorisierte Restaufgaben
Stufe D: >100% → keine neuen Starts; tatsächliche bisherige Kosten trotzdem erfassen
```

Dies ist eine **Beispiel-Policy** und nicht technisch an die Provider-Abrechnung gekoppelt. Die aktuelle CLI unterstützt Kostenbuchung und Reservierung, aber nicht automatische Online-Abrechnung oder garantierte harte Providerlimits.
