import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {initialize,loadProject,loadTasks} from '../src/state.mjs';
import {listWorkflows,getWorkflow,validateWorkflow,startWorkflow} from '../src/workflows.mjs';
import {addTask,readyTasks,claimTask,addEvidence,completeTask,blockTask,releaseTask,scopesOverlap} from '../src/tasks.mjs';
import {gateCheck} from '../src/gates.mjs';
import {audit} from '../src/audit.mjs';
import {createPrompt,listSkills,listAgents} from '../src/prompts.mjs';
import {reserveCost,releaseCost,recordCost,routeModel} from '../src/budget.mjs';
import {deploymentPlan,migrationPlan} from '../src/infra.mjs';
import {ideaManifest,ideaCheck} from '../src/idea.mjs';
import {readJson,readJsonl,within,sha256} from '../src/util.mjs';

const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'kordant-test-'));
const setup=()=>{const root=temp();initialize(root,{name:'Test App',risk:2,budget:4});return {root,p:loadProject(root)};};

test('all workflows valid with matching roles/skills',()=>{
 const workflows=listWorkflows();assert.ok(workflows.length>=15);
 for(const x of workflows){const w=getWorkflow(x.id);assert.equal(validateWorkflow(w),true);for(const s of w.steps){assert.ok(listAgents().includes(s.agent),`${w.id}/${s.id} agent ${s.agent}`);assert.ok(listSkills().includes(s.skill),`${w.id}/${s.id} skill ${s.skill}`);}}
});
test('reject cycle',()=>assert.throws(()=>validateWorkflow({id:'x',steps:[{id:'a',dependsOn:['b']},{id:'b',dependsOn:['a']}]}),/Zyklus/));
test('initialize is non-destructive',()=>{const root=temp();const res=initialize(root,{name:'Beta',risk:3,budget:25});assert.equal(res.config.risk,3);assert.throws(()=>initialize(root),/bereits/);});
test('workflow DAG blocks dependent tasks',()=>{const {p}=setup();const x=startWorkflow(p,'bugfix');assert.equal(x.tasks,3);const ready=readyTasks(p);assert.equal(ready.length,1);assert.match(ready[0].title,/reproduzieren/i);});
test('task evidence with SHA required to complete',()=>{const {root,p}=setup();const t=addTask(p,{title:'Feature',requiredEvidence:['test','review']});claimTask(p,t.id);assert.throws(()=>completeTask(p,t.id),/Nachweise fehlen/);
 const d=path.join(root,'.kordant','reports');fs.mkdirSync(d,{recursive:true});for(const name of ['test','review']){fs.writeFileSync(path.join(d,`${name}.txt`),name+' geprüft');addEvidence(p,{taskId:t.id,type:name,file:`.kordant/reports/${name}.txt`});}assert.equal(completeTask(p,t.id).status,'done');});
test('detect modified evidence',()=>{const {root,p}=setup();const t=addTask(p,{title:'F',requiredEvidence:['test']});claimTask(p,t.id);const report=path.join(root,'.kordant','reports','run.txt');fs.writeFileSync(report,'pass');addEvidence(p,{taskId:t.id,type:'test',file:'.kordant/reports/run.txt'});fs.writeFileSync(report,'tampered');assert.throws(()=>completeTask(p,t.id),/beschädigt|verändert/);});
test('overlapping write scopes blocked, independent scopes allowed',()=>{const {p}=setup();const one=addTask(p,{title:'A',scope:['src/a/']});const two=addTask(p,{title:'B',scope:['src/a/feature/']});const three=addTask(p,{title:'C',scope:['src/b/']});claimTask(p,one.id);assert.throws(()=>claimTask(p,two.id),/Kollision/);claimTask(p,three.id);assert.equal(loadTasks(p).filter(t=>t.status==='in_progress').length,2);});
test('block and release',()=>{const {p}=setup();const t=addTask(p,{title:'B'});blockTask(p,t.id,'abhängig von Zulieferer');assert.equal(loadTasks(p)[0].status,'blocked');releaseTask(p,t.id);assert.equal(loadTasks(p)[0].status,'pending');});
test('reject evidence path outside root and symlink',()=>{const {root,p}=setup();const t=addTask(p,{title:'A'});assert.throws(()=>addEvidence(p,{taskId:t.id,type:'test',file:'../../etc/hosts'}),/außerhalb/);fs.symlinkSync('/etc/hosts',path.join(root,'outside'));assert.throws(()=>addEvidence(p,{taskId:t.id,type:'test',file:'outside'}),/Symlink/);});
test('gates fail closed, especially production',()=>{const {p}=setup();const r=gateCheck(p,'release');assert.equal(r.passed,false);assert.ok(r.missingEvidence.length>=5);const prod=gateCheck(p,'production');assert.equal(prod.passed,false);assert.match(prod.problems.join(' '),/externe/);});
test('read-only audit reports UNKNOWN without touching project',()=>{const root=temp();fs.writeFileSync(path.join(root,'package.json'),'{"name":"demo","dependencies":{"x":"1.0.0"}}');const before=fs.readdirSync(root).join(',');const r=audit(root);assert.equal(r.kind,'static-read-only');assert.ok(r.findings.some(f=>/Lockfile/.test(f.message)));assert.equal(fs.readdirSync(root).join(','),before);});
test('audit masks secrets, never puts value in report',()=>{const root=temp();const secret='ghp_'+('A'.repeat(28));fs.writeFileSync(path.join(root,'secret.js'),`const key='${secret}';`);const a=JSON.stringify(audit(root));assert.ok(a.includes('Mögliche Secret'));assert.ok(!a.includes(secret));});
test('agent prompt is generated, not executed',()=>{const {p}=setup();const t=addTask(p,{title:'Baue Backend',skill:'backend',agent:'backend-engineer'});const r=createPrompt(p,t.id);assert.ok(fs.existsSync(r.file));const s=fs.readFileSync(r.file,'utf8');assert.match(s,/Backend Engineering/);assert.match(s,/Sicherheitsgrenzen/);});
test('budget reservation and actual overspend visible',()=>{const {p,root}=setup();const r=reserveCost(p,1.5,'Test');assert.equal(r.usd,1.5);assert.throws(()=>reserveCost(p,4),/Budgetlimit/);releaseCost(p,1.5);const cost=recordCost(p,{provider:'test',model:'model-x',inputTokens:500000,outputTokens:500000,rateInput:10,rateOutput:10});assert.equal(cost.usd,10);assert.equal(readJson(path.join(root,'.kordant/project.json')).budget.limitBreached,true);});
test('model router is transparent and does not invent model prices',()=>{assert.equal(routeModel({risk:3,complexity:1}).tier,'high-reasoning');assert.equal(routeModel({risk:1,complexity:1,type:'bugfix'}).tier,'efficient');});
test('deployment and migration remain plan only',()=>{const {p}=setup();const d=deploymentPlan(p,{domain:'app.example.com'});assert.equal(d.plan.status,'PLAN_ONLY');const m=migrationPlan(p);assert.equal(m.plan.mode,'PLAN_ONLY');assert.throws(()=>deploymentPlan(p,{domain:'localhost'}),/Domain/);});
test('idea-to-app upstream is explicitly pinned and needs installation',()=>{const {p}=setup();assert.equal(ideaManifest().commit.length,40);assert.throws(()=>ideaCheck(p,'project'),/nicht installiert/);});
test('paths remain inside project root',()=>{const root=temp();fs.writeFileSync(path.join(root,'file.txt'),'a');assert.equal(within(root,'file.txt'),path.join(root,'file.txt'));assert.throws(()=>within(root,'../etc/passwd'),/außerhalb/);});
