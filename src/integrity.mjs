import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {now,sha256,readJsonl,writeAtomic} from './util.mjs';
import {event,withMutation} from './state.mjs';

const ALG='sha256';
function canonical(value){if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;if(value!==null&&typeof value==='object')return `{${Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')}}`;return JSON.stringify(value);}
export function journalDigest(entries){let previous='0'.repeat(64);return entries.map((record,index)=>{const digest=sha256(previous+'\n'+canonical(record));const result={index: index+1,previous,digest};previous=digest;return result;});}
/** HMAC only if an operator independently manages the key. Never store it in the project. */
export function sealJournal(p,{key=process.env.KORDANT_ATTESTATION_KEY,write=true}={}){
 const sources=[['events',p.events],['evidence',p.evidence],['approvals',p.approvals]];const records=sources.map(([name,file])=>{const list=readJsonl(file), chain=journalDigest(list);return {name,count:list.length,head:chain.at(-1)?.digest??'0'.repeat(64)};});
 const payload={schemaVersion:1,at:now(),hashAlgorithm:ALG,projectId:p.config.id,records};const data=canonical(payload);const sealed={...payload,externalKeyUsed:!!key,signature:key?crypto.createHmac(ALG,key).update(data).digest('hex'):null,signatureKind:key?'HMAC-SHA256':'UNSIGNED',scope:'LOCAL_SNAPSHOT_NOT_EXTERNAL_PROVENANCE'};
 if(!write)return sealed;
 return withMutation(p,()=>{const file=path.join(p.dir,'reports',`journal-seal-${Date.now()}.json`);writeAtomic(file,sealed);return {file,seal:sealed};});
}
export function verifyJournal(p,seal,{key=process.env.KORDANT_ATTESTATION_KEY}={}){
 const {signature,externalKeyUsed,signatureKind,scope,...payload}=seal;
 const current=[['events',p.events],['evidence',p.evidence],['approvals',p.approvals]].map(([name,file])=>{const list=readJsonl(file),chain=journalDigest(list);return {name,count:list.length,head:chain.at(-1)?.digest??'0'.repeat(64)};});
 const differences=payload.records.flatMap(x=>{const found=current.find(y=>y.name===x.name);return found?.head===x.head&&found.count===x.count?[]:[x.name];});
 let signatureValid=null;
 if(externalKeyUsed){if(!key)signatureValid=false;else{const expected=crypto.createHmac(ALG,key).update(canonical(payload)).digest('hex');signatureValid=typeof signature==='string'&&/^[0-9a-f]{64}$/.test(signature)&&crypto.timingSafeEqual(Buffer.from(signature,'hex'),Buffer.from(expected,'hex'));}}
 return {verified:differences.length===0&&(!externalKeyUsed||signatureValid===true),signatureValid,changedJournals:differences,notice:'Lokale Hash-/HMAC-Validierung ist kein externer Beweis für Identität, Testqualität oder Unveränderlichkeit des Hosts. Seals müssen extern archiviert werden.'};
}
