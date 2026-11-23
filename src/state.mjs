import fs from 'node:fs';
import path from 'node:path';
import {appendJsonl,exists,mkdir,now,readJson,readJsonl,slug,stableId,within,writeAtomic} from './util.mjs';

export function projectPaths(base=process.cwd()) {
 const root=path.resolve(base);
 const dir=path.join(root,'.kordant');
 return {root,dir,config:path.join(dir,'project.json'),tasks:path.join(dir,'tasks.json'),events:path.join(dir,'events.jsonl'),evidence:path.join(dir,'evidence.jsonl'),approvals:path.join(dir,'approvals.jsonl'),runs:path.join(dir,'runs.jsonl')};
}
export function isProject(base) {return exists(projectPaths(base).config);}
export function loadProject(base) {const p=projectPaths(base);const config=readJson(p.config);if(!config)throw new Error(`Kein KORDANT-Projekt in ${p.root}. Zuerst: kordant init`);return {...p,configFile:p.config,config};}
export function initialize(base,{name='Neues Produkt',kind='web',risk=2,budget=20,existing=false}={}) {
 const p=projectPaths(base);if(exists(p.config))throw new Error('Projekt ist bereits initialisiert. Bestehende Daten werden nicht überschrieben.');
 if(![1,2,3].includes(Number(risk)))throw new Error('Risikostufe muss 1, 2 oder 3 sein.');
 if(!Number.isFinite(Number(budget)) || Number(budget)<0)throw new Error('Budget muss nichtnegativ und numerisch sein.');
 mkdir(p.root);mkdir(p.dir);mkdir(path.join(p.dir,'prompts'));mkdir(path.join(p.dir,'reports'));mkdir(path.join(p.dir,'runs'));
 const config={schemaVersion:1,id:slug(name),name,kind,risk:Number(risk),existing,createdAt:now(),currency:'USD',budget:{cap:Number(budget),spent:0,reserved:0,unknownUsage:true},policies:{maxConcurrentWriters:2,requireReview:true,requireTests:true,allowExternalAgents:false,allowProductionMutation:false,allowThirdPartyScripts:false},providers:{default:'manual',allowed:['manual','codex','claude-readonly']},source:{ideaToAppCommit:'00dc23b8f3a20a829f07bd3b7411d6b7a0e12bda'}};
 writeAtomic(p.config,config);writeAtomic(p.tasks,{schemaVersion:1,tasks:[]});
 appendJsonl(p.events,{id:stableId('EV'),at:now(),type:'project.initialized',data:{name,kind,risk,existing}});
 return {path:p.root,config};
}
export function loadTasks(p){return readJson(p.tasks,{schemaVersion:1,tasks:[]}).tasks;}
export function saveTasks(p,tasks){writeAtomic(p.tasks,{schemaVersion:1,tasks});}
export function event(p,type,data={}){appendJsonl(p.events,{id:stableId('EV'),at:now(),type,data});}
export function projectSnapshot(p){const tasks=loadTasks(p);const evidence=readJsonl(p.evidence);return {project:p.config.name,risk:p.config.risk,kind:p.config.kind,budget:p.config.budget,tasks:tasks.map(t=>({id:t.id,title:t.title,status:t.status,agent:t.agent,scope:t.scope,dependsOn:t.dependsOn})),evidenceCount:evidence.length,events:readJsonl(p.events).length};}
export function withMutation(p,fn){
 const lock=path.join(p.dir,'.write.lock');let fd;
 try{fd=fs.openSync(lock,'wx',0o600);fs.writeFileSync(fd,`${process.pid} ${now()}\n`);return fn();}
 catch(e){if(e.code==='EEXIST')throw new Error(`Projekt wird bereits bearbeitet: ${lock}. Sperre nur nach Prüfung des anderen Prozesses entfernen.`);throw e;}
 finally{if(fd!==undefined){fs.closeSync(fd);fs.rmSync(lock,{force:true});}}
}
