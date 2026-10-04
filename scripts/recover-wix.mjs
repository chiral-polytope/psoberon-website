/** One command: recover documents, rebuild links, and run local checks. */
import {spawnSync} from 'node:child_process';
import {ROOT} from '../src/data.mjs';
let failed=false;
for(const [script,args] of [['scripts/import-wix.mjs',process.argv.slice(2)],['scripts/check.mjs',[]]]) {
 const r=spawnSync(process.execPath,[script,...args],{cwd:ROOT,stdio:'inherit'});
 if(r.error){console.error(r.error.message);failed=true;} else if(r.status!==0) failed=true;
}
console.log(failed?'The preview has been rebuilt, but check the reported download/check failures. Wix is unchanged.':'Recovery and local checks completed. Open START-HERE.html to view the local documents. Wix is unchanged.');
process.exitCode=failed?1:0;
