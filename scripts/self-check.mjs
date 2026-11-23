import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/util.mjs';
import {getWorkflow,listWorkflows,validateWorkflow} from '../src/workflows.mjs';
import {listSkills,listAgents} from '../src/prompts.mjs';
let errors=[];const sk=new Set(listSkills()),ag=new Set(listAgents());
for(const name of sk){const f=fs.readFileSync(path.join(ROOT,'skills',name,'SKILL.md'),'utf8');if(!f.startsWith('---\n')||!f.includes(`name: ${name}\n`)||!f.includes('description:'))errors.push(`Skill-Frontmatter: ${name}`);}
for(const w of listWorkflows()){try{const wf=getWorkflow(w.id);validateWorkflow(wf);for(const s of wf.steps){if(!ag.has(s.agent))errors.push(`Agent fehlt: ${s.agent}`);if(!sk.has(s.skill))errors.push(`Skill fehlt: ${s.skill}`);if(s.scope.some(f=>f.startsWith('../')))errors.push(`Ungültiger Scope: ${w.id}/${s.id}`);}}catch(e){errors.push(e.message);}}
for(const f of ['LICENSE','README.md','SECURITY.md','AGENTS.md','docs/MASTERBLUEPRINT.md','infra/Caddyfile.example','schemas/task.schema.json'])if(!fs.existsSync(path.join(ROOT,f)))errors.push(`${f} fehlt`);
if(errors.length){console.error('Self-check fehlgeschlagen:',errors);process.exitCode=1;}else console.log(`Self-check erfolgreich: ${sk.size} Skills, ${ag.size} Agenten, ${listWorkflows().length} Workflows, Kern-Dateien vorhanden.`);
