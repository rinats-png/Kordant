import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {exists,mkdir,writeAtomic} from './util.mjs';
import {event,withMutation} from './state.mjs';

const URL='https://github.com/rinats-png/idea-to-app.git';
const SHA='00dc23b8f3a20a829f07bd3b7411d6b7a0e12bda';
export function ideaManifest(){return {name:'idea-to-app',version:'1.2.0',repository:URL,commit:SHA,license:'MIT',method:'pinned-source-local-import-or-online-git-clone',bundled:false};}

export function installIdea(p,{from,online=false}={}) {
  if (!from && !online) throw new Error('Explizit --from /pfad oder --online angeben. Kein automatischer Download.');
  if (from && online) throw new Error('Genau eine Quelle wählen: --from oder --online.');
  const dest=path.join(p.dir,'vendor','idea-to-app');
  if (exists(dest)) throw new Error('idea-to-app bereits installiert');
  return withMutation(p,()=>{
    mkdir(path.dirname(dest));
    let commit=null;
    try {
      if (from) {
        const source=path.resolve(from);
        if (!fs.existsSync(source) || !fs.statSync(source).isDirectory() ||
            !exists(path.join(source,'AGENTS.md')) || !exists(path.join(source,'scripts','pruefe-projekt.mjs'))) {
          throw new Error('Ungültige idea-to-app-Quelle');
        }
        // Never follow foreign symlinks or copy .git, credentials, environment files or generated projects.
        fs.cpSync(source,dest,{
          recursive:true,
          filter:f=>{
            const relative=path.relative(source,f);
            if (!relative) return true;
            const components=relative.split(path.sep);
            if (components.some(c=>['.git','.env','.npmrc','.ssh','node_modules'].includes(c) || c.startsWith('.env.'))) return false;
            if (components[0]==='projekte' && components.length>1) return false;
            if (fs.lstatSync(f).isSymbolicLink()) throw new Error(`Symlink in der Quelle abgelehnt: ${relative}`);
            return true;
          }
        });
        const r=spawnSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8',timeout:10000});
        if (r.status===0) commit=r.stdout.trim();
      } else {
        const r=spawnSync('git',['clone','--no-checkout','--',URL,dest],{encoding:'utf8',timeout:120000});
        if (r.status!==0) throw new Error(`git clone fehlgeschlagen: ${r.error?.message??r.stderr?.slice(-250)}`);
        const c=spawnSync('git',['-C',dest,'checkout','--detach',SHA],{encoding:'utf8',timeout:30000});
        if (c.status!==0) throw new Error('Upstream-Commit konnte nicht ausgecheckt werden');
        const v=spawnSync('git',['-C',dest,'rev-parse','HEAD'],{encoding:'utf8',timeout:10000});
        commit=v.status===0?v.stdout.trim():null;
        if (commit!==SHA) throw new Error('Unerwarteter Commit; Integration verweigert');
        fs.rmSync(path.join(dest,'.git'),{recursive:true,force:true});
      }
      const manifest={...ideaManifest(),installedAt:new Date().toISOString(),localSource:from??null,
        verifiedCommit:online?commit:null,reportedSourceCommit:from?commit:null,
        warning:from?'Lokale Kopie ist nicht kryptografisch mit Upstream verglichen; Repositoryinhalt/Version vor Ausführung separat verifizieren.':'Git-Commit abgeglichen und Git-Metadaten entfernt.'};
      writeAtomic(path.join(dest,'KORDANT-INTEGRATION.json'),manifest);
      event(p,'idea.installed',{commit,from:!!from});return manifest;
    } catch(err) {fs.rmSync(dest,{recursive:true,force:true});throw err;}
  });
}

export function ideaCheck(p,projectSlug,{execute=false}={}) {
  const root=path.join(p.dir,'vendor','idea-to-app');
  const file=path.join(root,'scripts','pruefe-projekt.mjs');
  if (!exists(file)) throw new Error('idea-to-app nicht installiert');
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(projectSlug)) throw new Error('Ungültiger Projekt-Slug');
  const project=path.join(root,'projekte',projectSlug);
  if (!exists(project)) throw new Error('Projektordner in idea-to-app fehlt');
  if (!execute) return {command:`node scripts/pruefe-projekt.mjs projekte/${projectSlug} --handoff`,cwd:root,executed:false};
  if (!p.config.policies.allowThirdPartyScripts) throw new Error('Dritt-Skriptausführung durch Projekt-Policy verboten');
  const r=spawnSync(process.execPath,['scripts/pruefe-projekt.mjs',`projekte/${projectSlug}`,'--handoff'],{
    cwd:root,encoding:'utf8',timeout:60000,env:{PATH:process.env.PATH??'',HOME:process.env.HOME??''}
  });
  return {executed:true,status:r.status,stdout:r.stdout?.slice(0,10000),stderr:r.stderr?.slice(0,3000)};
}
