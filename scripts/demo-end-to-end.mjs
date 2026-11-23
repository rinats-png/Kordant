#!/usr/bin/env node
// No API calls, no writes to a real user repo, no pretend passing tests.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {initialize,loadProject,projectSnapshot} from '../src/state.mjs';
import {scaffold,planStatus} from '../src/planning.mjs';
import {startWorkflow} from '../src/workflows.mjs';
import {readyTasks} from '../src/tasks.mjs';
import {proposeBatch} from '../src/scheduler.mjs';
import {gateCheck} from '../src/gates.mjs';
import {audit} from '../src/audit.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'kordant-example-'));
try {
 initialize(root,{name:'Beispielprojekt – nur lokal',risk:2,budget:5});
 const project=loadProject(root);
 const planning=scaffold(project,{mode:'lite'});
 const workflow=startWorkflow(project,'bugfix');
 const output={mode:'SAFE-LOCAL-DEMONSTRATION',planningPhases:planning.phaseCount,
   workflow:workflow.workflow,tasks:workflow.tasks,readyTasks:readyTasks(project).map(x=>x.title),
   parallelSuggestion:proposeBatch(project).batch.map(x=>x.title),
   release:gateCheck(project,'release').passed?'UNEXPECTED':'BLOCKED',
   production:gateCheck(project,'production').passed?'UNEXPECTED':'BLOCKED',
   status:projectSnapshot(project).budget,
   warning:'Diese Demo erzeugt ausdrücklich keine echten Testbeweise und keine Produktionsfreigabe.'};
 process.stdout.write(JSON.stringify(output,null,2)+'\n');
 if(output.production!=='BLOCKED'||output.release!=='BLOCKED')process.exitCode=1;
} finally {fs.rmSync(root,{recursive:true,force:true});}
