import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadTasks,withMutation,event} from './state.mjs';
import {within,now,writeAtomic} from './util.mjs';

function git(root,argv){const r=spawnSync('git',['-c','core.hooksPath=/dev/null',...argv],{cwd:root,encoding:'utf8',timeout:20000,maxBuffer:1024*1024,env:{PATH:process.env.PATH??'',HOME:process.env.HOME??'',GIT_TERMINAL_PROMPT:'0',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null'}});if(r.status!==0)throw new Error(`Git-Operation verweigert: ${(r.stderr??r.error?.message??'').slice(0,500)}`);return (r.stdout??'').trim();}
const safeId=x=>/^[a-zA-Z0-9-]{5,100}$/.test(x);
function currentRepository(root){const top=git(root,['rev-parse','--show-toplevel']);if(path.resolve(top)!==path.resolve(root))throw new Error('Projekt muss das Git-Repository-Root sein');return top;}
/** Worktrees provide filesystem separation, not a security sandbox. Never run untrusted hooks/filters. */
export function worktreePlan(p,id,{baseRef='HEAD'}={}){
 if(!safeId(id))throw new Error('Ungültige Task-ID');const t=loadTasks(p).find(x=>x.id===id);if(!t)throw new Error('Task fehlt');if(t.status!=='in_progress')throw new Error('Task muss beansprucht sein');currentRepository(p.root);
 if(!/^(?:HEAD|[0-9a-f]{40})$/i.test(baseRef))throw new Error('Nur HEAD oder Commit-SHA als Base erlaubt');
 const head=git(p.root,['rev-parse','--verify',`${baseRef}^{commit}`]);
 const dirty=git(p.root,['status','--porcelain=v1','--untracked-files=no']);
 return {taskId:id,baseCommit:head,branch:`kordant/${id}`,path:path.join(p.dir,'worktrees',id),workingTreeDirty:dirty.length>0,executed:false,warning:'Worktrees isolieren Dateien, aber nicht Netzwerk, Prozesse, Git-Filter oder Berechtigungen. Nur auf vertrauenswürdigen Repositories mit Sandbox ausführen.'};
}
export function createTaskWorktree(p,id,{baseRef='HEAD',execute=false}={}){
 const plan=worktreePlan(p,id,{baseRef});if(!execute)return plan;if(plan.workingTreeDirty)throw new Error('Aktives Repository hat nicht committete Änderungen');
 if(!p.config.policies.allowExternalAgents)throw new Error('Projekt-Policy: isolierte Agenten noch nicht freigegeben');
 const attrs=path.join(p.root,'.gitattributes');if(fs.existsSync(attrs)&&/\bfilter=|\bworking-tree-encoding\b/.test(fs.readFileSync(attrs,'utf8')))throw new Error('Ungeprüfte Git-Filter/Attribute: Worktree-Ausführung verweigert');
 return withMutation(p,()=>{if(fs.existsSync(plan.path))throw new Error('Worktree-Ziel existiert');fs.mkdirSync(path.dirname(plan.path),{recursive:true});git(p.root,['worktree','add','-b',plan.branch,plan.path,plan.baseCommit]);
  const data={...plan,executed:true,createdAt:now(),worktreeRef:git(plan.path,['rev-parse','HEAD'])};writeAtomic(path.join(p.dir,'runs',`worktree-${id}.json`),data);event(p,'worktree.created',{taskId:id,path:path.relative(p.root,plan.path),commit:plan.baseCommit});return data;});
}
export function worktreeStatus(p,id){const file=path.join(p.dir,'runs',`worktree-${id}.json`);if(!fs.existsSync(file))throw new Error('Worktree nicht registriert');const data=JSON.parse(fs.readFileSync(file,'utf8'));const dir=within(p.root,data.path);if(!fs.existsSync(dir))return {taskId:id,exists:false};return {taskId:id,exists:true,head:git(dir,['rev-parse','HEAD']),status:git(dir,['status','--porcelain=v1']),note:'Nur lesende Statusprüfung'};}
