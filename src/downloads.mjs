/** Recover original PDF bytes. Source reads only; never publishes or changes Wix. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const isPDF = b => b.length > 100 && b.subarray(0,1024).includes(Buffer.from('%PDF-')) && b.subarray(Math.max(0,b.length-4096)).includes(Buffer.from('%%EOF'));
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');

export async function recoverDocument(asset, {root, fetchImpl=fetch, timeoutMs=60000, attempts=2}={}) {
  const info={id:asset.id,url:asset.url,destination:asset.destination};
  let dest;
  try {
    dest=path.resolve(root,asset.destination);
    if(!dest.startsWith(path.join(root,'public','files')+path.sep)||!dest.endsWith('.pdf')) throw new Error('Unsafe destination');
    const u=new URL(asset.url);
    if(u.protocol!=='https:'||u.hostname!=='www.psoberon.com'||!u.pathname.startsWith('/_files/ugd/')) throw new Error('Unexpected source URL');
    if(fs.existsSync(dest)) {
      const b=fs.readFileSync(dest);
      return isPDF(b)?{...info,status:'already-local',bytes:b.length,sha256:sha256(b)}:{...info,status:'invalid-existing-file',error:'Existing file was not overwritten; it lacks a PDF header or end marker.'};
    }
  } catch(e) {return {...info,status:'failed',error:e.message};}
  let error='Download failed';
  for(let attempt=1;attempt<=attempts;attempt++) {
    try {
      const res=await fetchImpl(asset.url,{redirect:'follow',signal:AbortSignal.timeout(timeoutMs)});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      if(Number(res.headers.get('content-length'))>100*1024*1024) throw new Error('Response is unexpectedly larger than 100 MiB');
      const b=Buffer.from(await res.arrayBuffer());
      if(!isPDF(b)) throw new Error('Response lacks a PDF header or end marker; no file was saved.');
      fs.mkdirSync(path.dirname(dest),{recursive:true});
      fs.writeFileSync(dest,b,{flag:'wx'});
      return {...info,status:'downloaded',attempt,bytes:b.length,sha256:sha256(b)};
    } catch(e) {
      error=[e.message,e.cause?.code,e.cause?.message].filter(Boolean).join(' — ');
      if(e.code==='EEXIST') break;
      if(attempt<attempts) await new Promise(r=>setTimeout(r,500));
    }
  }
  return {...info,status:'failed',error};
}
