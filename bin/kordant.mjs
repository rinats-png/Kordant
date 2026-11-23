#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import {argumentsOf,print,ROOT,writeAtomic,now,readJson,readJsonl} from '../src/util.mjs';
import {initialize,loadProject,loadTasks,projectSnapshot} from '../src/state.mjs';
import {listWorkflows,startWorkflow} from '../src/workflows.mjs';
import {addTask,readyTasks,claimTask,addEvidence,completeTask,blockTask,releaseTask} from '../src/tasks.mjs';
import {gateCheck,approvalRecord} from '../src/gates.mjs';
import {audit} from '../src/audit.mjs';
import {listSkills,listAgents,createPrompt} from '../src/prompts.mjs';
import {ideaManifest,installIdea,ideaCheck} from '../src/idea.mjs';
import {deploymentPlan,migrationPlan} from '../src/infra.mjs';
import {recordCost,reserveCost,releaseCost,routeModel} from '../src/budget.mjs';
import {doctor} from '../src/doctor.mjs';
import {runAgent} from '../src/runner.mjs';
import {startDashboard} from '../src/dashboard.mjs';
import {scaffold,planStatus,handoff} from '../src/planning.mjs';
import {listStarters,createStarter} from '../src/starters.mjs';
import {proposeBatch} from '../src/scheduler.mjs';
import {projectReport} from '../src/report.mjs';
import {inspectSkill} from '../src/skill-audit.mjs';
import {importPlanning,extractTraceability} from '../src/trace.mjs';
import {sealJournal,verifyJournal} from '../src/integrity.mjs';
import {skillPin,skillVerify} from '../src/skill-lock.mjs';
import {inspectGit,verifyCommit} from '../src/forge.mjs';
import {evaluateRuns} from '../src/evals.mjs';
import {assessAction} from '../src/capabilities.mjs';
import {inspectRecovery,blockStaleTask} from '../src/recovery.mjs';
const args=argumentsOf(process.argv.slice(2));const [cmd,sub,third]=args._;const dir=path.resolve(args.project??'.');
const help=`KORDANT v0.2.0 · Local-first Engineering Framework\n\nStart:\n  kordant init [ordner] --name "Meine App" --kind saas --risk 2 --budget 30\n  kordant adopt [repo-ordner] --name "Bestehende App"\n  kordant doctor | status | dashboard [--port 3333]\n  kordant plan scaffold [--mode full|lite] | plan status | plan handoff [--draft]\n  kordant starter list | starter create node-web --out ../web-demo\n  kordant workflow list | workflow start new-product\n  kordant schedule [--max 2] | report\n  kordant task list | task next | task add --title "..." [--scope src/]\n  kordant task claim <id> | task block <id> --reason "..." | task release <id>\n  kordant task evidence <id> --type test --file .kordant/reports/test.txt\n  kordant task done <id>\n  kordant agent list | agent prompt <id> | agent run <id> [--provider codex] [--execute]\n  kordant skill list | skill inspect /pfad/zu/skill | gate <handoff|merge|staging|release|production>\n  kordant audit [ordner] | deploy plan --domain app.example.com --target staging\n  kordant migrate plan | model route [--risk 2 --complexity 3]\n  kordant cost record --provider vendor --model id --input 1000 --output 500 --rate-input 1 --rate-output 4\n  kordant idea info | idea install --from /pfad | idea install --online\n  kordant idea check <slug> (nur Anzeige, --execute braucht Policy-Freigabe)
  kordant plan import /pfad/idea-to-app/projekte/app | trace /pfad/plan
  kordant journal seal [--key-external] | journal verify --file <seal.json>
  kordant skill pin /pfad/skill --name x --source URL --commit SHA --license MIT --by operator
  kordant skill verify /pfad/skill --name x | git inspect <repo> | git verify <sha>
  kordant eval run --file evaluation.json
  kordant capability check repo.write --actor agent --environment development
  kordant recovery inspect | recovery block <TASK> --by <operator> --minutes 60\n\nAlle Eingriffe in externe Systeme sind standardmäßig deaktiviert. --json für maschinenlesbare Ausgabe.\n`;
async function main(){if(!cmd||cmd==='help'||cmd==='--help'||cmd==='-h'){print(help);return;}
 let out;const project=()=>loadProject(dir);
 switch(cmd){
 case 'init':case 'adopt':{const target=path.resolve(sub??'.');out=initialize(target,{name:args.name??path.basename(target),kind:args.kind??'web',risk:args.risk??2,budget:args.budget??20,existing:cmd==='adopt'});break;}
 case 'doctor':out=doctor();break;
 case 'status':out=projectSnapshot(project());break;
 case 'dashboard':{const port=args.port??3333;startDashboard(dir,port);print(`Nur lokal erreichbar: http://127.0.0.1:${port} (Ctrl+C zum Beenden)`);return;}
 case 'plan':{if(sub==='scaffold')out=scaffold(project(),{mode:args.mode??'full'});else if(sub==='status')out=planStatus(project());else if(sub==='handoff')out=handoff(project(),{draft:args.draft===true});else if(sub==='import')out=importPlanning(project(),third,{format:args.format??'idea-to-app'});else throw new Error('plan scaffold | status | handoff | import <ordner>');break;}
 case 'starter':{if(sub==='list')out=listStarters();else if(sub==='create')out=createStarter(third,args.out??'./starter-project');else throw new Error('starter list | create <name> --out <ordner>');break;}
 case 'workflow':{if(sub==='list')out=listWorkflows();else if(sub==='start')out=startWorkflow(project(),third);else throw new Error('workflow list | workflow start <name>');break;}
 case 'schedule':out=proposeBatch(project(),{max:args.max??undefined});break;
 case 'report':out=projectReport(project());break;
 case 'task':{
  const p=project();
  if(sub==='list')out=loadTasks(p);
  else if(sub==='next')out=readyTasks(p);
  else if(sub==='add')out=addTask(p,{title:args.title,description:args.description??'',agent:args.agent??'engineer',skill:args.skill??'implementation',scope:String(args.scope??'src/').split(','),dependsOn:args.deps?String(args.deps).split(','):[]});
  else if(sub==='claim')out=claimTask(p,third);
  else if(sub==='evidence')out=addEvidence(p,{taskId:third,type:args.type,file:args.file,summary:args.summary??''});
  else if(sub==='done')out=completeTask(p,third);
  else if(sub==='block')out=blockTask(p,third,args.reason);
  else if(sub==='release')out=releaseTask(p,third);
  else throw new Error('Unbekannter task-Befehl');break;
 }
 case 'agent':{if(sub==='list')out=listAgents();else if(sub==='prompt')out=createPrompt(project(),third);else if(sub==='run')out=runAgent(project(),third,{provider:args.provider??'manual',execute:args.execute===true,timeoutSeconds:args.timeout??900,acceptUnmeteredCost:args['accept-unmetered-cost']===true});else throw new Error('agent list | prompt | run');break;}
 case 'skill':{if(sub==='list')out=listSkills();else if(sub==='inspect')out=inspectSkill(third??args.path);else if(sub==='pin')out=skillPin(project(),third,{name:args.name,source:args.source,commit:args.commit,license:args.license,approvedBy:args.by});else if(sub==='verify')out=skillVerify(project(),args.name,third);else throw new Error('skill list | inspect | pin | verify');break;}
 case 'gate':out=gateCheck(project(),sub);if(!out.passed)process.exitCode=1;break;
 case 'approve':out=approvalRecord(project(),{gate:sub,by:args.by,reason:args.reason,file:args.file});break;
 case 'audit':{const base=path.resolve(sub??dir);out=audit(base);if(args.save&&fs.existsSync(path.join(base,'.kordant')))writeAtomic(path.join(base,'.kordant','reports','audit.json'),out);break;}
 case 'deploy':{if(sub!=='plan')throw new Error('Nur deploy plan verfügbar; Live-Deployments erfordern separates Review');out=deploymentPlan(project(),{domain:args.domain,port:args.port,provider:args.provider??'generic-vps',platform:args.platform,capabilities:args.capabilities?String(args.capabilities).split(','):[],region:args.region??'unspecified',profile:args.profile??'default',target:args.target??'staging'});break;}
 case 'migrate':{if(sub!=='plan')throw new Error('Nur migrate plan verfügbar');out=migrationPlan(project(),{source:args.source,destination:args.destination??'generic-vps',data:args.data,capabilities:args.capabilities?String(args.capabilities).split(','):[],region:args.region??'unspecified'});break;}
 case 'policy':{if(sub!=='show'||!['evidence','risk-tiers','actions','design','providers'].includes(third))throw new Error('policy show evidence|risk-tiers|actions|design|providers');out=readJson(path.join(ROOT,'policies',`${third}.json`));break;}
 case 'model':{if(sub!=='route')throw new Error('model route');out=routeModel({risk:args.risk,complexity:args.complexity,type:args.type});break;}
 case 'cost':{if(sub==='record')out=recordCost(project(),{provider:args.provider,model:args.model,inputTokens:args.input,outputTokens:args.output,rateInput:args['rate-input'],rateOutput:args['rate-output'],requestId:args.request??''});else if(sub==='reserve')out=reserveCost(project(),args.usd,args.reason);else if(sub==='release')out=releaseCost(project(),args.usd);else throw new Error('cost record | reserve | release');break;}
 case 'idea':{if(sub==='info')out=ideaManifest();else if(sub==='install')out=installIdea(project(),{from:args.from,online:args.online===true});else if(sub==='check')out=ideaCheck(project(),third,{execute:args.execute===true});else throw new Error('idea info | install | check');break;}
 case 'trace':out=extractTraceability(sub??dir);break;
 case 'journal':{if(sub==='seal')out=sealJournal(project());else if(sub==='verify'){if(!args.file)throw new Error('--file ist erforderlich');out=verifyJournal(project(),readJson(path.resolve(args.file)));if(!out.verified)process.exitCode=1;}else throw new Error('journal seal | verify --file');break;}
 case 'git':{if(sub==='inspect')out=inspectGit(third??dir);else if(sub==='verify')out=verifyCommit(dir,third);else throw new Error('git inspect | verify <sha>');break;}
 case 'capability':{if(sub!=='check')throw new Error('capability check <action>');out=assessAction(third,{projectConfig:project().config,actor:args.actor??'agent',environment:args.environment??'development',scope:args.scope?String(args.scope).split(','):[],operatorVerified:false,sandboxVerified:false});break;}
 case 'recovery':{if(sub==='inspect')out=inspectRecovery(project(),{maxAgeMinutes:args.minutes??60});else if(sub==='block')out=blockStaleTask(project(),third,{maxAgeMinutes:args.minutes??60,operator:args.by});else throw new Error('recovery inspect | block <TASK> --by operator');break;}
 case 'eval':{if(sub!=='run'||!args.file)throw new Error('eval run --file <suite.json>');out=evaluateRuns(project(),args.file);break;}
 case 'demo':{const demo=path.join(ROOT,'examples','demo-project');if(!fs.existsSync(path.join(demo,'.kordant','project.json')))initialize(demo,{name:'KORDANT Demo',kind:'web',risk:1,budget:5});out={demo,summary:projectSnapshot(loadProject(demo))};break;}
 default:throw new Error(`Unbekannter Befehl: ${cmd}`);
 }
 print(args.json?out:typeof out==='string'?out:JSON.stringify(out,null,2));
}
main().catch(e=>{process.stderr.write(`KORDANT-Fehler: ${e.message}\n`);process.exitCode=e.exitCode??2;});
