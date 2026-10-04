/** Explicit bulk download; resumable and read-only with respect to the live site. */
import fs from 'node:fs';
import path from 'node:path';
import {ROOT,readJSON} from '../src/data.mjs';
import {recoverDocument} from '../src/downloads.mjs';
const args=process.argv.slice(2);
function option(name,defaultValue,min,max){const i=args.indexOf(name);if(i<0)return defaultValue;const value=Number(args[i+1]);if(!Number.isInteger(value)||value<min||value>max)throw new Error(`Invalid ${name}`);return value;}
const timeoutMs=option('--timeout-ms',60000,500,180000), attempts=option('--attempts',2,1,4), workers=option('--concurrency',3,1,6);
const manifest=readJSON('migration/remote-assets.json'), results=manifest.map(a=>({id:a.id,url:a.url,destination:a.destination,status:'pending'})),started=new Date().toISOString();
function save(){const report={started,updated:new Date().toISOString(),results};const f=path.join(ROOT,'migration/download-report.json');fs.writeFileSync(f+'.tmp',JSON.stringify(report,null,2)+'\n');fs.renameSync(f+'.tmp',f);}
let next=0;save();
console.log(`Recovering ${manifest.length} original PDFs. Existing valid files will not be overwritten.`);
await Promise.all(Array.from({length:workers},async()=>{while(next<manifest.length){const i=next++;console.log(`Reading ${i+1}/${manifest.length}: ${manifest[i].title}`);results[i]=await recoverDocument(manifest[i],{root:ROOT,timeoutMs,attempts});save();const r=results[i];console.log(`  ${r.status}${r.error?': '+r.error:''}`);}}));
const available=results.filter(r=>['already-local','downloaded'].includes(r.status)).length;
console.log(`\n${available}/${manifest.length} documents available locally.\nReport: migration/download-report.json\nRun npm run check to rebuild and check the local site.`);
if(available!==manifest.length){console.error('Some files are still missing. Re-running resumes safely; do not change DNS or cancel Wix yet.');process.exitCode=1;}
// All writes above are synchronous and all workers are finished. Do not keep the
// CLI open on a platform with stalled DNS handles after the timeout report.
process.stdout.write('',()=>process.exit(available===manifest.length?0:1));
