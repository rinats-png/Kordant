# KORDANT Designsystem-Workflow: Hallmark führt, Taste überprüft

## Prinzip

Gutes Produktdesign entsteht nicht dadurch, dass zwei KI-Skills unabhängig Farben und Buttons erfinden. Die **Marke, Informationsarchitektur und die Aufgabe des Nutzers** stehen vor visuellen Trends. Hallmark führt das Designsystem; Taste Skill erzeugt ein getrenntes kreatives Review. Kein unerklärter Austausch der Designsprache während Feature-Implementierung.

## Design-Phasen

1. **Discovery:** Ziele je Rolle, 3–5 reale Kernaufgaben, vorhandenes Material, Markenwerte, Nutzerkompetenz und Einsatzkontext.
2. **IA/Flows:** Navigationshierarchie, Fehlerpfade, Ladezustände, Empty States, Genehmigungsdialoge und Offline-Verhalten.
3. **Direction:** Zwei deutlich unterschiedliche Stile mit konkretem Bezug zur Marke, kein zufälliger Stilgenerator; Nutzer entscheidet.
4. **Tokens:** Grundfarben, semantische Statusfarben, Typografie, Raster, Spacing, Border, Shadow, Motion und Breakpoints.
5. **Components:** Buttons, Formularfelder, Navigation, Tabellen, Kalender, Dialoge, Badges, Toasts, Tooltips, Picker, Uploads, Diagramme, leere Zustände und Fehleranzeigen.
6. **Screens:** Alle primären Interaktionen in Mobile, Tablet und Desktop; Form-Vollständigkeit, Tabstopps und Screenreader-Labels.
7. **Taste-Review:** Visuelle Hierarchie, rhythmische Abstände, Qualität von Datenansichten, Nutzungsdichte, Bildwelt und Animation.
8. **Rendering:** Playwright für reproduzierbare Screenshots; menschliche Kontrolle auf realen Geräten.
9. **Abnahme:** Brand, Accessibility, Performance, Design-Regression, klare Ergebnisdokumentation.

## Minimaler Tokenstandard

```json
{
  "color": {"bg":"#0c1418","surface":"#142027","text":"#eaf4ef","muted":"#9db0b5","accent":"#83dfc4","border":"#30434a","error":"#e69b93","warning":"#ebbb7f"},
  "font": {"family":"system-ui","sizes":[12,14,16,20,28,40]},
  "spacing": [4,8,12,16,24,32,48,64],
  "radius": {"sm":8,"md":12,"lg":16},
  "motion": {"defaultMs":160,"reducedMotion":true},
  "breakpoints": {"mobile":480,"tablet":760,"desktop":1200}
}
```

Farben sind **Beispielwerte**, keine universell gültigen WCAG-geprüften Kontraste. Semantische Farbpaare müssen im konkreten Design verifiziert werden.

## Visuelle Prüffragen

- Ist in drei Sekunden erkennbar, was der Nutzer hier tun soll?
- Haben alle Aktionen eindeutige Verben und sicheres Feedback (auch für Fehler)?
- Sind Überschriften und Datenansichten logisch gruppiert?
- Sind komplexe Tabellen bei kleinen Screens bedienbar, ohne kritische Werte zu verbergen?
- Sind Statusangaben ohne Farbe verständlich?
- Sind Fokuszustände, Tastaturführung und Zoom korrekt?
- Funktioniert die Ansicht bei leeren, langen und extremen Datensätzen?
- Sind Ladezeiten, Interaktionslatenz und Offline-Zustände akzeptabel?
- Gibt es unnötige Bewegung oder rein dekorative Komponenten?
- Ist das Ergebnis charakteristisch für das Produkt statt generischer KI-UI?

## Dokumente und Verzeichnisvorschlag

```
design/
  brand.md
  user-flows.md
  tokens.json
  components.md
  screenshots/
  visual-diffs/
  accessibility-audit.md
  decisions.md
```

KORDANT v0.1 kann diese Dateien als Taskbelege verwalten, aber führt Hallmark und Taste nicht eigenmächtig aus. Der mitgelieferte `node-web`-Starter zeigt eine eigene hochwertige Dashboard-Richtung ohne kopierten Drittanbieter-Code.
