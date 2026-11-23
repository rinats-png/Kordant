import path from 'node:path';
import {now,writeAtomic,slug} from './util.mjs';
import {event} from './state.mjs';

/** Infrastructure manifests describe capabilities rather than vendors. They never execute changes. */
const TARGETS = new Set(['local','staging','production']);
export const PLATFORM_TYPES = Object.freeze(['generic-vps','container-host','managed-paas','kubernetes','bare-metal','serverless','local']);
export const CAPABILITIES = Object.freeze(['ssh','containers','managed-database','persistent-volume','tls-termination','dns-api','object-storage','backups','observability','secrets-manager','orchestrator','rollout','ipv6']);

export function normalizePlatform({provider='generic-vps',platform,capabilities=[],region='unspecified',profile='default'}={}) {
 const type = String(platform??provider).trim().toLowerCase();
 if (!PLATFORM_TYPES.includes(type)) throw new Error(`Unbekannter Plattformtyp: ${type}; gültig: ${PLATFORM_TYPES.join(', ')}`);
 if (!Array.isArray(capabilities)||capabilities.some(c=>!CAPABILITIES.includes(c))||new Set(capabilities).size!==capabilities.length) throw new Error('Ungültige oder doppelte Plattform-Capabilities');
 if (!/^[a-z0-9][a-z0-9_-]{0,62}$/i.test(profile)) throw new Error('Ungültiger Profilname');
 if(typeof region!=='string'||region.length>100)throw new Error('Region ungültig');
 return {type,profile,region,capabilities:[...capabilities].sort()};
}

export function deploymentPlan(p,{domain,port=3000,provider='generic-vps',platform,capabilities=[],target='staging',profile='default',region='unspecified'}={}){
 if(!domain||!/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)||domain.length>250)throw new Error('Gültige Domain erforderlich');
 if(!Number.isInteger(Number(port))||Number(port)<1024||Number(port)>65535)throw new Error('Port 1024–65535 erforderlich');
 if(!TARGETS.has(target))throw new Error('Unbekannte Zielumgebung');
 const providerProfile=normalizePlatform({provider,platform,capabilities,profile,region});
 const required=['Bestandsaufnahme und Ressourcengrenzen','Datenklassifizierung und Rechts-/Datenschutzprüfung','Netzwerksegmentierung, minimale Zugriffsrechte und Secrets','Getrennte Staging-Umgebung','Unveränderlicher Build- und Image-Digest','Migrationsprüfung, Backups, unabhängiger Restore-Test','TLS, DNS, Schutzheader und Firewall','SLOs, Monitoring und Alarmierung','Traffic- und Rollforward-/Rollback-Plan','Identitätsgeprüfte Betreiberfreigabe und Ereignisjournal'];
 const plan={schemaVersion:2,id:`DEP-${Date.now()}`,generatedAt:now(),status:'PLAN_ONLY',platform:providerProfile,target,domain,appPort:Number(port),immutableImageDigest:null,checks:required,readiness:{sourceInventory:'UNVERIFIED',secrets:'UNVERIFIED',network:'UNVERIFIED',backups:'UNVERIFIED',restoreDrill:'UNVERIFIED',rollback:'UNVERIFIED',observability:'UNVERIFIED',identityApproval:'UNVERIFIED'},limits:'Kein SSH, API-Aufruf, DNS-Änderung oder Deployment. Plattformabhängige Adapter sind separat zu installieren und freizugeben.'};
 const file=path.join(p.dir,'reports',`deploy-${slug(domain)}-${target}.json`);writeAtomic(file,plan);event(p,'deployment.planned',{file:path.relative(p.root,file),target,platform:providerProfile.type});return {file,plan};
}

export function migrationPlan(p,{source='unknown',destination='generic-vps',data='unknown',capabilities=[],region='unspecified'}={}){
 const platform=normalizePlatform({provider:destination,capabilities,region});
 const plan={schemaVersion:2,generatedAt:now(),source,platform,data,mode:'PLAN_ONLY',phases:[
  {id:'M0',name:'Discovery',check:['Ist-Inventar von Code, Daten, Netzwerk, DNS, Zertifikaten und Abhängigkeiten','Risikoklasse, Datenschutz, Datenflüsse, Ausfallbudget']},
  {id:'M1',name:'Backup & Proof',check:['Konsistenter Snapshot','Unabhängiger Restore und RPO/RTO-Test','Berechtigungs- und Secret-Prüfung']},
  {id:'M2',name:'Staging',check:['Versionierte Migrationen und idempotente Skripte','Probelauf auf isolierten Testdaten','Datenintegrität und negativer Zugriffstest']},
  {id:'M3',name:'Cutover',check:['Freeze/Konsistenzpunkt','Schreibverkehr und Dual-Write-Fallen bewerten','Traffic-Switch mit Beobachtungsfenster','Rollback-Schwelle und Rollforward']},
  {id:'M4',name:'Verification',check:['Hashes/Zeilen-/Objektzählungen','API/UI/Performance/Security Smoke','Monitoring und Alarmierung','Betreiberabnahme']}
 ],blockers:['Ziel und Zugang nicht verifiziert','Datenmigrationsstrategie und Datenkonsistenz unklar','Keine garantierte Rückmigration, wenn nach Umschaltung Daten geschrieben wurden'],neverAuto:['DELETE','DROP','Änderung produktiver DNS-Einträge','Schlüsselrotation','Produktive Datentransfers'],approval:'EXTERNAL_IDENTITY_REQUIRED'};
 const file=path.join(p.dir,'reports','migration-plan.json');writeAtomic(file,plan);event(p,'migration.planned',{file:path.relative(p.root,file),platform:platform.type});return {file,plan};
}
