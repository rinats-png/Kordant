# KORDANT 0.3.1 — Anbieterneutrale Defaults

- Aktive `new-product`- und `release`-Workflows verwenden `provider-agnostic-deploy`, nicht mehr die Legacy-IONOS-Vorlage.
- Kataloggenerator erzeugt dieselbe Anbieterunabhängigkeit; Legacy-Dokumentation bleibt ausschließlich als optionaler Adapter bestehen.
- `deploy plan` und `migrate plan` akzeptieren frei wählbare `--vendor`-Kennungen getrennt vom technischen Plattformtyp.
- Lesender CLI-Validator `platform list|inspect` ermöglicht eigene JSON-Providerprofile ohne Ausführung von Fremdcode oder Speicherung von Zugangsdaten.
- Nutzerdokumentation, Masterprompt und Self-Build-Auftrag sind anbieterneutral.
- Neue Regressionstests erzwingen dies bei CI-Änderungen.

**Nicht enthalten:** echte API-Anbindung an einen Cloud- oder Hostinganbieter, Production-Runner mit technischer Sandbox und nachweisbare Kostenlimits. Diese Komponenten benötigen separate Integrations-, Security- und Stagingnachweise.
