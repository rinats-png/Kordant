import {spawnSync} from 'node:child_process';
import {exists,ROOT} from './util.mjs';
import {providerAvailability} from './runner.mjs';
export function doctor(){const commands=['git','node','docker','ssh','restic','caddy'];return {node:process.version,nodeOk:Number(process.versions.node.split('.')[0])>=22,os:process.platform,commands:commands.map(x=>{const r=spawnSync(process.platform==='win32'?'where':'which',[x],{encoding:'utf8',timeout:3000});return {command:x,available:r.status===0};}),agents:providerAvailability(),repo:ROOT,disclaimer:'Fehlende optionale Werkzeuge verhindern nicht die lokale Kern-CLI; externe Dienste und Server wurden nicht kontaktiert.'};}
