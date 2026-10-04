/** Local, read-only server. Binds only to loopback; no upload or write endpoints. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/data.mjs';
import {build} from './build.mjs';
const watch=process.argv.includes('--watch');
const portArg=process.argv.indexOf('--port');
const PORT=Number(portArg>=0?process.argv[portArg+1]:4321);
if(!Number.isInteger(PORT)||PORT<1||PORT>65535)throw new Error('Use a valid --port number.');
build();
let generation=0,lastError='',rebuilding=false;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.bib':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.mp4':'video/mp4','.webm':'video/webm','.vtt':'text/vtt; charset=utf-8'};
const liveScript=`<script>(()=>{let current=${generation};let failed=false;setInterval(async()=>{try{const data=await(await fetch('/__dev/status',{cache:'no-store'})).json();if(data.error){if(!failed){console.error(data.error);failed=true;}}else if(data.generation!==current)location.reload();}catch{}},1000)})();</script>`;
const server=http.createServer((req,res)=>{
 const allowedHosts=new Set([`localhost:${PORT}`,`127.0.0.1:${PORT}`]);
 if(!allowedHosts.has(req.headers.host)){res.writeHead(403);return res.end('Loopback host required.');}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end('Read-only preview server.');}
 let name;
 try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Invalid path.');}
 if(name==='/__dev/status'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({generation,error:lastError}));}
 if(name.includes('\0')||name.includes('\\')||name.split('/').includes('..')){res.writeHead(400);return res.end('Invalid path.');}
 const root=name.startsWith('/__editor/')?path.join(ROOT,'tools'):path.join(ROOT,'dist');
 let rel=name.startsWith('/__editor/')?name.slice('/__editor/'.length):name.slice(1);
 if(name.startsWith('/__editor/')&&!['editor.html','editor.js','editor-data.js','editor.css'].includes(rel)){res.writeHead(404);return res.end('Not found.');}
 let file=path.resolve(root,rel);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end('Forbidden.');}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 let code=200;
 if(!fs.existsSync(file)){file=path.join(ROOT,'dist','404.html');code=404;}
 const ext=path.extname(file),headers={'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 if(ext==='.html'&&watch){let html=fs.readFileSync(file,'utf8');const live=liveScript.replace(`let current=0`,`let current=${generation}`);html=html.replace('</body>',live+'</body>');res.writeHead(code,headers);return res.end(req.method==='HEAD'?'':html);}
 const size=fs.statSync(file).size;
 // Range requests make locally hosted video seekable in the preview server.
 if(req.headers.range&&['.mp4','.webm','.pdf'].includes(ext)){
  const m=req.headers.range.match(/^bytes=(\d*)-(\d*)$/);
  if(m){const start=m[1]?Number(m[1]):Math.max(0,size-Number(m[2])),end=m[1]?(m[2]?Math.min(Number(m[2]),size-1):size-1):size-1;
  if(start>=size||start>end){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
  res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});if(req.method==='HEAD')return res.end();return fs.createReadStream(file,{start,end}).pipe(res);}
 }
 res.writeHead(code,{...headers,'Content-Length':size,'Accept-Ranges':'bytes'});if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${PORT} is in use. Try npm run dev -- --port 4322`:e.message);process.exitCode=1;server.close();});
server.listen(PORT,'127.0.0.1',()=>console.log(`\nPreview: http://localhost:${PORT}\nContent editor: http://localhost:${PORT}/__editor/editor.html\n${watch?'Watching content/ and public/. Save a source file to rebuild and reload.':'Read-only preview. Rebuild after editing.'}\nStop with Ctrl+C. Nothing is published online.\n`));
const watchers=[];let timer;
if(watch)for(const dir of ['content','public'])try{watchers.push(fs.watch(path.join(ROOT,dir),{recursive:true},()=>{clearTimeout(timer);timer=setTimeout(()=>{if(rebuilding)return;rebuilding=true;try{build({quiet:true});generation++;lastError='';console.log('Rebuilt at '+new Date().toLocaleTimeString());}catch(e){lastError=e.message;console.error(e.message);}finally{rebuilding=false;}},300);}));}catch(e){console.warn(`Automatic watching unavailable: ${e.message}. Run npm run build after saving.`);}
process.on('SIGINT',()=>{watchers.forEach(w=>w.close());server.close(()=>process.exit(0));});
