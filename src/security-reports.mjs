import fs from 'node:fs';
import path from 'node:path';
import {writeAtomic,readJson,now} from './util.mjs';
import {event,withMutation} from './state.mjs';

const SEVERITIES={critical:4,high:3,medium:2,low:1,info:0};
/** Normalize externally generated SARIF JSON. Never mark scanner output as independently trusted. */
export function evaluateSarif(p,file,{blockAt='high'}={}){
 if(!Object.hasOwn(SEVERITIES,blockAt))throw new Error('Ungültige Schweregradgrenze');const input=readJson(path.resolve(file));if(!input||!Array.isArray(input.runs))throw new Error('Ungültiges SARIF-Format');const findings=[];
 for(const run of input.runs){if(!Array.isArray(run.results))continue;for(const r of run.results){const level=String(r.level??'warning');const severity=({error:'high',warning:'medium',note:'low',none:'info'})[level]??'medium';findings.push({ruleId:String(r.ruleId??'unknown').slice(0,200),severity,message:String(r.message?.text??'').slice(0,600),location:String(r.locations?.[0]?.physicalLocation?.artifactLocation?.uri??'unknown').slice(0,400)});}}
 const blocking=findings.filter(f=>SEVERITIES[f.severity]>=SEVERITIES[blockAt]);const report={schemaVersion:1,at:now(),source:path.basename(file),untrustedScannerOutput:true,count:findings.length,blocking: blocking.length,blockingAt:blockAt,pass:!blocking.length,findings,notice:'Schweregrad ist eine SARIF-Level-Heuristik; Toolversion, Scannerauthentizität, Scope und tatsächliche Behebung nicht bestätigt.'};
 return withMutation(p,()=>{const target=path.join(p.dir,'reports',`sarif-${Date.now()}.json`);writeAtomic(target,report);event(p,'security.sarif.imported',{blocking:blocking.length,findings:findings.length});return {file:target,report};});
}
