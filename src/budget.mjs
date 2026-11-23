import {appendJsonl,now,readJsonl,writeAtomic,stableId} from './util.mjs';
import {event,withMutation} from './state.mjs';

function finiteNonneg(x,label){const n=Number(x);if(!Number.isFinite(n)||n<0)throw new Error(`${label} muss nichtnegativ und endlich sein`);return n;}
export function recordCost(p,{provider,model,inputTokens,outputTokens,rateInput,rateOutput,requestId='',kind='actual'}){
 if(!provider||!model)throw new Error('Provider und Modell erforderlich');if(!['actual','adjustment'].includes(kind))throw new Error('Unbekannter Buchungstyp');
 const i=finiteNonneg(inputTokens,'Eingabetokens'),o=finiteNonneg(outputTokens,'Ausgabetokens'),ri=finiteNonneg(rateInput,'Eingabepreis'),ro=finiteNonneg(rateOutput,'Ausgabepreis');
 if(!Number.isInteger(i)||!Number.isInteger(o))throw new Error('Tokenzahlen müssen ganze Zahlen sein');
 const usd=Math.round(((i*ri+o*ro)/1_000_000)*1e6)/1e6;
 return withMutation(p,()=>{
  const records=readJsonl(p.runs).filter(r=>r.kind==='actual' || r.kind==='adjustment');
  if(requestId && records.some(r=>r.provider===provider&&r.requestId===requestId))throw new Error('Doppelte Provider-Request-ID, Kosten nicht erneut buchen');
  const cfg=p.config;cfg.budget.spent=Math.round((cfg.budget.spent+usd)*1e6)/1e6;cfg.budget.limitBreached=cfg.budget.spent+cfg.budget.reserved>cfg.budget.cap;
  writeAtomic(p.configFile,cfg);const r={id:stableId('COST'),at:now(),provider,model,inputTokens:i,outputTokens:o,rateInput:ri,rateOutput:ro,currency:'USD',usd,kind,requestId,verifiedByProvider:false};appendJsonl(p.runs,r);event(p,'cost.recorded',{id:r.id,usd});return r;
 });
}
export function routeModel({risk=2,complexity=2,type='implementation'}={}){const high=Number(risk)===3||Number(complexity)>=4||['architecture','security','review'].includes(type);return {tier:high?'high-reasoning':'efficient',why:high?'Hohe Auswirkungen oder komplexe Entscheidung':'Abgegrenzte Routinearbeit',provider:'Nicht festgelegt',note:'Kein reales Preismodell; Preise und tatsächliche Leistung vor Einsatz messen'};}
export function reserveCost(p,amount,reason=''){const usd=finiteNonneg(amount,'Reservierung');if(usd<=0)throw new Error('Positive Reservierung erforderlich');return withMutation(p,()=>{const cfg=p.config;if(cfg.budget.spent+cfg.budget.reserved+usd>cfg.budget.cap)throw new Error('Budgetlimit überschritten');cfg.budget.reserved=Math.round((cfg.budget.reserved+usd)*1e6)/1e6;writeAtomic(p.configFile,cfg);const r={id:stableId('RSV'),at:now(),usd,reason,kind:'reserve'};appendJsonl(p.runs,r);event(p,'cost.reserved',r);return r;});}
export function releaseCost(p,amount){const usd=finiteNonneg(amount,'Freigabe');if(usd<=0)throw new Error('Positive Zahl erforderlich');return withMutation(p,()=>{const cfg=p.config;if(cfg.budget.reserved<usd)throw new Error('Reservierung zu klein');cfg.budget.reserved=Math.round((cfg.budget.reserved-usd)*1e6)/1e6;writeAtomic(p.configFile,cfg);event(p,'cost.released',{usd});return cfg.budget;});}
