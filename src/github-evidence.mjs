/** Optional remote observation only: requires explicit token passed by caller; never writes to GitHub. */
const isSha=s=>/^[0-9a-f]{40}$/i.test(s??'');
const isOwnerRepo=s=>/^[a-zA-Z0-9_.-]{1,100}$/.test(s??'')&&!s.startsWith('.')&&!s.endsWith('.');
export async function observeGitHubChecks({owner,repo,sha,token,fetchImpl=fetch,timeoutMs=10000}={}){
 if(!isOwnerRepo(owner)||!isOwnerRepo(repo)||!isSha(sha))throw new Error('GitHub Owner/Repo/SHA ungültig');if(!token||token.length<10)throw new Error('Expliziter GitHub-Token erforderlich (nicht im Repository speichern)');
 if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>30000)throw new Error('Timeout ungültig');const url=`https://api.github.com/repos/${owner}/${repo}`;
 const get=async endpoint=>{
  const ctl=new AbortController();const timeout=setTimeout(()=>ctl.abort(),timeoutMs);
  try{const res=await fetchImpl(`${url}${endpoint}`,{method:'GET',headers:{'Authorization':`Bearer ${token}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'kordant-check-reader'},signal:ctl.signal,redirect:'error'});
   if(!res.ok)throw new Error(`GitHub status ${res.status} – keine Credentials in Fehlertext`);const json=await res.json();return json;
  }finally{clearTimeout(timeout);}
 };
 const [status,runs]=await Promise.all([get(`/commits/${sha}/status`),get(`/actions/runs?head_sha=${sha}&per_page=30`)]);
 const workflows=(runs.workflow_runs??[]).filter(x=>x.head_sha===sha).map(x=>({id:x.id,name:x.name,status:x.status,conclusion:x.conclusion,created_at:x.created_at,html_url:x.html_url}));
 const statuses=(status.statuses??[]).map(x=>({context:x.context,state:x.state,created_at:x.created_at,target_url:x.target_url}));
 return {provider:'github',owner,repo,sha,observedAt:new Date().toISOString(),combinedStatus:status.state??'unknown',checks:statuses,workflows,reportedSuccessful:workflows.length>0&&workflows.every(x=>x.status==='completed'&&x.conclusion==='success')&&statuses.every(x=>x.state==='success'),limitations:'Provider-Antwort zum Abrufzeitpunkt, ohne unabhängige Signaturverifikation. Keine Aussage über Artefaktidentität oder Testabdeckung.'};
}
