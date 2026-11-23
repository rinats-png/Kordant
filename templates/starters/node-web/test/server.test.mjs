import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server.mjs';
test('health check and restricted methods',async()=>{const server=createServer().listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const url=`http://127.0.0.1:${server.address().port}`;try{const x=await fetch(url+'/health');assert.equal(x.status,200);assert.equal((await x.json()).status,'ok');const post=await fetch(url+'/health',{method:'POST'});assert.equal(post.status,405);const path=await fetch(url+'/../secret');assert.equal(path.status,404);const main=await fetch(url+'/');assert.equal(main.status,200);assert.equal(main.headers.get('x-content-type-options'),'nosniff');}finally{await new Promise(resolve=>server.close(resolve));}});
