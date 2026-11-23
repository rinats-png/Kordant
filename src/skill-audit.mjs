import fs from 'node:fs';
import path from 'node:path';

/**
 * Read-only heuristic inspection of a foreign agent skill. This does not execute code,
 * follow symlinks or certify safety. Reviewers must inspect every executable payload.
 */
export function inspectSkill(rootInput) {
  const root=path.resolve(rootInput);
  if (!fs.existsSync(root)||!fs.statSync(root).isDirectory()) throw new Error('Skill-Verzeichnis nicht vorhanden');
  const results=[];const files=[];const maxFiles=300;let truncated=false;
  const walk=(dir,depth)=>{
    if (depth>5||files.length>=maxFiles){truncated=true;return;}
    for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
      if (files.length>=maxFiles){truncated=true;break;}
      const abs=path.join(dir,e.name),rel=path.relative(root,abs).replaceAll(path.sep,'/');
      if(e.isSymbolicLink()){results.push({severity:'high',type:'symlink',file:rel,detail:'Symlink nicht auswerten oder folgen'});continue;}
      if(e.isDirectory()){if(!['node_modules','.git','.venv','dist','build'].includes(e.name))walk(abs,depth+1);continue;}
      if (!e.isFile()) continue;
      const size=fs.statSync(abs).size;files.push({file:rel,bytes:size});
      if(size>200000){results.push({severity:'medium',type:'large-uninspected',file:rel,detail:'Datei über 200 KB nicht inhaltlich geprüft'});continue;}
      if (/\.(sh|ps1|bat|exe|dll|so|dylib|py|js|mjs|cjs)$/.test(rel))results.push({severity:'medium',type:'executable-payload',file:rel,detail:'Enthält ausführbares Material: vor Nutzung isoliert prüfen'});
      if (!/\.(md|txt|json|ya?ml|sh|ps1|bat|py|js|mjs|cjs)$/.test(rel)) continue;
      const source=fs.readFileSync(abs,'utf8');
      const patterns=[
       {re:/\b(?:curl|wget)\s+[^\n]{0,150}\|\s*(?:sudo\s+)?(?:bash|sh)\b/i,severity:'high',type:'remote-script-pipe',detail:'Remote-Skript wird möglicherweise direkt in Shell geleitet'},
       {re:/\b(?:rm\s+-rf|del\s+\/s|Remove-Item\s+[^\n]*-Recurse)/i,severity:'high',type:'destructive-operation',detail:'Mögliches rekursives Löschen'},
       {re:/\b(?:--dangerously-skip-permissions|--permission-mode\s+bypassPermissions|--yolo)\b/i,severity:'high',type:'permission-bypass',detail:'Mögliche Umgehung von Agentenfreigaben'},
       {re:/\b(?:sudo|chmod\s+777|chown\s+-R)\b/i,severity:'medium',type:'privileged-command',detail:'Mögliche privilegierte Systemaktion'},
       {re:/\b(?:https?:\/\/\S+|npm\s+install|pip\s+install|npx\s+\S+)/i,severity:'info',type:'network-dependency',detail:'Externe Adresse oder Installation prüfen'},
      ];
      for (const item of patterns) if (item.re.test(source))results.push({severity:item.severity,type:item.type,file:rel,detail:item.detail});
    }
  };
  walk(root,0);
  const skill=path.join(root,'SKILL.md');
  if(!fs.existsSync(skill))results.push({severity:'high',type:'missing-manifest',file:'SKILL.md',detail:'Standard-Skilldatei fehlt'});
  else {
    const text=fs.readFileSync(skill,'utf8');
    if(!text.startsWith('---\n')||!/^name:\s+\S+/m.test(text)||!/^description:\s+\S+/m.test(text))results.push({severity:'medium',type:'invalid-frontmatter',file:'SKILL.md',detail:'YAML-Frontmatter name/description unvollständig'});
  }
  const license=files.some(x=>/(^|\/)(LICENSE|COPYING)(\.|$)/i.test(x.file));
  if(!license)results.push({severity:'medium',type:'unknown-license',file:'',detail:'Keine Lizenzdatei gefunden; externe Lizenzbedingungen prüfen'});
  const high=results.filter(x=>x.severity==='high').length;
  return {mode:'read-only-static-heuristic',root,filesScanned:files.length,truncated,licenseFileDetected:license,summary:{high,medium:results.filter(x=>x.severity==='medium').length},findings:results,
    verdict:'REQUIRES-HUMAN-REVIEW',limits:['Keine Ausführung und keine Onlinequellenprüfung','Heuristische Treffer sind keine bestätigten Sicherheitslücken','Ohne feste Quelle, Commit und Lizenz keine automatische Skillfreigabe']};
}
