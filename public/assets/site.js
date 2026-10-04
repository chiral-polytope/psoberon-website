(()=>{
/* Progressive enhancements. All catalog entries are already in the HTML. */
'use strict';
document.documentElement.classList.add('js');
const toggle=document.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));document.querySelector('#primary-nav').classList.toggle('is-open',open);});
const form=document.querySelector('#publication-filters');
if(form){
 const papers=[...document.querySelectorAll('[data-paper]')],total=document.querySelector('#result-count'),empty=document.querySelector('#no-results');
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const readURL=()=>{const u=new URL(location.href);for(const key of ['q','topic','year','status','author'])form.elements.namedItem(key).value=u.searchParams.get(key)||'';const view=u.searchParams.get('view')||'all';const radio=[...form.querySelectorAll('[name=view]')].find(el=>el.value===view);(radio||form.querySelector('[value=all]')).checked=true;};
 const apply=(update=true)=>{const f=new FormData(form),query=normalize(String(f.get('q')||'')).trim().split(/\s+/).filter(Boolean),view=f.get('view');let count=0;
 for(const el of papers){const x=el.dataset;const visible=query.every(term=>x.search.includes(term))&&(!f.get('topic')||x.topics.split(' ').includes(f.get('topic')))&&(!f.get('year')||x.year===f.get('year'))&&(!f.get('status')||x.status===f.get('status'))&&(!f.get('author')||JSON.parse(x.authors).includes(f.get('author')))&&(view==='all'||view==='students'&&x.students==='true'||view==='video'&&x.video==='true'||view==='survey'&&x.type==='survey'||view==='featured'&&x.featured==='true');el.hidden=!visible;if(visible)count++;}
 total.textContent=`${count} of ${papers.length} ${papers.length===1?'paper':'papers'}`;empty.hidden=count!==0;
 if(update){try{const u=new URL(location.href);u.search='';for(const [k,v]of f)if(v&&!(k==='view'&&v==='all'))u.searchParams.set(k,v);history.replaceState(null,'',u);}catch{/* Some browsers disallow history changes for file:// previews. */}}
 };
 readURL();apply(false);form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',()=>apply());form.addEventListener('change',()=>apply());form.addEventListener('reset',()=>setTimeout(()=>apply(),0));addEventListener('popstate',()=>{readURL();apply(false);});
}
for(const wrap of document.querySelectorAll('[data-youtube]'))wrap.querySelector('[data-load-video]')?.addEventListener('click',()=>{const id=wrap.dataset.youtube;if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${id}`;iframe.title=wrap.dataset.title||'Video';iframe.allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';wrap.replaceChildren(iframe);wrap.classList.add('loaded');});
for(const button of document.querySelectorAll('[data-copy]'))button.addEventListener('click',async()=>{const el=document.getElementById(button.dataset.copy);if(!el)return;const status=button.parentElement.querySelector('.copy-status');try{await navigator.clipboard.writeText(el.textContent);status.textContent='Copied.';}catch{const range=document.createRange();range.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(range);status.textContent='Citation selected. Press Ctrl+C or ⌘C to copy.';}});
// Remove expired events in the browser as well as at build time. Rebuild for no-JS clients.
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
for(const el of document.querySelectorAll('[data-event-end]'))if(el.dataset.eventEnd<today)el.remove();
for(const section of document.querySelectorAll('.upcoming'))if(!section.querySelector('[data-event-end]'))section.hidden=true;

})();
