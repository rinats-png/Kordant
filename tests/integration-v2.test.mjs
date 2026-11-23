import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {initialize,loadProject} from '../src/state.mjs';
import {deploymentPlan,migrationPlan,normalizePlatform} from '../src/infra.mjs';
import {importPlanning,extractTraceability} from '../src/trace.mjs';
import {sealJournal,verifyJournal} from '../src/integrity.mjs';
import {skillPin,skillVerify} from '../src/skill-lock.mjs';
import {evaluateRuns} from '../src/evals.mjs';
import {inspectGit} from '../src/forge.mjs';
import {spawnSync} from 'node:child_process';
const tmp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'kordant-v2-'));
const setup=()=>{const dir=tmp();initialize(dir,{name:'v2'});return {dir,p:loadProject(dir)};};
test('platform plan supports different cloud and server types without vendor lock-in',()=>{
 const {p}=setup();const plan=deploymentPlan(p,{domain:'test.example.com',provider:'managed-paas',capabilities:['dns-api','backups'],region:'eu-west-1'});assert.equal(plan.plan.platform.type,'managed-paas');assert.deepEqual(plan.plan.platform.capabilities,['backups','dns-api']);
 assert.equal(migrationPlan(p,{destination:'kubernetes'}).plan.platform.type,'kubernetes');
 assert.throws(()=>normalizePlatform({provider:'ionos-vps'}),/Unbekannter/);
 assert.throws(()=>normalizePlatform({provider:'generic-vps',capabilities:['not-real']}),/Capabilities/);
});
test('idea-to-app planning imports read only and extracts trace IDs',()=>{
 const {p}=setup(),src=tmp();fs.writeFileSync(path.join(src,'PROJECT_STATE.md'),'# Plan');fs.writeFileSync(path.join(src,'05-mvp.md'),'| F-01 | AK-F01-1 | TEST-F01-1 | TASK-001 |\n| F-02 | nothing | | |\n');
 const report=extractTraceability(src);assert.equal(report.identifiers.function.length,2);assert.equal(report.coverage.fullyLinkedOnSameLine,1);
 const imported=importPlanning(p,src);assert.equal(imported.phasesDetected,1);assert.equal(imported.summary.totalFunctions,2);assert.ok(fs.existsSync(imported.file));
 assert.equal(fs.readdirSync(src).length,2);
});
test('journal seal detects changed entries and requires out-of-band HMAC key',()=>{
 const {dir,p}=setup();const key='test-only-this-key-never-prod';const sealed=sealJournal(p,{key});assert.equal(sealed.seal.signatureKind,'HMAC-SHA256');assert.equal(verifyJournal(p,sealed.seal,{key}).verified,true);
 assert.equal(verifyJournal(p,sealed.seal,{key:'wrong'}).verified,false);
 fs.appendFileSync(p.events,JSON.stringify({type:'tamper'})+'\n');assert.deepEqual(verifyJournal(p,sealed.seal,{key}).changedJournals,['events']);
});
test('skill lock records verified digest and refuses symlink or changed bytes',()=>{
 const {p}=setup(),src=tmp();fs.writeFileSync(path.join(src,'SKILL.md'),'---\nname: simple\ndescription: Test skill\n---\nInstructions');fs.writeFileSync(path.join(src,'LICENSE'),'MIT');
 const pin=skillPin(p,src,{name:'simple',source:'https://github.com/test/simple',commit:'0123456789abcdef',license:'MIT',approvedBy:'human'});assert.ok(pin.record.digest);
 assert.equal(skillVerify(p,'simple',src).matched,true);fs.appendFileSync(path.join(src,'SKILL.md'),'\nchanged');assert.equal(skillVerify(p,'simple',src).matched,false);
});
test('evaluation report validates cases and tracks cost without executing models',()=>{
 const {p}=setup(),src=path.join(tmp(),'eval.json');fs.writeFileSync(src,JSON.stringify({model:'example',cases:[{id:'one',score:1,costUsd:0.2},{id:'two',score:0.5,costUsd:0.1}]}));
 const r=evaluateRuns(p,src);assert.equal(r.result.total,2);assert.equal(r.result.passed,1);assert.ok(Math.abs(r.result.costUsd-0.3)<1e-9);
});
test('local git read-only inspection does not mutate tracked files',()=>{
 const dir=tmp(),r=(...a)=>spawnSync('git',a,{cwd:dir,encoding:'utf8'});assert.equal(r('init','-q').status,0);r('config','user.email','test@example.test');r('config','user.name','Test');fs.writeFileSync(path.join(dir,'a.txt'),'a');r('add','a.txt');r('commit','-qm','init');const before=fs.readdirSync(dir).join(',');const git=inspectGit(dir);assert.match(git.head,/^[0-9a-f]{40}$/);assert.equal(git.cleanTracked,true);assert.equal(fs.readdirSync(dir).join(','),before);
});
