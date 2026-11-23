import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createPrompt} from './prompts.mjs';
import {appendJsonl,now,safeText,stableId,writeAtomic} from './util.mjs';
import {event,loadTasks,withMutation} from './state.mjs';

export function providerAvailability(){return ['codex','claude'].map(command=>{const r=spawnSync(process.platform==='win32'?'where':'which',[command],{encoding:'utf8',timeout:5000});return {command,installed:r.status===0};});}
export function runAgent(p,id,{provider='manual',execute=false,timeoutSeconds=900,acceptUnmeteredCost=false}={}) {
 const task=loadTasks(p).find(t=>t.id===id);if(!task)throw new Error('Aufgabe nicht gefunden');
 const prompt=createPrompt(p,id);
 if(!execute||provider==='manual')return {mode:'prepared-only',file:prompt.file,provider,executed:false,why:'Externe Agenten werden nie ohne --execute ausgeführt.'};
 if(!p.config.policies.allowExternalAgents)throw new Error('Agentenausführung in Policy deaktiviert. Erst Projekt-Policy bearbeiten und Risiko verstehen.');
 if(!p.config.providers.allowed.includes(provider))throw new Error('Provider nicht für dieses Projekt freigegeben.');
 if(task.status!=='in_progress')throw new Error('Agent-Ausführung nur bei beanspruchter Aufgabe');
 if(p.config.budget.limitBreached || p.config.budget.spent>=p.config.budget.cap)throw new Error('Bekanntes Kostenbudget erschöpft.');
 if(!acceptUnmeteredCost)throw new Error('Externe Providerkosten sind hier nicht technisch gedeckelt. Für bewusste Ausnahme: --accept-unmetered-cost. Kosten separat überwachen.');
 if(Number(timeoutSeconds)>1800||Number(timeoutSeconds)<1)throw new Error('Timeout muss zwischen 1 und 1800 Sekunden liegen');
 const content=fs.readFileSync(prompt.file,'utf8');let command,args;
 if(provider==='codex') {command='codex';args=['exec','--sandbox','workspace-write','--ephemeral','-'];}
 else if(provider==='claude-readonly'){command='claude';args=['-p','--permission-mode','plan'];}
 else throw new Error('Provider nicht implementiert');
 // This restricts KORDANT orchestration, but isolation remains a responsibility of the provider's sandbox.
 const safeEnv={PATH:process.env.PATH??'',HOME:process.env.HOME??'',LANG:process.env.LANG??'C.UTF-8',TERM:'dumb'};
 const started=Date.now();const runId=stableId('RUN');const r=spawnSync(command,args,{cwd:p.root,input:content,encoding:'utf8',timeout:Number(timeoutSeconds)*1000,maxBuffer:2*1024*1024,env:safeEnv});
 const report={runId,taskId:id,at:now(),provider,exitCode:r.status,signal:r.signal,elapsedMs:Date.now()-started,stdout:safeText(r.stdout??'',12000),stderr:safeText(r.stderr??r.error?.message??'',3000),sandboxAssurance:'Provider-specific; not independently verified by KORDANT',usage:'unknown'};
 const file=path.join(p.dir,'runs',`${runId}.json`);writeAtomic(file,report);event(p,'agent.executed',{runId,id,provider,status:r.status});return {runId,exitCode:r.status,file,usage:'unknown',note:'Das Ergebnis ist kein Nachweis erfolgreicher Tests oder unabhängiger Prüfung.'};
}
