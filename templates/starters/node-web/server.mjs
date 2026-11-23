import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
export function createServer(){return http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Content-Security-Policy',"default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; style-src 'self'; script-src 'self'; img-src 'self' data:");
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.writeHead(405,{'Allow':'GET'});return res.end('Method Not Allowed');}
 let file;
 if(req.url==='/'||req.url==='/index.html')file='index.html';
 else if(req.url==='/styles.css')file='styles.css';
 else if(req.url==='/app.js')file='app.js';
 else if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({status:'ok',system:'kordant-starter'}));}
 else {res.writeHead(404);return res.end('Not Found');}
 res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8');
 const stream=fs.createReadStream(path.join(here,'public',file));stream.on('error',()=>{if(!res.headersSent)res.writeHead(500);res.end('Server error');});stream.pipe(res);
});}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT??3000);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Bad PORT');
 createServer().listen(port,process.env.HOST??'127.0.0.1',()=>console.log(`Demo: http://127.0.0.1:${port}`));
}
