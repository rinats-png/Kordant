import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from './util.mjs';
import {normalizePlatform} from './infra.mjs';

const DIRECTORY=path.join(ROOT,'infra','profiles');
const ALLOWED_FIELDS=new Set(['schemaVersion','platform','vendor','profile','region','capabilities','status','credentialHandling','approval','notes','operations']);
const OPERATIONS=new Set(['discoverReadOnly','validateConfig','plan','stage','verify','restoreDrill','release','rollback']);

/** Pure manifest validation; never imports a provider's code or executes external commands. */
export function validateProviderProfile(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Providerprofil muss ein JSON-Objekt sein');
 for(const key of Object.keys(value))if(!ALLOWED_FIELDS.has(key))throw new Error(`Unerlaubtes Feld im Providerprofil: ${key}`);
 if(value.schemaVersion!==1)throw new Error('Providerprofil schemaVersion=1 erforderlich');
 if(value.credentialHandling!=='external-secret-manager-only')throw new Error('Zugangsdaten nur aus externem Secret-Manager');
 if(value.approval!=='manual-verified')throw new Error('Externe manuelle Betreiberfreigabe erforderlich');
 if(!['CONFIGURE_PER_PROJECT','DRAFT','REVIEWED'].includes(value.status))throw new Error('Unbekannter Profilstatus');
 const normalized=normalizePlatform({platform:value.platform,vendor:value.vendor??'unspecified',profile:value.profile??'default',region:value.region??'unspecified',capabilities:value.capabilities??[]});
 if(value.notes!==undefined&&(typeof value.notes!=='string'||value.notes.length>2000))throw new Error('Ungültige Profilbeschreibung');
 if(value.operations!==undefined&&(!Array.isArray(value.operations)||new Set(value.operations).size!==value.operations.length||value.operations.some(x=>!OPERATIONS.has(x))))throw new Error('Unzulässige Provideroperation');
 return {schemaVersion:1,...normalized,status:value.status,operations:value.operations??[],approvalRequired:true,executionAvailable:false,note:'Geprüft wurde nur die deklarative Konfiguration, kein Providerzugang oder externer Code.'};
}

export function inspectProviderProfile(file){
 const info=fs.lstatSync(file);
 if(!info.isFile()||info.isSymbolicLink()||info.size>65536)throw new Error('Profil muss eine reguläre JSON-Datei unter 64 KiB sein; keine Symlinks');
 const value=JSON.parse(fs.readFileSync(file,'utf8'));
 return {file:path.basename(file),...validateProviderProfile(value)};
}

export function listProviderPlatforms(){
 return fs.readdirSync(DIRECTORY).filter(x=>x.endsWith('.json')).sort().map(x=>inspectProviderProfile(path.join(DIRECTORY,x)));
}
