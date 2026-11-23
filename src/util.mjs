import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const now = () => new Date().toISOString();
export const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
export const slug = value => String(value).normalize('NFKD').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'projekt';
export const exists = p => fs.existsSync(p);
export function mkdir(p) {fs.mkdirSync(p, {recursive: true, mode: 0o700}); return p;}
export function readJson(p, fallback = null) {return exists(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback;}
export function writeAtomic(p, data) {
  mkdir(path.dirname(p));
  const tmp = path.join(path.dirname(p), `.${path.basename(p)}.${process.pid}.${crypto.randomBytes(5).toString('hex')}.tmp`);
  try {fs.writeFileSync(tmp, typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n', {flag:'wx', mode:0o600}); fs.renameSync(tmp, p);} 
  finally {if(exists(tmp)) fs.unlinkSync(tmp);}
}
export function appendJsonl(p, record) {mkdir(path.dirname(p));fs.appendFileSync(p, JSON.stringify(record)+'\n', {mode:0o600});}
export function readJsonl(p) {return exists(p) ? fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l,i)=>{try{return JSON.parse(l)}catch{throw new Error(`Ungültiges JSONL: ${p}:${i+1}`)}}) : [];}
export function within(base, input, {allowBase=false}={}) {
  const root=fs.realpathSync(base);
  const p=path.resolve(root,input);
  const relative=path.relative(root,p);
  if(relative.startsWith('..')||path.isAbsolute(relative)||(!allowBase&&!relative)) throw new Error(`Pfad außerhalb des Projekts: ${input}`);
  // Refuse existing symlink escapes at each component; non-existing subpaths are allowed.
  let cur=root;
  for(const part of relative.split(path.sep).filter(Boolean)) {
    cur=path.join(cur,part);
    if(exists(cur) && fs.lstatSync(cur).isSymbolicLink()) throw new Error(`Symlink nicht erlaubt: ${cur}`);
  }
  return p;
}
export function argumentsOf(argv) {
 const args={_:[]};for(let i=0;i<argv.length;i++) {const x=argv[i]; if(x.startsWith('--')) {const [k,v]=x.slice(2).split('=',2);args[k]=v??(argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:true);}else args._.push(x);}return args;
}
export function fail(message, code=2) {const err = new Error(message);err.exitCode=code;throw err;}
export function loadText(relative) {return fs.readFileSync(path.join(ROOT, relative),'utf8');}
export function stableId(prefix='T') {return `${prefix}-${crypto.randomBytes(5).toString('hex')}`;}
export function safeText(x,max=16000) {return String(x).replace(/(sk_(?:live|test)_[a-zA-Z0-9_\-]+|(?:ghp|gho|ghs)_[a-zA-Z0-9]{20,}|(?:AKIA)[A-Z0-9]{16})/g,'[REDACTED]').slice(0,max);}
export function print(value, json=false) {process.stdout.write((json?JSON.stringify(value,null,2):String(value))+'\n');}
