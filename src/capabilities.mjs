import fs from 'node:fs';
import path from 'node:path';
import {ROOT,readJson} from './util.mjs';

const POLICY=readJson(path.join(ROOT,'policies','actions.json'));
/** No prompted approval can expand a tool's capabilities. This checks policy, not OS sandbox enforcement. */
export function assessAction(action,{projectConfig,scope=[],environment='development',actor='agent',operatorVerified=false,sandboxVerified=false}={}){
 const rule=POLICY.capabilities?.[action];if(!rule)return {allowed:false,reason:'Unknown action: default deny'};
 if(action==='repo.read' && environment!=='production')return {allowed:true,reason:'Local read only; repository content is untrusted data'};
 if(actor==='agent'&&['production.deploy','production.delete','dns.modify','database.schema.production','billing.modify','secrets.read'].includes(action))return {allowed:false,reason:'Agent cannot approve privileged actions'};
 if(environment==='production'&&(!operatorVerified||!sandboxVerified))return {allowed:false,reason:'Production requires external operator identity and tested isolation'};
 if(action==='repo.write' && scope.length>0 && sandboxVerified && projectConfig?.policies?.allowExternalAgents===true && environment==='development')return {allowed:true,reason:'Restricted to externally enforced sandbox and approved scope'};
 return {allowed:false,reason:`Denied by capability policy: ${rule.requires??'owner approval'}. Documentation alone is not enforcement.`};
}
