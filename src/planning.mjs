import fs from 'node:fs';
import path from 'node:path';
import {now,writeAtomic,exists,readJson,slug} from './util.mjs';
import {event,withMutation} from './state.mjs';
// Original KORDANT offline phase skeleton. The optional idea-to-app module provides richer guides.
export const phases=[
['00','Start und Profil','Projekt, Betreiber, Plattformen, Risikostufe, Budget und Entscheidungsmodus'],
['01','Problem und Produktidee','Nutzerproblem, Erfolgskriterium, Lösungsabgrenzung, Gegenhypothese'],
['02','Validierung und Stop-Kriterien','Kritische Annahmen, günstigster Belegtest, Abbruchpunkt'],
['03','Zielgruppen und Rollen','Personas, JTBD, Betroffene, Berechtigungsrollen'],
['04','Markt und Konkurrenz','Alternativen, belegte Differenzierung, Markt- und Markenrisiko'],
['05','MVP Scope','Muss/Soll/Später/Nie, Funktions-IDs und Nutzen-Aufwand'],
['06','Flows und Zustände','Happy Path, Missbrauch, Fehler, Leer, Lade, Offline, Sperre'],
['07','Screens und Navigation','Screenliste, Informationsarchitektur, Sichtbarkeit nach Rollen'],
['08','Wireframes und Prototyp','Klickbare Abläufe, Variantenvergleich, konkrete Nutzerabnahme'],
['09','Designsystem','Hallmark-Richtung, Tokens, Komponenten, Taste Review'],
['10','Barrierefreiheit und Lokalisierung','WCAG 2.2, Sprache, Zeit und Formate'],
['11','Daten und Lebenszyklus','Datenkatalog, Klassen, Speicher, Aufbewahrung, Löschung'],
['12','Rollen und Rechte','Matrix von Subjekt/Aktion/Ressource und negative Rechtefälle'],
['13','Stack und Architektur','ADR, Build-or-Buy, C4, Skalierung, Trust Boundaries'],
['14','Bedrohungsmodell','Assets, Bedrohungen, Gegenmaßnahmen, ASVS-Tests'],
['15','Login Zahlung und Fremddienste','Provider, MFA, Billing, Webhooks, KI-Gateways, DPAs'],
['16','Recht Datenschutz und Verträge','DSGVO, Branchenpflicht, KI-VO, Lizenz und Verträge'],
['17','Preise Kosten und FinOps','Variable Kosten, Deckungsbeitrag, Providerbudgets, Break-even'],
['18','Qualitätsziele','SLO, Performance, Datenvolumen, Ausfallsicherheit, Zeitzonen'],
['19','Prüfstrategie','Tests, F-AK-Test-Ketten, E2E, Security, Accessibility'],
['20','Betrieb und Migration','VPS, DNS, TLS, Backups, RPO, RTO, Monitoring, Rollback'],
['21','Roadmap und Aufgaben','Meilensteine, Abhängigkeiten, Aufwand, Risiken, Agentenzuordnung'],
['22','Umsetzungshandoff','AGENTS.md, Build-Prompts, Prüfkriterien, offene Risiken'],
['23','Go-live und Abnahme','CI, Artifact, Staging, externe Prüfung, Freigaben'],
['24','Lernen und Wartung','Nutzerfeedback, Wartungs- und Kosten-KPIs, Security-Updates']
];
export const litePhases=new Set(['00','01','03','05','06','08','11','13','14','21','22']);
export function planRoot(p){return path.join(p.root,'docs','kordant-planning');}
export function scaffold(p,{mode='full'}={}){
 if(!['full','lite'].includes(mode))throw new Error('mode muss full oder lite sein');
 return withMutation(p,()=>{
 const dest=planRoot(p);if(exists(path.join(dest,'PLAN_STATE.json')))throw new Error('Plan ist bereits vorhanden – keine Überschreibung');
 fs.mkdirSync(dest,{recursive:true});const selected=phases.filter(([id])=>mode==='full'||litePhases.has(id));
 for(const [id,title,guide] of selected){const file=path.join(dest,`${id}-${slug(title)}.md`);
 const content=`# ${id} · ${title}\n\n**Status:** OFFEN\n**Projekt:** ${p.config.name}\n**Risikostufe:** ${p.config.risk}\n\n## Ziel und Fragen\n${guide}.\n\n## Verbindliche Festlegungen\n[OFFEN: Vom Betreiber oder validierter Quelle begründet ausfüllen]\n\n## Alternativen und Auswirkungen\n[OFFEN: Mindestens eine Alternative oder N/A mit Begründung]\n\n## Risiken, Missbrauch, Datenschutz, Kosten\n[OFFEN: Prüffragen für diese Phase]\n\n## Messbare Akzeptanzkriterien / Nachweise\n[OFFEN: konkrete Dokument-/Test-IDs, Quellen oder Prototyp]\n\n## Entscheidung / Abnahme\n[OFFEN: Owner, Entscheidung und Datum]\n`;
 writeAtomic(file,content);
 }
 for(const [name,content] of Object.entries({
  'ENTSCHEIDUNGEN.md':'# Entscheidungen\n\n| ID | Datum | Entscheidung | Gründe | Alternative | Owner | Status |\n|---|---|---|---|---|---|---|\n',
  'ANNAHMEN.md':'# Annahmen\n\n| ID | Aussage | Risiko | Validierung | Owner | Status |\n|---|---|---|---|---|---|\n',
  'QUELLEN.md':'# Quellen und Stand\n\n| Q-ID | Behauptung | Quelle/Datum | Prüfdatum | Qualität |\n|---|---|---|---|---|\n',
  'RISIKEN.md':'# Risiken\n\n| ID | Asset | Bedrohung/Impact | Wahrscheinlichkeit | Maßnahme | Test | Restrisiko |\n|---|---|---|---|---|---|---|\n',
  'TRACEABILITY.md':'# Traceability\n\n| Funktion F-ID | Kriterium AK-ID | Test TEST-ID | Task-ID | Commit | CI/Artefakt | Release |\n|---|---|---|---|---|---|---|\n'
 }))writeAtomic(path.join(dest,name),content);
 writeAtomic(path.join(dest,'PLAN_STATE.json'),{schemaVersion:1,mode,createdAt:now(),source:'kordant-bundled',status:'DRAFT',phases:selected.map(([id,title])=>({id,title,status:'open'}))});
 event(p,'planning.scaffolded',{mode,count:selected.length});return {path:dest,phaseCount:selected.length,mode,note:'Offline-Grundgerüst; idea-to-app liefert zusätzliche detaillierte Phaseninhalte.'};});
}
export function planStatus(p){const dest=planRoot(p);const state=readJson(path.join(dest,'PLAN_STATE.json'));if(!state)throw new Error('Kein Plan vorhanden. kordant plan scaffold');const records=state.phases.map(x=>{const prefix=x.id+'-';const file=fs.readdirSync(dest).find(f=>f.startsWith(prefix)&&f.endsWith('.md'));if(!file)return {...x,status:'missing',openMarkers:null};const s=fs.readFileSync(path.join(dest,file),'utf8');const markers=(s.match(/\[OFFEN:/g)||[]).length;return {...x,file,status:markers>0?'draft':'filled',openMarkers:markers};});return {source:state.source,mode:state.mode,phaseCount:records.length,filled:records.filter(x=>x.status==='filled').length,records};}
export function handoff(p,{draft=false}={}){
 const status=planStatus(p);const missing=status.records.filter(x=>x.status!=='filled');if(missing.length&&!draft)throw new Error(`Handoff nicht freigabefähig: ${missing.length} Phasen offen. Nur mit --draft erzeugen, niemals direkt als freigegeben umsetzen.`);
 const dest=path.join(planRoot(p),'handoff');fs.mkdirSync(dest,{recursive:true});const source=planRoot(p);
 const content=`# KORDANT Handoff – ${p.config.name}\n\n**Status:** ${missing.length?'DRAFT – NICHT ZUR FREIGABE':'STRUKTURELL AUSGEFÜLLT – INHALTLICHE PRÜFUNG AUSSTEHEND'}\n**Erzeugt:** ${now()}\n**Risikostufe:** ${p.config.risk}\n\n## Entscheidungsquelle\nPlanphase und Entscheidungsdateien unter docs/kordant-planning.\n\n## Phasenstand\n${status.records.map(x=>`- ${x.id} ${x.title}: ${x.status}`).join('\n')}\n\n## Sicherheitsregeln\nKeine Produktionsänderung; keine echten Secrets; serverseitige Autorisierung; technische Tests + unabhängige Reviews; Migration erst mit Restore. Bei Widerspruch STOP und Owner befragen.\n\n## Einschränkung\nAutomatisches Ausfüllen beweist keine fachliche Korrektheit. idea-to-app-Handoff und separate Prüfungen sind empfohlen.\n`;
 writeAtomic(path.join(dest,'AGENTS.md'),content);writeAtomic(path.join(dest,'START_PROMPT.md'),`# Build-Start\n\nLies docs/kordant-planning/handoff/AGENTS.md und alle ausgefüllten relevanten Phasen. Erst Fehlstellen melden und Risiko erklären; dann mit dem kleinsten TDD-Feature beginnen. Kein Produktionszugriff.\n`);
 event(p,'planning.handoff',{draft:missing.length>0,missing:missing.length});return {path:dest,draft:missing.length>0,missing:missing.map(x=>x.id),note:'Dokumentations-Handoff, kein Security- oder Produktfreigabenachweis'};
}
