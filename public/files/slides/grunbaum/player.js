/* Offline, dependency-free player. The video is the unchanged approved 1080p file. */
'use strict';
(() => {
  const deck = window.GRUNBAUM_DECK;
  const $ = id => document.getElementById(id);
  const video = $('video'), items = deck.items;
  let index = 0, phase = 'loading', pausedFrom = null, serial = 0;
  let hideTimer, lastAdvance = 0, dialogResume = null, loopCount = 0;
  const fps = deck.fps || 30;
  const safeTime = t => Math.max(0, Math.min(t, video.duration - 1 / fps));
  const visibleDialog = () => document.querySelector('dialog[open]');
  const announce = text => { $('status').textContent = text; };
  function showControls() {
    document.body.classList.remove('hide-chrome');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!visibleDialog() && $('startup').hidden && !document.querySelector('#controls :focus-visible')) {
        document.body.classList.add('hide-chrome');
      }
    }, 2600);
  }
  function update() {
    const item = items[index];
    $('section').textContent = `${item.chapter} · ${item.label}`;
    $('position').textContent = `${index + 1} / ${items.length}`;
    $('previous').disabled = index === 0;
    $('next').disabled = index === items.length - 1 && (phase === 'holding' || phase === 'loop' || phase === 'paused' && pausedFrom === 'loop');
    $('pause').innerHTML = phase === 'paused' ? '▶ <span>Resume</span>' : 'Ⅱ <span>Pause</span>';
    $('pause').disabled = phase === 'holding' || phase === 'loading';
    announce({loading:'Loading…',seeking:'Loading build…',playing:'Playing build',loop:'Looping · next →',holding:'Click to continue',paused:'Motion paused'}[phase] || phase);
    if (index === items.length - 1 && phase === 'loop') announce('Closing gallery · loop');
    try { history.replaceState(null, '', `#build-${index + 1}`); } catch (_) {}
    document.title = `${index + 1}/${items.length} · ${item.label} · Grünbaum`;
  }
  function fail(message) { $('error').textContent = message; $('error').hidden = false; showControls(); }
  function seek(t, token) {
    return new Promise(resolve => {
      const target = safeTime(t);
      if (Math.abs(video.currentTime - target) < .0001 && video.readyState >= 2) { resolve(token === serial); return; }
      let settled = false;
      const finish = () => {
        if (settled) return; settled = true;
        clearTimeout(timer); video.removeEventListener('seeked', done);
        const reached = Math.abs(video.currentTime - target) < .12;
        if (token === serial && !reached) {
          video.pause(); phase = 'paused'; update();
          fail('The browser could not seek to this build. Run python serve.py and open the printed local address, then reload the presentation.');
        }
        resolve(token === serial && reached);
      };
      const done = () => { if (Math.abs(video.currentTime - target) < .1 || token !== serial) finish(); };
      const timer = setTimeout(finish, 5000);
      video.addEventListener('seeked', done);
      try { video.currentTime = target; } catch (_) { finish(); }
    });
  }
  async function play(token) {
    if (token !== serial) return;
    try { await video.play(); if (token !== serial) return; $('startup').hidden = true; }
    catch (error) {
      if (token !== serial || error.name === 'AbortError') return;
      pausedFrom = phase; phase = 'paused'; $('startup').hidden = false; update();
    }
  }
  async function go(n, mode = 'play') {
    if (!Number.isInteger(n) || n < 0 || n >= items.length || !Number.isFinite(video.duration)) return;
    const token = ++serial;
    video.pause(); index = n; loopCount = 0; pausedFrom = null; phase = 'seeking'; update();
    const item = items[n];
    const hold = mode === 'hold';
    const directLoop = item.loop && Math.abs(item.start - item.loop.start) < .05;
    const time = hold ? (item.loop ? item.loop.start : item.end) : directLoop ? item.loop.start : item.start;
    if (!await seek(time, token)) return;
    if (hold && !item.loop) phase = 'holding';
    else if (item.loop && (hold || Math.abs(item.start - item.loop.start) < .05)) phase = 'loop';
    else phase = 'playing';
    update();
    if (phase !== 'holding') await play(token);
  }
  async function finish() {
    const item = items[index], token = ++serial;
    video.pause(); phase = 'seeking'; update();
    if (!await seek(item.loop ? item.loop.start : item.end, token)) return;
    phase = item.loop ? 'loop' : 'holding'; pausedFrom = null; update();
    if (item.loop) await play(token);
  }
  function next() {
    if (!$('startup').hidden) { $('startup').hidden = true; togglePause(); return; }
    if (phase === 'loading' || phase === 'seeking') return;
    const now = performance.now();
    if (now - lastAdvance < 180) return;
    lastAdvance = now;
    if (phase === 'playing' || phase === 'paused' && pausedFrom === 'playing') finish();
    else if (index < items.length - 1) go(index + 1);
  }
  function previous() { if (index > 0) go(index - 1, 'hold'); }
  function replay() { go(index); }
  function togglePause() {
    if (phase === 'playing' || phase === 'loop') { pausedFrom = phase; phase = 'paused'; video.pause(); }
    else if (phase === 'paused') { phase = pausedFrom || (items[index].loop ? 'loop' : 'playing'); play(serial); }
    update();
  }
  async function boundary(mediaTime) {
    if (phase !== 'playing' && phase !== 'loop') return;
    const item = items[index];
    const limit = item.loop ? item.loop.end - 1 / fps : item.end;
    if (mediaTime < limit - .012 && !video.ended) return;
    if (!item.loop) { finish(); return; }
    const token = ++serial;
    video.pause(); phase = 'seeking';
    if (!await seek(item.loop.start, token)) return;
    loopCount++; phase = 'loop'; update(); await play(token);
  }
  if ('requestVideoFrameCallback' in video) {
    const tick = (_, metadata) => { boundary(metadata.mediaTime); video.requestVideoFrameCallback(tick); };
    video.requestVideoFrameCallback(tick);
  } else {
    const tick = () => { boundary(video.currentTime); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  video.addEventListener('timeupdate', () => boundary(video.currentTime));
  video.addEventListener('ended', () => boundary(video.duration));
  video.addEventListener('error', () => fail('The presentation video could not be opened. Extract the entire ZIP, then open START.html. The file assets/presentation.mp4 must stay in its assets folder. You can also run python serve.py and open the printed local address.'));
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen({navigationUI:'hide'});
      else fail('This browser does not expose full-screen mode. Use your browser’s full-screen command.');
    } catch (_) { fail('Full screen was not allowed. Use your browser’s full-screen command or try again with the F key.'); }
  }
  document.addEventListener('fullscreenchange', () => {
    $('fullscreen').innerHTML = document.fullscreenElement ? '⛶ <span>Exit full screen</span>' : '⛶ <span>Full screen</span>';
  });
  function openDialog(id) {
    if (visibleDialog()) return;
    dialogResume = phase === 'playing' || phase === 'loop' ? phase : null;
    if (dialogResume) { video.pause(); pausedFrom = phase; phase = 'paused'; update(); }
    if (id === 'contents') renderContents('');
    $(id).showModal(); showControls();
    if (id === 'contents') { $('search').value = ''; $('search').focus(); }
  }
  function closeDialog(dialog, resume = true) {
    dialog.close();
    if (resume && dialogResume && phase === 'paused') { phase = dialogResume; play(serial); update(); }
    dialogResume = null; $('stage').focus({preventScroll:true}); showControls();
  }
  function renderContents(filter) {
    const list = $('buildList'); list.replaceChildren(); let chapter = '';
    items.forEach((item, i) => {
      if (!`${item.chapter} ${item.label} ${i + 1}`.toLowerCase().includes(filter.toLowerCase())) return;
      if (chapter !== item.chapter) { const h = document.createElement('h2'); h.textContent = item.chapter; list.append(h); chapter = item.chapter; }
      const button = document.createElement('button'); button.textContent = `${i + 1}. ${item.label}`;
      button.className = i === index ? 'active' : '';
      button.onclick = () => { closeDialog($('contents'), false); go(i); };
      list.append(button);
    });
  }
  $('previous').onclick = previous; $('next').onclick = next; $('replay').onclick = replay;
  $('pause').onclick = togglePause; $('fullscreen').onclick = fullscreen;
  $('jump').onclick = () => openDialog('contents'); $('helpButton').onclick = () => openDialog('help');
  $('startButton').onclick = e => { e.stopPropagation(); $('startup').hidden = true; togglePause(); };
  $('search').oninput = e => renderContents(e.target.value);
  document.querySelectorAll('[data-close]').forEach(button => button.onclick = () => closeDialog(button.closest('dialog')));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('cancel', e => { e.preventDefault(); closeDialog(dialog); });
    dialog.addEventListener('click', e => { if (e.target === dialog && (e.clientX < dialog.getBoundingClientRect().left || e.clientX > dialog.getBoundingClientRect().right || e.clientY < dialog.getBoundingClientRect().top || e.clientY > dialog.getBoundingClientRect().bottom)) closeDialog(dialog); });
  });
  $('stage').addEventListener('click', () => {
    if (!$('startup').hidden) { $('startup').hidden = true; togglePause(); return; }
    next();
  });
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || visibleDialog() || ['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const actions = {'arrowright':next,' ':next,'pagedown':next,'enter':next,'arrowleft':previous,'pageup':previous,'backspace':previous,'r':replay,'p':togglePause,'f':fullscreen,'g':()=>openDialog('contents'),'home':()=>go(0),'end':()=>go(items.length-1),'?':()=>openDialog('help'),'h':()=>openDialog('help'),'b':()=>{$('blackout').hidden=!$('blackout').hidden;}};
    if (actions[key]) { e.preventDefault(); actions[key](); }
  });
  document.addEventListener('pointermove', showControls);
  document.addEventListener('focusin', showControls);
  $('controls').addEventListener('click', e => { e.stopPropagation(); e.target.closest('button')?.blur(); showControls(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (phase === 'playing' || phase === 'loop')) { pausedFrom=phase; phase='paused'; video.pause(); update(); }
  });
  window.presenter = {next, previous, replay, go, pause:togglePause, fullscreen, finish,
    get state(){return {index,phase,time:video.currentTime,loopCount,total:items.length,playing:!video.paused};},
    get manifest(){return deck;}};
  video.addEventListener('loadedmetadata', () => {
    if (Math.abs(video.duration - deck.duration) > .12) {
      fail('The video duration differs from this pause map. Rebuild manifest.js after updating the video, as described in README.md.');
      return;
    }
    const match = location.hash.match(/^#build-(\d+)$/);
    const initial = match ? Math.max(0,Math.min(items.length-1, Number(match[1])-1)) : 0;
    go(initial); showControls();
  }, {once:true});
  video.muted = true; video.src = deck.video;
})();
