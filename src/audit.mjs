import fs from 'node:fs';
import path from 'node:path';
import {now,exists,readJson,sha256} from './util.mjs';

const excluded=new Set(['.git','node_modules','.next','dist','build','.venv','vendor','.kordant','coverage','.turbo','.cache','target','Pods']);
function filesUnder(base,{limit=3000}={}){
 const results=[];const walk=(p,depth)=>{if(results.length>=limit||depth>14)return;for(const e of fs.readdirSync(p,{withFileTypes:true})){if(results.length>=limit)break;if(e.isSymbolicLink())continue;const child=path.join(p,e.name);if(e.isDirectory()){if(!excluded.has(e.name))walk(child,depth+1);}else if(e.isFile())results.push(path.relative(base,child).replaceAll(path.sep,'/'));}};walk(base,0);return results;
}
export function audit(base){const root=path.resolve(base);if(!exists(root)||!fs.statSync(root).isDirectory())throw new Error('Audit-Pfad ist kein Ordner');
 const files=filesUnder(root);const match=re=>files.filter(f=>re.test(f));const findings=[];let counter=0;
 const add=(area,severity,status,message,refs=[],remediation='')=>findings.push({id:`BF-${String(++counter).padStart(3,'0')}`,area,severity,status,message,refs:refs.slice(0,15),remediation});
 const pack=readJson(path.join(root,'package.json'),{});const gitignore=exists(path.join(root,'.gitignore'))?fs.readFileSync(path.join(root,'.gitignore'),'utf8'):'';
 if(!files.some(x=>/^README\.md$/i.test(x)))add('documentation','low','missing','README fehlt',[],'Einstieg, Start und Betrieb dokumentieren');
 if(!files.some(x=>/^(test|tests|__tests__)\/|\.(test|spec)\.[cm]?[jt]sx?$/.test(x)))add('quality','medium','not-evidenced','Automatisierte Tests im Repository nicht erkannt',[],'Testnachweise und CI prüfen');
 if(!files.some(x=>/^\.github\/workflows\/.+\.ya?ml$|^\.gitlab-ci\.yml$/.test(x)))add('delivery','medium','not-evidenced','Keine CI-Konfiguration erkannt',[],'CI mit Tests und Security-Gates ergänzen');
 if(files.some(x=>/(^|\/)\.env($|\.)/.test(x)&&!x.endsWith('.example')&&!x.endsWith('.sample')))add('security','critical','potential-risk','.env-Datei im Projekt gefunden; Inhalt nicht ausgegeben',match(/(^|\/)\.env/),'Sicherstellen, dass keine Secrets versioniert sind; ggf. rotieren');
 if(pack.dependencies){const deps=Object.keys(pack.dependencies);if(deps.length>0&&!files.some(x=>/^(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/.test(x)))add('supply-chain','high','missing','Abhängigkeiten ohne Lockfile',[],'Lockfile prüfen und einchecken');}
 if(!gitignore.includes('.env'))add('security','medium','not-evidenced','.gitignore enthält kein .env-Muster',match(/\.gitignore/),'Secrets grundsätzlich aus Repository fernhalten');
 if(!files.some(x=>/(Dockerfile|compose\.ya?ml|docker-compose\.ya?ml|vercel\.json|netlify\.toml|fly\.toml|Procfile)$/.test(x)))add('operations','info','unknown','Auslieferungskonfiguration nicht im Repository erkannt',[],'Hosting separat inventarisieren');
 if(!match(/security|threat|bedrohung/i).length)add('security','medium','not-evidenced','Kein dokumentiertes Bedrohungsmodell erkannt',[],'Threat Modeling durchführen');
 if(!match(/backup|restore|wiederherstellung/i).length)add('resilience','medium','not-evidenced','Keine Backup-/Restore-Anleitung erkannt',[],'Offsite-Backup und Wiederherstellungstest festlegen');
 if(!match(/privacy|datenschutz|dsgvo|retention|loesch/i).length)add('privacy','medium','not-evidenced','Keine Datenschutz-/Aufbewahrungsunterlagen erkannt',[],'Dateninventar und Löschfristen prüfen');
 if(!match(/(^|\/)(LICENSE|COPYING)(\.|$)/i).length)add('legal','low','not-evidenced','Lizenzdatei fehlt',[],'Lizenz und Drittanbieterpflichten klären');
 if(!match(/(^|\/)(AGENTS\.md|CLAUDE\.md)$/i).length)add('agentic','info','not-evidenced','Keine projektbezogenen Agentenregeln erkannt',[],'AGENTS.md mit Freigabe- und Sicherheitsgrenzen hinzufügen');
 const encoded=files.filter(f=>/\.(js|mjs|cjs|ts|tsx|jsx|json|md|ya?ml|toml|py|go|rs|sh)$/.test(f));const highRisk=[];
 for(const f of encoded.slice(0,1200)){
  const p=path.join(root,f);if(fs.statSync(p).size>384000)continue;const str=fs.readFileSync(p,'utf8');
  const patterns=[{re:/\b(?:AKIA[0-9A-Z]{16})\b/,type:'AWS key pattern'},{re:/\b(?:ghp|gho|ghs)_[a-zA-Z0-9]{20,}\b/,type:'GitHub token pattern'},{re:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,type:'Private-key marker'}];
  for(const {re,type} of patterns)if(re.test(str))highRisk.push({file:f,type});
 }
 if(highRisk.length)add('security','critical','potential-risk','Mögliche Secret-Muster gefunden; Werte wurden nicht ausgegeben',highRisk.map(x=>`${x.file} (${x.type})`),'Secrets untersuchen, kompromittierte Schlüssel widerrufen');
 return {kind:'static-read-only',root,at:now(),fileCount:files.length,truncated:files.length===3000,languageHints:{node:!!pack.name,python:files.some(f=>/requirements\.txt|pyproject\.toml/.test(f)),go:files.includes('go.mod'),rust:files.includes('Cargo.toml')},findings,limitations:['Keine dynamischen Tests, keine Live-Serverprüfung, keine vollständige Schwachstellenanalyse','Nicht erkannte Nachweise bedeuten nicht automatisch, dass eine Schutzmaßnahme fehlt','Ein Secret-Pattern ist ein Verdacht, kein bestätigter Leak']};
}
