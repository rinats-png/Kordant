import {loadTasks} from './state.mjs';
import {readyTasks,scopesOverlap} from './tasks.mjs';
export function proposeBatch(p,{max=p.config.policies.maxConcurrentWriters}={}){
 const limit=Number(max);if(!Number.isInteger(limit)||limit<1||limit>8)throw new Error('Maximalzahl muss 1–8 sein');
 const active=loadTasks(p).filter(t=>t.status==='in_progress');const capacity=Math.max(0,Math.min(limit,p.config.policies.maxConcurrentWriters)-active.length);
 const ready=readyTasks(p).sort((a,b)=>(b.risk??0)-(a.risk??0)||a.createdAt.localeCompare(b.createdAt));const batch=[];const excluded=[];
 for(const task of ready){if(batch.length>=capacity){excluded.push({id:task.id,reason:'Kapazitätslimit'});continue;}
  if([...active,...batch].some(x=>scopesOverlap(x.scope,task.scope))){excluded.push({id:task.id,reason:'Schreibbereich-Kollision'});continue;}
  batch.push(task);
 }
 return {capacity,totalReady:ready.length,batch:batch.map(x=>({id:x.id,title:x.title,agent:x.agent,skill:x.skill,scope:x.scope})),excluded,limits:{maxConcurrentWriters:p.config.policies.maxConcurrentWriters},executed:false,note:'Vorschlag ist kein selbsttätiger Agentenstart. Tasks müssen einzeln beansprucht werden.'};
}
