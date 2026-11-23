import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {now,sha256,within,writeAtomic,readJson} from './util.mjs';
import {event,withMutation} from './state.mjs';
import {inspectGit} from './forge.mjs';

function proof(p,rel){if(!rel)throw new Error('Artefakt- und Testdatei erforderlich');const file=within(p.root,rel);if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw new Error('Nachweisdatei fehlt');if(fs.statSync(file).size>500*1024*1024)throw new Error('Nachweis zu groß');const digest=crypto.createHash('sha256'),fd=fs.openSync(file,'r');const chunk=Buffer.allocUnsafe(1024*1024);try{let n;while((n=fs.readSync(fd,chunk,0,chunk.length,null))>0)digest.update(chunk.subarray(0,n));}finally{fs.closeSync(fd);}return {file:path.relative(p.root,file),sha256:digest.digest('hex'),bytes:fs.statSync(file).size};}
export function createBuildAttestation(p,{artifact,tests,review,author='unknown',reviewer='unknown'}={}){
 const git=inspectGit(p.root);if(!git.cleanTracked)throw new Error('Worktree enthält nichtcommittete Änderungen');if(author===reviewer)throw new Error('Unabhängiger Reviewer darf nicht identisch mit Autor sein');
 const files={artifact:proof(p,artifact),tests:proof(p,tests),review:proof(p,review)};
 const manifest={schemaVersion:1,at:now(),gitCommit:git.head,files,author,reviewer,ciRun:null,ciVerified:false,reviewerIdentityVerified:false,artifactSignatureVerified:false,origin:'LOCAL_SELF_ATTESTED'};
 return withMutation(p,()=>{const file=path.join(p.dir,'reports',`build-${git.head.slice(0,12)}-${Date.now()}.json`);writeAtomic(file,manifest);event(p,'build.attested.local',{file:path.relative(p.root,file),commit:git.head});return {file,manifest};});
}
export function verifyBuildAttestation(p,file){const manifest=readJson(path.resolve(file));if(!manifest||manifest.schemaVersion!==1)throw new Error('Manifest ungültig');const problems=[];for(const [label,expected] of Object.entries(manifest.files??{})){try{const actual=proof(p,expected.file);if(actual.sha256!==expected.sha256||actual.bytes!==expected.bytes)problems.push(`${label}:hash/size`);}catch{problems.push(`${label}:missing`);}}
 const git=inspectGit(p.root);if(git.head!==manifest.gitCommit)problems.push('git:revision-changed');return {validLocalHashes:problems.length===0,problems,productionProvenance:false,notice:'Verifizierte lokale Dateien und Git-Revision, aber keine CI-/Identitäts-/Signaturattestation.'};}
