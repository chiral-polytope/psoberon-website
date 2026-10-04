/** Shared local images: accurate dimensions and build-time cache busting. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {ROOT} from './data.mjs';

export function imageDimensions(b) {
  if (b.length >= 24 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
    return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
  if (b.length >= 4 && b[0]===0xff && b[1]===0xd8) {
    let i=2;
    const sof=new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
    while (i+3<b.length) {
      if(b[i++]!==0xff) continue;
      while(b[i]===0xff) i++;
      const marker=b[i++];
      if(marker===0xd9||marker===0xda) break;
      if(marker===0x01||(marker>=0xd0&&marker<=0xd8)) continue;
      if(i+2>b.length) break;
      const length=b.readUInt16BE(i);
      if(length<2||i+length>b.length) break;
      if(sof.has(marker)&&length>=7) return {height:b.readUInt16BE(i+3),width:b.readUInt16BE(i+5)};
      i+=length;
    }
  }
  if(b.length>=30&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP') {
    const type=b.toString('ascii',12,16);
    if(type==='VP8X') return {width:1+b.readUIntLE(24,3),height:1+b.readUIntLE(27,3)};
    if(type==='VP8L'&&b[20]===0x2f) return {width:1+((b[21]|(b[22]<<8))&0x3fff),height:1+(((b[22]>>6)|(b[23]<<2)|(b[24]<<10))&0x3fff)};
    if(type==='VP8 '&&b[23]===0x9d&&b[24]===0x01&&b[25]===0x2a) return {width:b.readUInt16LE(26)&0x3fff,height:b.readUInt16LE(28)&0x3fff};
  }
  return {};
}
export function localImage(url) {
  if(typeof url!=='string'||!/^\/images\/[a-zA-Z0-9_./-]+$/.test(url)||url.split('/').includes('..'))
    throw new Error('Shared images must use a safe /images/ path: '+url);
  const file=path.join(ROOT,'public',url);
  const b=fs.readFileSync(file);
  return {...imageDimensions(b),url:url+'?v='+crypto.createHash('sha256').update(b).digest('hex').slice(0,12)};
}
