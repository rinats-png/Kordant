import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {initialize} from '../src/state.mjs';
import {startDashboard} from '../src/dashboard.mjs';

test('dashboard GET read-only on loopback and rejects mutation',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kd-ui-'));initialize(dir,{name:'UI XSS <test>',risk:1});const server=startDashboard(dir,47001);
 try {const data=await fetch('http://127.0.0.1:47001/api/status');assert.equal(data.status,200);const status=await data.json();assert.equal(status.project,'UI XSS <test>');const post=await fetch('http://127.0.0.1:47001/api/status',{method:'POST'});assert.equal(post.status,405);const page=await fetch('http://127.0.0.1:47001/');const markup=await page.text();assert.ok(markup.includes('const esc='));assert.ok(!markup.includes('UI XSS <test>')); }
 finally {await new Promise(res=>server.close(res));}
});
