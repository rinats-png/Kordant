import fs from 'node:fs';
import path from 'node:path';
import {now,readJsonl,writeAtomic} from './util.mjs';
import {projectSnapshot,loadTasks,event} from './state.mjs';
import {gateCheck} from './gates.mjs';
import {proposeBatch} from './scheduler.mjs';
export function projectReport(p){const s=projectSnapshot(p);const tasks=loadTasks(p);const statuses={};for(const t of tasks)statuses[t.status]=(statuses[t.status]??0)+1;
 const gates=['handoff','merge','staging','release','production'].map(g=>gateCheck(p,g));const next=proposeBatch(p);
 const lines=[`# KORDANT Projektbericht – ${s.project}`,``, `**Erstellt:** ${now()}`, `**Risikostufe:** ${s.risk}`,`**Projektart:** ${s.kind}`,
 '',`## Aufgaben`, `Gesamt: **${tasks.length}** | fertig: **${statuses.done??0}** | in Arbeit: **${statuses.in_progress??0}** | blockiert: **${statuses.blocked??0}** | ausstehend: **${statuses.pending??0}**.`,
 '',`## Bekannte Kosten`, `Budget: ${s.budget.cap} USD, erfasst: ${s.budget.spent} USD, reserviert: ${s.budget.reserved} USD.`, `**Externe unbekannte Kosten:** ${s.budget.unknownUsage?'Möglich – vollständige Providerverbrauchskontrolle nicht verfügbar.':'Trotz erfasster Buchungen separat prüfen.'}`,
 '',`## Geprüfte lokale Gate-Struktur`,'| Gate | Ergebnis | Fehlende Nachweistypen | Einschränkungen |','|---|---|---|---|',...gates.map(g=>`| ${g.gate} | ${g.passed?'strukturell bestanden':'BLOCKIERT'} | ${g.missingEvidence.join(', ')||'–'} | ${g.problems.join('; ')||'fachliche Prüfung ausstehend'} |`),
 '',`## Nächste konfliktarme Aufgaben`,...next.batch.map(t=>`- ${t.id}: ${t.title} (${t.agent}, ${t.skill})`),...(next.batch.length?[]:['- Keine konfliktfreien Aufgaben verfügbar.']),
 '',`## Offene Risiken`, '- Projektzustand und Belegtexte sind lokal nicht kryptografisch signiert.', '- KORDANT hat keine Live-Serverprüfung und keine vollständige Providerkosten-Abrechnung durchgeführt.', '- Externe Fach-/Rechtsprüfungen und reale Staging-/Produktionsabnahmen müssen außerhalb des Systems erfolgen.',
 '',`## Ereignis- und Evidenzjournal`, `Ereignisse: ${s.events}; Nachweise: ${s.evidenceCount}.`,
 '',`## Interpretation`, 'Dies ist ein reproduzierbarer **lokaler Arbeitsstandsbericht**, keine unabhängige Zertifizierung oder Produktionsfreigabe.'];
 const file=path.join(p.dir,'reports',`project-report-${new Date().toISOString().slice(0,10)}.md`);writeAtomic(file,lines.join('\n')+'\n');event(p,'report.generated',{file:path.relative(p.root,file)});return {file,summary:statuses,gates:gates.map(g=>({gate:g.gate,passed:g.passed}))};}
