import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {initialize,loadProject} from '../src/state.mjs';
import {addTask,claimTask} from '../src/tasks.mjs';
import {assessAction} from '../src/capabilities.mjs';
import {inspectRecovery,blockStaleTask} from '../src/recovery.mjs';
import {worktreePlan,createTaskWorktree,worktreeStatus} from '../src/worktrees.mjs';
import {createBuildAttestation,verifyBuildAttestation} from '../src/attest.mjs';
import {evaluateSarif} from '../src/security-reports.mjs';
const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'kordant-v3-'));
const setup=()=>{const dir=temp();initialize(dir,{name:'Security Test',risk:2});return {dir,p:loadProject(dir)};};
const git=(cwd,...args)=>{const r=spawnSync('git',args,{cwd,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
function repo(){const {dir}=setup();git(dir,'init','-q');git(dir,'config','user.email','tester@example.test');git(dir,'config','user.name','Tester');fs.writeFileSync(path.join(dir,'file.txt'),'committed');fs.writeFileSync(path.join(dir,'.gitignore'),'.kordant/\n');git(dir,'add','file.txt','.gitignore');git(dir,'commit','-qm','initial');return {dir,p:loadProject(dir)};}
test('default deny for sensitive capabilities, including self-approval',()=>{
 assert.equal(assessAction('production.deploy',{actor:'agent',environment:'production',operatorVerified:true,sandboxVerified:true}).allowed,false);
 assert.equal(assessAction('unknown.capability').allowed,false);
 assert.equal(assessAction('repo.read',{environment:'development'}).allowed,true);
 assert.equal(assessAction('repo.write',{scope:['src'],sandboxVerified:false,projectConfig:{policies:{allowExternalAgents:true}}}).allowed,false);
});
test('stale tasks require a real operator and are blocked not retried',()=>{
 const {p}=setup();const t=addTask(p,{title:'Long running'});claimTask(p,t.id);assert.equal(inspectRecovery(p,{maxAgeMinutes:60}).staleTasks.length,0);
 assert.throws(()=>blockStaleTask(p,t.id,{maxAgeMinutes:60,operator:'OPERATOR'}),/Kein veralteter/);
 const data=JSON.parse(fs.readFileSync(p.tasks));data.tasks[0].claimedAt='2020-01-01T00:00:00.000Z';fs.writeFileSync(p.tasks,JSON.stringify(data));
 assert.equal(inspectRecovery(p,{maxAgeMinutes:60}).staleTasks.length,1);
 assert.throws(()=>blockStaleTask(p,t.id,{operator:''}),/Operator/);
 assert.equal(blockStaleTask(p,t.id,{operator:'security-owner'}).status,'blocked');
});
test('worktree commands are dry-run by default and optional explicit execution is isolated by folder',()=>{
 const {dir,p}=repo();const t=addTask(p,{title:'Feature',scope:['src/feature']});claimTask(p,t.id);const plan=worktreePlan(p,t.id);assert.equal(plan.executed,false);assert.equal(fs.existsSync(plan.path),false);
 assert.throws(()=>createTaskWorktree(p,t.id,{execute:true}),/Policy/);
 p.config.policies.allowExternalAgents=true;fs.writeFileSync(p.configFile,JSON.stringify(p.config));
 const created=createTaskWorktree(p,t.id,{execute:true});assert.equal(created.executed,true);assert.equal(worktreeStatus(p,t.id).exists,true);assert.equal(git(created.path,'rev-parse','--abbrev-ref','HEAD'),created.branch);
 git(dir,'worktree','remove','--force',created.path);
});
test('local build attestation checks hash and git commit but never asserts CI provenance',()=>{
 const {dir,p}=repo();for(const x of ['artifact.bin','test.log','review.txt'])fs.writeFileSync(path.join(dir,x),`${x}\n`);
 const a=createBuildAttestation(p,{artifact:'artifact.bin',tests:'test.log',review:'review.txt',author:'developer',reviewer:'reviewer'});assert.equal(a.manifest.ciVerified,false);assert.equal(verifyBuildAttestation(p,a.file).validLocalHashes,true);
 fs.writeFileSync(path.join(dir,'test.log'),'altered');assert.equal(verifyBuildAttestation(p,a.file).validLocalHashes,false);
 assert.throws(()=>createBuildAttestation(p,{artifact:'artifact.bin',tests:'test.log',review:'review.txt',author:'same',reviewer:'same'}),/nicht identisch/);
});
test('SARIF importer blocks high alerts and preserves warning that scanner is untrusted',()=>{
 const {dir,p}=setup();const file=path.join(dir,'scan.sarif');fs.writeFileSync(file,JSON.stringify({version:'2.1.0',runs:[{results:[{ruleId:'CWE-79',level:'error',message:{text:'Possible XSS'}}]}]}));
 const r=evaluateSarif(p,file,{blockAt:'high'});assert.equal(r.report.pass,false);assert.equal(r.report.blocking,1);assert.equal(r.report.untrustedScannerOutput,true);
});

test('GitHub evidence reader uses only GET, denies invalid inputs and never echoes credentials',async()=>{
 const {observeGitHubChecks}=await import('../src/github-evidence.mjs');const token='test-synthetic-token-not-real';const sha='a'.repeat(40),calls=[];
 const fetchImpl=async (url,opts)=>{calls.push({url,method:opts.method,authorization:opts.headers.Authorization});return {ok:true,status:200,json:async()=>url.includes('/actions/runs')?{workflow_runs:[{id:1,head_sha:sha,name:'CI',status:'completed',conclusion:'success'}]}:{state:'success',statuses:[{context:'test',state:'success'}]}};};
 const report=await observeGitHubChecks({owner:'owner',repo:'repo',sha,token,fetchImpl});assert.equal(report.reportedSuccessful,true);assert.equal(calls.length,2);assert.ok(calls.every(x=>x.method==='GET'));assert.equal(JSON.stringify(report).includes(token),false);
 await assert.rejects(()=>observeGitHubChecks({owner:'../bad',repo:'repo',sha,token,fetchImpl}),/ungültig/);
 const failing=async()=>({ok:false,status:401});await assert.rejects(()=>observeGitHubChecks({owner:'owner',repo:'repo',sha,token,fetchImpl:failing}),/GitHub status 401/);
});
