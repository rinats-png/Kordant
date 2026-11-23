import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/util.mjs';
import {listWorkflows,getWorkflow} from '../src/workflows.mjs';
import {normalizePlatform} from '../src/infra.mjs';

test('all shipped standard workflows use vendor-independent deployment skills',()=>{
 for(const workflow of listWorkflows()){
  const w=getWorkflow(workflow.id);
  assert.ok(w.steps.every(step=>step.skill!=='ionos-deploy'),`Legacy deployment in ${w.id}`);
 }
});
test('catalog generator does not restore a provider-specific default',()=>{
 const source=fs.readFileSync(path.join(ROOT,'scripts','generate_catalog.py'),'utf8');
 assert.match(source,/provider-agnostic-deploy/);
 assert.doesNotMatch(source,/,'ionos-deploy',\[/);
});
test('provider labels are independent of platform types, and validated',()=>{
 const p=normalizePlatform({platform:'managed-paas',vendor:'Custom-Cloud',capabilities:['backups']});
 assert.equal(p.type,'managed-paas');
 assert.equal(p.vendor,'custom-cloud');
 assert.deepEqual(p.capabilities,['backups']);
 assert.throws(()=>normalizePlatform({platform:'generic-vps',vendor:'../../etc'}),/Anbieterkennung/);
 assert.throws(()=>normalizePlatform({platform:'undocumented-cloud',vendor:'anything'}),/Unbekannter Plattformtyp/);
});

test('built-in provider profiles are pure validated JSON, no live actions',async()=>{
 const {listProviderPlatforms}=await import('../src/provider-profiles.mjs');
 const profiles=listProviderPlatforms();
 assert.equal(profiles.length,7);
 assert.ok(profiles.every(p=>p.approvalRequired===true&&p.executionAvailable===false));
});
test('custom provider profiles enforce credential isolation and strict keys',async()=>{
 const {validateProviderProfile}=await import('../src/provider-profiles.mjs');
 const base={schemaVersion:1,platform:'container-host',vendor:'test-provider',capabilities:['containers'],status:'DRAFT',approval:'manual-verified',credentialHandling:'external-secret-manager-only'};
 assert.equal(validateProviderProfile(base).vendor,'test-provider');
 assert.throws(()=>validateProviderProfile({...base,token:'actual_secret'}),/Unerlaubtes Feld/);
 assert.throws(()=>validateProviderProfile({...base,credentialHandling:'inline'}),/Secret-Manager/);
 assert.throws(()=>validateProviderProfile({...base,operations:['runArbitraryShell']}),/Provideroperation/);
});
test('provider-neutral command-line catalog is usable without a project or credentials',async()=>{
 const {spawnSync}=await import('node:child_process');
 const result=spawnSync(process.execPath,[path.join(ROOT,'bin','kordant.mjs'),'platform','list'],{cwd:ROOT,encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,result.stderr);
 const list=JSON.parse(result.stdout);
 assert.equal(list.length,7);
 assert.ok(list.every(x=>x.executionAvailable===false));
});
