import fs from 'node:fs';
import path from 'node:path';
import {readJsonl,readJson,ROOT,now,appendJsonl,stableId,sha256,within} from './util.mjs';
import {event,loadTasks,withMutation} from './state.mjs';

const gateRequirements=readJson(path.join(ROOT,'policies','evidence.json')).gates;
export function gateCheck(p,gate){if(!Object.hasOwn(gateRequirements,gate))throw new Error(`Unbekanntes Gate. Verfügbar: ${Object.keys(gateRequirements).join(', ')}`);
 const evidence=readJsonl(p.evidence);const tasks=loadTasks(p);const types=new Set(evidence.map(e=>e.type));const missing=gateRequirements[gate].filter(x=>!types.has(x));const problems=[];
 if(['merge','staging','release','production'].includes(gate)&&tasks.some(t=>['blocked','in_progress'].includes(t.status)))problems.push('Blockierte oder laufende Aufgaben vorhanden');
 if(['release','production'].includes(gate)&&tasks.some(t=>t.status!=='done'&&t.status!=='cancelled'))problems.push('Nicht abgeschlossene Aufgaben vorhanden');
 for(const e of evidence){try{const file=within(p.root,e.file);if(!fs.existsSync(file)||sha256(fs.readFileSync(file))!==e.sha256)problems.push(`Nachweis veraltet: ${e.id}`);}catch{problems.push(`Nachweis nicht verifizierbar: ${e.id}`);}}
 if(gate==='production') {problems.push('Produktionsfreigabe ist ausschließlich als dokumentierte Vorprüfung verfügbar; externe Identitäts-, Infrastruktur- und Datenschutzprüfung nötig');}
 if(p.config.risk===3&&['release','production'].includes(gate))problems.push('Risikostufe 3 erfordert externe Fachprüfung und verbindliche Rechtsprüfung; eine lokale Datei ersetzt dies nicht');
 return {gate,passed:missing.length===0&&problems.length===0,missingEvidence:missing,problems,checkedAt:now(),evidenceCount:evidence.length,notice:'Strukturgate: fachliche Korrektheit, echte Identität und Live-Zustand sind hier nicht garantiert.'};
}
export function approvalRecord(p,{gate,by,reason,file}){if(!by||!reason)throw new Error('Freigabe benötigt Bezeichner und Begründung');return withMutation(p,()=>{const record={id:stableId('APR'),gate,by:String(by).slice(0,120),reason:String(reason).slice(0,1000),at:now(),selfAttested:true,externalVerification:false,attachment:file??null};appendJsonl(p.approvals,record);event(p,'approval.recorded',{gate,by,verified:false});return record;});}
