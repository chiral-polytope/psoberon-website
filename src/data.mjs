/** Read and validate the source records. No network access and no dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STATUSES = ['preprint', 'submitted', 'accepted', 'published'];
export const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const readJSON = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
export function collection(dir) {
  return fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort().map(f => {
    try { return {...readJSON(`${dir}/${f}`), _file: `${dir}/${f}`}; }
    catch (e) { throw new Error(`${dir}/${f}: ${e.message}`); }
  });
}
export function safeURL(value, {local = true, mail = false} = {}) {
  if (typeof value !== 'string') return false;
  if (local && /^\/(?!\/)/.test(value)) {
    try { return !decodeURIComponent(value).split(/[\\/]/).includes('..') && !/[\x00-\x20\\]/.test(value); } catch { return false; }
  }
  try { const u = new URL(value); return ['https:', 'http:', ...(mail ? ['mailto:'] : [])].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}
export const comparePapers = (a,b) => b.year-a.year || (a.sort_order??0)-(b.sort_order??0) || (b.date||'').localeCompare(a.date||'') || a.title.localeCompare(b.title);
export function validate(data) {
  const errors=[]; const fail=(p,m)=>errors.push(`${p._file||p.id||'site'}: ${m}`);
  const ids = new Set(), topicIDs = new Set(data.topics.map(t=>t.id));
  const validDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v;
  for(const p of data.allPapers) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id||'')) fail(p,'id must be a lowercase hyphenated slug');
    if(ids.has(p.id)) fail(p,'duplicate paper id'); ids.add(p.id);
    if(p._file && path.basename(p._file,'.json')!==p.id) fail(p,'filename must equal id + .json');
    if(typeof p.title!=='string'||!p.title.trim()) fail(p,'title is required');
    if(!Array.isArray(p.authors)||!p.authors.length||p.authors.some(a=>typeof a!=='string'||!a.trim())) fail(p,'authors must be a nonempty array of names');
    if(!Number.isInteger(p.year)||p.year<1900||p.year>2200) fail(p,'year must be an integer from 1900 to 2200');
    if(!STATUSES.includes(p.status)) fail(p,`status must be one of ${STATUSES.join(', ')}`);
    if(!['research','survey'].includes(p.type)) fail(p,'type must be research or survey');
    if(!Array.isArray(p.topics)||p.topics.some(t=>!topicIDs.has(t))) fail(p,'unknown topic; edit content/topics.json to add a topic');
    if(!Array.isArray(p.student_authors)||p.student_authors.some(a=>!p.authors?.includes(a))) fail(p,'student_authors must be an array of exact names from authors');
    if(p.arxiv && !/^(\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(v\d+)?$/.test(p.arxiv)) fail(p,'arxiv must be an ID, not a URL');
    if(p.doi && !/^10\.\d{4,9}\/[^\s]+$/.test(p.doi)) fail(p,'doi must be a DOI, not a URL');
    if(p.date&&!validDate(p.date)) fail(p,'date must be YYYY-MM-DD');
    for(const k of ['pdf','image','notice_source','abstract_source','summary_source']) if(p[k]&&!safeURL(p[k])) fail(p,`${k} must be a safe URL or root-relative path`);
    for(const r of p.resources||[]) if(!r.label||!safeURL(r.url)) fail(p,'resource needs label and safe url');
    if(p.agent_note?.text && p.agent_note.attribution!=='author') fail(p,'agent_note must be explicitly attributed to author');
    if(p.agent_note?.updated&&!validDate(p.agent_note.updated)) fail(p,'agent_note.updated must be YYYY-MM-DD');
    for(const k of ['methods','related_problems','related_papers']) if(p[k]!==undefined && (!Array.isArray(p[k])||p[k].some(v=>typeof v!=='string'))) fail(p,`${k} must be a string array`);
    for(const k of ['draft','featured']) if(p[k]!==undefined && typeof p[k]!=='boolean') fail(p,`${k} must be true or false`);
  }
  const publicIDs=new Set(data.allPapers.filter(p=>!p.draft).map(p=>p.id));
  for(const p of data.allPapers) for(const id of p.related_papers||[]) if(!ids.has(id)||(!p.draft&&!publicIDs.has(id))) fail(p,`related paper is missing or unpublished: ${id}`);
  const videoIDs = new Set();
  for(const v of data.allVideos) {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.id||'')) fail(v,'invalid video id');
    if(videoIDs.has(v.id)) fail(v,'duplicate video id');videoIDs.add(v.id);
    if(!v.title||!Number.isInteger(v.year)) fail(v,'title and integer year required');
    if(!['talk','paper-explainer'].includes(v.kind)) fail(v,'kind must be talk or paper-explainer');
    if(v.date&&!validDate(v.date)) fail(v,'invalid date');
    if(!Array.isArray(v.papers)||v.papers.some(id=>!ids.has(id)||(!v.draft&&!publicIDs.has(id)))) fail(v,'papers must reference existing public paper IDs');
    if(!Array.isArray(v.topics)||v.topics.some(t=>!topicIDs.has(t))) fail(v,'topics must use the central topic IDs');
    if(v.video) {
      if(!['youtube','file','link'].includes(v.video.type)) fail(v,'video.type must be youtube, file, or link');
      if(v.video.type==='youtube'&&!/^[A-Za-z0-9_-]{11}$/.test(v.video.id||'')) fail(v,'YouTube ID must contain exactly 11 characters');
      if(['file','link'].includes(v.video.type)&&!safeURL(v.video.url)) fail(v,'video.url is invalid');
      if(v.video.poster&&!safeURL(v.video.poster)) fail(v,'video.poster is invalid');
      for(const c of v.video.captions||[]) if(!safeURL(c.url)||!c.language||!c.label) fail(v,'caption needs safe url, language and label');
    }
    if(v.slides&&!safeURL(v.slides))fail(v,'slides URL invalid');
  }
  for(const n of data.allNotes) {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(n.id||'')||!n.title||!validDate(n.date))fail(n,'note needs id, title, YYYY-MM-DD date');
    if(!Array.isArray(n.topics)||n.topics.some(t=>!topicIDs.has(t)))fail(n,'unknown note topic');
    if(n.pdf&&!safeURL(n.pdf))fail(n,'invalid note PDF');
  }
  if(!safeURL(data.site.url,{local:false})) errors.push('content/site.json: invalid canonical url');
  for(const [label,url] of [['portrait',data.site.portrait],['desktop_background',data.site.desktop_background],['home_artwork.image',data.site.home_artwork?.image]])
    if(typeof url!=='string'||!/^\/images\/[a-zA-Z0-9_./-]+$/.test(url)||url.split('/').includes('..')) errors.push('content/site.json: '+label+' must be a safe /images/ path');
  if(!data.site.home_artwork?.title||!data.site.home_artwork?.alt) errors.push('content/site.json: artwork title and alt text are required');
  if(!Array.isArray(data.about?.institutions)||data.about.institutions.some(x=>!x.name||!x.location)) errors.push('content/about-details.json: institutions need names and locations');
  if(!Array.isArray(data.about?.education)||data.about.education.some(x=>!x.institution||!x.dates||!safeURL(x.logo))) errors.push('content/about-details.json: education records are incomplete');
  if(!safeURL(data.about?.soberonita?.image)||!data.about?.soberonita?.description||!data.about?.soberonita?.alt) errors.push('content/about-details.json: sculpture image, alt text and description are required');
  if(!data.about?.quote?.text||!data.about?.quote?.author) errors.push('content/about-details.json: quote and attribution are required');
  if(typeof data.site.preview_noindex!=='boolean') errors.push('content/site.json: preview_noindex must be true or false');
  for(const t of data.topics) if(!t.id||!t.title)fail(t,'topic requires id and title');
  for(const e of data.events){if(!validDate(e.start)||!validDate(e.end)||e.end<e.start)fail(e,'event date range invalid');if(!safeURL(e.url))fail(e,'invalid event URL');}
  if(errors.length) throw new Error(`Content validation failed:\n${errors.map(e=>'  • '+e).join('\n')}`);
  return true;
}
export function loadData(){
  const d={site:readJSON('content/site.json'),about:readJSON('content/about-details.json'),topics:readJSON('content/topics.json'),allPapers:collection('content/papers'),allVideos:collection('content/videos'),allNotes:collection('content/notes'),events:readJSON('content/events.json'),courses:readJSON('content/courses.json'),books:readJSON('content/books.json'),reading:readJSON('content/reading.json'),assets:readJSON('migration/remote-assets.json')};
  validate(d);d.papers=d.allPapers.filter(p=>!p.draft).sort(comparePapers);d.videos=d.allVideos.filter(p=>!p.draft).sort((a,b)=>b.year-a.year||(b.date||'').localeCompare(a.date||''));d.notes=d.allNotes.filter(p=>!p.draft).sort((a,b)=>b.date.localeCompare(a.date));
  d.topicMap=Object.fromEntries(d.topics.map(t=>[t.id,t]));return d;
}
export const missingAssets = d => d.assets.filter(a=>!fs.existsSync(path.join(ROOT,a.destination)));
export function assetURL(d,id) {
  const a=d.assets.find(a=>a.id===id);if(!a)throw new Error(`Unknown document asset: ${id}`);
  return fs.existsSync(path.join(ROOT,a.destination)) ? '/'+a.destination.replace(/^public\//,'') : a.url;
}
export const paperVideos = (d,p) => d.videos.filter(v=>v.papers.includes(p.id));
export const hasVideo = (d,p) => paperVideos(d,p).some(v=>!!v.video);
export function publicPaper(d,p){
  // Allowlist: never publish _file, provenance, drafts, or arbitrary editorial fields.
  const r={id:p.id,title:p.title,authors:p.authors,year:p.year,status:p.status,type:p.type,reference:p.reference||'',topics:p.topics,student_authors:p.student_authors,featured:!!p.featured,url:`${d.site.url}/papers/${p.id}/`,arxiv:p.arxiv||null,doi:p.doi||null,pdf:p.pdf||null,abstract:p.abstract||'',summary:p.summary||'',methods:p.methods||[],related_problems:p.related_problems||[],resources:p.resources||[],videos:paperVideos(d,p).filter(v=>v.video).map(v=>({title:v.title,...v.video,url:v.video.type==='youtube'?`https://www.youtube.com/watch?v=${v.video.id}`:v.video.url}))};
  if(p.date)r.date=p.date;
  if(p.publication_year)r.publication_year=p.publication_year;
  if(p.notice){r.notice=p.notice;r.notice_source=p.notice_source;}
  if(p.agent_note?.text?.trim())r.author_context={attribution:'author',author:d.site.name,text:p.agent_note.text,updated:p.agent_note.updated||null};
  return r;
}
