import fs from 'node:fs';
import path from 'node:path';
import {now} from './util.mjs';
import {loadTasks,saveTasks,event,withMutation} from './state.mjs';

/** Reconcile abandoned local task claims: require operator intervention, never silently retry writes. */
export function inspectRecovery(p,{maxAgeMinutes=60}={}){
 const age=Number(maxAgeMinutes);if(!Number.isInteger(age)||age<1||age>10080)throw new Error('Grenze 1–10080 Minuten');const threshold=Date.now()-age*60_000;
 const stale=loadTasks(p).filter(t=>t.status==='in_progress' && (!t.claimedAt||Date.parse(t.claimedAt)<threshold));
 const lock=path.join(p.dir,'.write.lock');return {staleTasks:stale.map(t=>({id:t.id,title:t.title,claimedAt:t.claimedAt})),writeLockExists:fs.existsSync(lock),recovered:false,note:'Vor Recovery verifizieren, dass kein Agent/Prozess mehr schreibt. Automatisches Retry ist absichtlich verboten.'};
}
export function blockStaleTask(p,id,{maxAgeMinutes=60,operator}={}){
 if(!operator||String(operator).length<3)throw new Error('Verantwortlicher Operator erforderlich');const inspection=inspectRecovery(p,{maxAgeMinutes});if(inspection.writeLockExists)throw new Error('Schreiblock vorhanden; zuerst Prozesszustand prüfen');if(!inspection.staleTasks.some(t=>t.id===id))throw new Error('Kein veralteter Task');
 return withMutation(p,()=>{const tasks=loadTasks(p);const t=tasks.find(x=>x.id===id);if(t.status!=='in_progress')throw new Error('Task hat Zustand geändert');t.status='blocked';t.blockReason=`Stale claim; manual recovery by ${operator} at ${now()}`;saveTasks(p,tasks);event(p,'task.recovered_blocked',{id,operator});return t;});
}
