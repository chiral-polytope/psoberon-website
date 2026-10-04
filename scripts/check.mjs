import fs from 'node:fs';
import path from 'node:path';
import {ROOT,loadData,missingAssets} from '../src/data.mjs';
import {build} from './build.mjs';
const launch=process.argv.includes('--launch');
try{
 const d=loadData();build({quiet:true});const problems=[];
 const files=[];function scan(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);ent.isDirectory()?scan(p):files.push(p);}}scan(path.join(ROOT,'dist'));
 for(const file of files.filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(file,'utf8');for(const m of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)){const v=m[1].replaceAll('&amp;','&');if(/^(https?:|mailto:|data:|#)/.test(v))continue;const dest=path.resolve(path.dirname(file),v);if(!fs.existsSync(dest))problems.push(`${path.relative(ROOT,file)} → ${v}`);}}
 for(const f of files){if(f.endsWith('.pdf')&&!fs.readFileSync(f).subarray(0,1024).includes(Buffer.from('%PDF-')))problems.push('Invalid PDF header: '+path.relative(ROOT,f));if(fs.statSync(f).size>25*1024*1024)problems.push(`File exceeds Cloudflare Pages 25 MiB limit: ${path.relative(ROOT,f)}. Host large video separately.`);}
 if(launch){
  if(d.site.preview_noindex)problems.push('preview_noindex is still true in content/site.json. Set false for your final public launch.');
  for(const a of missingAssets(d))problems.push(`Missing Wix-only document: ${a.destination}`);
  const signoff=path.join(ROOT,'migration/owner-review.json');
  if(!fs.existsSync(signoff)||JSON.parse(fs.readFileSync(signoff,'utf8')).approved!==true)problems.push('Owner review is not approved. Review migration/CONTENT-REVIEW.md, then set approved=true in migration/owner-review.json.');
 }
 if(problems.length){console.error(problems.map(x=>'• '+x).join('\n'));console.error(`\n${problems.length} check(s) need attention.`);process.exitCode=1;}
 else console.log(`Passed: content validation, all local HTML href/src targets, ${files.length} output files, hosting file-size limit.${launch?' Launch checks passed.':' This is a local check, not a check of external URLs or live deployment.'}`);
}catch(e){console.error(e.message);process.exitCode=1;}
