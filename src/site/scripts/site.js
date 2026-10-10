/* ============================================================================
   dumb.co -- the window, the phone, the duck, routing.

   Runs on every page. The pages themselves are built by Astro
   (src/pages/, src/site/) with every section already in the HTML; this
   script is what makes them move: the .exe window, the handset and its keys,
   snake, the duck, and moving between sections without a page load.

   It was the redesign prototype's inline script (redesign_2026/build/), and
   it still talks to the markup through inline onclick="..." handlers, so the
   functions those call are put on window at the bottom of this file.

   SITE is the little bit of data it needs that isn't in the markup: image
   URLs for the carousels and the memories viewer, the routes, the checkout
   link. Written into each page by src/site/Site.astro.
   ============================================================================ */
const SITE = JSON.parse(document.getElementById('site-data').textContent);


  /* ---------------- carousel ---------------- */
  const carouselImgs = SITE.heroes;
  let carIdx = 0;
  function renderCarousel(){
    document.getElementById('wm-img').src = carouselImgs[carIdx];
    const dots = document.getElementById('wm-dots');
    dots.innerHTML = carouselImgs.map((_,i)=>`<span class="wm-dot ${i===carIdx?'on':''}" onclick="event.stopPropagation(); goToSlide(${i})"></span>`).join('');
  }
  function carouselStep(dir){ carIdx = (carIdx + dir + carouselImgs.length) % carouselImgs.length; renderCarousel(); }
  function goToSlide(i){ carIdx = i; renderCarousel(); }
  renderCarousel();

  function collapseModal(){
    // 1) modal shrinks/rotates down into the egg's resting spot (CSS transition on .collapsed)
    document.getElementById('winmodal').classList.add('collapsed');
    // 2) once that finishes, the egg pops in there and settles/slides up into place —
    //    a visible cue that it's still around if you want to reopen it
    setTimeout(()=>{
      const egg = document.getElementById('egg');
      egg.classList.add('show');
      egg.classList.add('pop');
      egg.addEventListener('animationend', ()=> egg.classList.remove('pop'), {once:true});
      startDuckWalk();
    }, 460);
  }
  function expandModal(){
    stopDuckWalk();
    document.getElementById('egg').classList.remove('show', 'pop');
    document.getElementById('winmodal').classList.remove('collapsed');
  }

  /* ---------------- drag + resize for the modal (both bottom corners) ---------------- */
  const win = document.getElementById('winmodal');
  const bar = document.getElementById('wm-drag');
  let dragging=false, ox=0, oy=0, resizeMode=null, anchorRight=0, anchorTop=0;
  bar.addEventListener('mousedown', (e)=>{
    if(e.target.classList.contains('wm-x')) return;
    dragging=true;
    const r = win.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    document.body.style.userSelect='none';
    e.preventDefault();
  });
  /* The window was clamped while RESIZING but not while MOVING, so it could
     be dragged left over the sidebar and guillotine the logo and the whole
     nav (Kunal: "the dumb.co logo is cut off ... move it up a layer").
     Raising the sidebar instead would park an opaque 400px yellow column in
     front of the window, which is worse, so the window is stopped at the
     sidebar's INK rather than its column: --nav-ink is what navInk()
     measured, so the stop sits where the drawing ends, not where the box
     does, and the gap stays even. Also clamped at the top and right, so the
     title bar can never be dragged somewhere you can't grab it back. */
  function dragBounds(){
    const bar = document.getElementById('sidebar');
    const shown = bar && getComputedStyle(bar).display !== 'none';
    const ink = parseFloat(getComputedStyle(document.documentElement)
                  .getPropertyValue('--nav-ink')) || 0;
    return { minLeft: (shown && ink) ? Math.round(ink) + 14 : 4 };
  }
  window.addEventListener('mousemove', (e)=>{
    if(dragging){
      const minLeft = dragBounds().minLeft;
      const maxLeft = window.innerWidth  - 140;
      const maxTop  = window.innerHeight - 60;
      win.style.left = Math.max(minLeft, Math.min(maxLeft, e.clientX - ox)) + 'px';
      win.style.top  = Math.max(4,       Math.min(maxTop,  e.clientY - oy)) + 'px';
    }
    if(resizeMode === 'br'){
      const r = win.getBoundingClientRect();
      // clamp so the window (and its resize handle) can never be dragged past
      // the right/bottom edge of the viewport and become unreachable
      const maxW = window.innerWidth - r.left - 4;
      const maxH = window.innerHeight - anchorTop - 4;
      win.style.width = Math.max(340, Math.min(maxW, e.clientX - r.left)) + 'px';
      win.style.height = Math.max(280, Math.min(maxH, e.clientY - anchorTop)) + 'px';
    }
    if(resizeMode === 'bl'){
      // clamp so the left edge can't cross x=0 and the window can't grow
      // taller than the remaining viewport below its top edge
      const maxW = anchorRight - 4;
      const maxH = window.innerHeight - anchorTop - 4;
      const newWidth = Math.max(340, Math.min(maxW, anchorRight - e.clientX));
      win.style.width = newWidth + 'px';
      win.style.left = (anchorRight - newWidth) + 'px';
      win.style.height = Math.max(280, Math.min(maxH, e.clientY - anchorTop)) + 'px';
    }
  });
  window.addEventListener('mouseup', ()=>{
    dragging=false; resizeMode=null; document.body.style.userSelect='';
  });
  document.getElementById('wm-resize').addEventListener('mousedown', (e)=>{
    resizeMode='br'; const r = win.getBoundingClientRect(); anchorTop = r.top;
    document.body.style.userSelect='none'; e.preventDefault(); e.stopPropagation();
  });
  document.getElementById('wm-resize-bl').addEventListener('mousedown', (e)=>{
    resizeMode='bl'; const r = win.getBoundingClientRect(); anchorRight = r.right; anchorTop = r.top;
    document.body.style.userSelect='none'; e.preventDefault(); e.stopPropagation();
  });

  /* ---------------- sections ----------------
     The sections are rendered into every page at build time (Astro,
     src/site/sections/*.astro): the one this address is for inside the
     window, every one of them in a <template>. Opening a section copies its
     template in, so moving between them never waits on the network and the
     markup lives in one place. */
  const DUMBPHONE_CHECKOUT = SITE.checkout;
  const SHOP_PHOTOS = SITE.shopPhotos;
  const MEMORY_EVENTS = SITE.memories;
  const ROUTES = SITE.routes;
  const A = { dpadCluster: SITE.dpadCluster };

  /* for the bits drawn in the browser (the memories viewer, live reviews) */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  function rich(s){
    return esc(s)
      .replace(/\*\*\*(.+?)\*\*\*/g, '<b>$1</b>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
        if(u === 'plans') return `<a href="#" onclick="event.preventDefault(); showPlans();">${t}</a>`;
        const raw = u.replace(/&amp;/g, '&');
        if(/^(mailto|tel):/i.test(raw)) return `<a href="${u}">${t}</a>`;
        if(/^https?:\/\//i.test(raw)) return `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
        return t;
      })
      .replace(/\n/g, '<br/>');
  }
  const paras = (s, cls) => String(s || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    .map(p => `<p${cls ? ` class="${cls}"` : ''}>${rich(p)}</p>`).join('');
  const starRow = (n) => `<span class="stars">${"★".repeat(n)}${"☆".repeat(5-n)}</span>`;

  const sections = Object.fromEntries(Object.keys(ROUTES).map(key => [key, () => {
    const t = document.getElementById('tpl-' + key);
    return t ? t.innerHTML : '';
  }]));

  /* ==========================================================================
     v8 — one window, reused
     Nav items no longer spawn pop-ups. They retitle and refill #winmodal, which
     is the same frame flipoff.exe lives in on the home state. The .exe names
     below are the ones written on the mock-up slides, all lowercase (Jack,
     Oct 9: "Community.exe is community.exe").
     ========================================================================== */
  const EXE = {
    home:     "flipoff.exe",
    about:    "about.exe",
    shop:     "shop.exe",
    community: "community.exe",
    press:    "press.exe",
    memories: "memories.exe",
    faq:      "faq.exe",
    contact:  "contact.exe",
    quiz:     "quiz.exe",
  };

  /* optional per-section size caps; anything not listed uses the defaults in
     sizeForSection. Contact is deliberately small. */
  const SIZE = {
    contact: { w: 680, h: 560 },
  };

  const winEl     = () => document.getElementById('winmodal');
  const titleEl   = () => document.querySelector('#wm-drag span:first-child');
  const sectionEl = () => document.getElementById('wm-section');

  let openKey = null;   // which section the window is showing

  function setExeTitle(key){ titleEl().textContent = EXE[key] || EXE.home; }

  /* Sections are denser than the carousel, so the window grows when one opens —
     still clamped to leave the sidebar nav clickable. */
  /* The window sits to the RIGHT of the hero, never over it. The hero column
     ends at 46vw (see #home), so the window starts at 47vw and runs to ~98vw. */
  const SPLIT = 0.47;
  function sizeForSection(cfg){
    const w = winEl();
    const vw = window.innerWidth, vh = window.innerHeight;
    if(vw < 1000){
      w.style.left = '10px'; w.style.top = '10px';
      w.style.width = (vw - 20) + 'px'; w.style.height = (vh - 20) + 'px';
      return;
    }
    const left   = Math.round(vw * SPLIT);
    const width  = Math.min(cfg?.w ?? 940, vw - left - 30);
    const height = Math.min(cfg?.h ?? 820, vh - 48);
    w.style.left = left + 'px';
    w.style.top = Math.round((vh - height) / 2) + 'px';
    w.style.width = width + 'px';
    w.style.height = height + 'px';
  }

  /* flipoff.exe gets the same frame the sections do, worked out fresh from
     the viewport every time. (Jack, Oct 9: "the homepage version of the
     modal is scrunched ... make it expand and function like the other
     modals, like the community one".) It used to be put back from a
     snapshot taken the first time a section opened -- so open About in a
     narrow window, widen the browser, go home, and flipoff.exe came back at
     the narrow size, a 330px strip over the headline. Below 1000px the
     stylesheet places it (29_responsive.css), so the inline box is cleared
     rather than fought with. */
  function placeHome(){
    const w = winEl();
    if(window.innerWidth < 1000){
      w.style.left = w.style.top = w.style.width = w.style.height = '';
      return;
    }
    sizeForSection(null);
  }

  function openSection(key){
    if(!sections[key]) return;
    if(typeof stopSnake === 'function') stopSnake();
    /* the duck only walks while the window is in the egg; opening a section
       from that state used to leave it walking over the open window */
    if(typeof stopDuckWalk === 'function') stopDuckWalk();

    const w = winEl();
    // if it was collapsed into the egg, bring it back
    document.getElementById('egg').classList.remove('show', 'pop');
    w.classList.remove('collapsed');

    w.classList.add('sectionmode');
    setExeTitle(key);
    sizeForSection(SIZE[key]);

    const host = sectionEl();
    host.className = '';
    const BLEED = ['about', 'press', 'shop', 'community', 'contact'];   // these draw their own edge-to-edge blocks
    host.innerHTML = '<div class="wm-pad' + (BLEED.includes(key) ? ' bleed' : '') + '">'
                   + sections[key]() + '</div>';
    host.scrollTop = 0;

    document.querySelectorAll('.navitem').forEach(el => {
      el.classList.toggle('active', el.dataset.key === key);
    });
    openKey = key;
    if(key === 'faq') loadFaq();
    if(key === 'shop' && typeof loadReviews === 'function') loadReviews();
    if(key === 'shop' && typeof plansDrawer === 'function') plansDrawer();
  }

  function goHome(){
    openKey = null;
    if(typeof stopSnake === 'function') stopSnake();
    const w = winEl();
    w.classList.remove('sectionmode');
    setExeTitle('home');
    sectionEl().innerHTML = '';
    placeHome();
    document.getElementById('egg').classList.remove('show', 'pop');
    w.classList.remove('collapsed');
    document.querySelectorAll('.navitem').forEach(el => el.classList.remove('active'));
  }

  /* Month Offline is NOT an .exe. It's a real <a> in the nav pointing at the
     existing MO site (see MONTH_OFFLINE_URL in build.py, which matches
     src/Phone/Screen.tsx). It used to call window.open() and browsers blocked
     it silently, so the nav item did nothing and whatever section was already
     open just stayed in the window. A plain link can't be blocked, and it also
     gets cmd-click, middle-click and "copy link address" for free. */

  /* Escape, the arrows and return are handled in build/parts/27_keys.js */

  window.addEventListener('resize', () => {
    if(winEl().classList.contains('sectionmode')) sizeForSection(SIZE[openKey]);
    else placeHome();
    if(typeof plansDrawer === 'function') plansDrawer();
  });

  placeHome();


  /* ---------------- shop.exe ---------------- */
  /* the product shot steps with the arrows beside it now, not a strip of
     thumbnails underneath (Milk). Wraps both ways, and the dots under the
     photo are the only place the position is shown. */
  function shopPhotoStep(dir){
    const img = document.getElementById('sh-main-img');
    if(!img || !SHOP_PHOTOS.length) return;
    const n = SHOP_PHOTOS.length;
    const i = ((Number(img.dataset.i || 0) + dir) % n + n) % n;
    img.dataset.i = i;
    img.src = SHOP_PHOTOS[i];
    const dots = document.querySelectorAll('.hero-phone .hp-dots i');
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
  }

  /* horizontal carousels (users, reviews, event photos) share one stepper */
  function railStep(id, dir){
    const rail = document.getElementById(id);
    if(!rail) return;
    const first = rail.querySelector(':scope > *');
    const step = first ? first.getBoundingClientRect().width + 14 : 260;
    rail.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  /* ---------------- the subscription quiz ----------------
     This is the real thing: reference/subscription-quiz-FINAL-2026-08-18.html
     (the final build that was sitting in Downloads as index_10.html), copied to
     concept/quiz.html by the build and framed inside quiz.exe. Framing it
     rather than re-typing its questions keeps one source of truth — when the
     quiz is updated, drop the new file in reference/ and rebuild.
     Opens from "shop dumbphone 2" and from the spec-panel link. */
  function openQuiz(){
    setExeTitle('quiz');
    const host = document.getElementById('wm-section');
    host.innerHTML = `
      <div class="quizframe">
        <div class="qf-bar">
          <button type="button" class="wm-back" onclick="openSection('shop')">‹ back to shop.exe</button>
          <a class="qf-open" href="quiz.html" target="_blank" rel="noopener">open on its own ↗</a>
        </div>
        <iframe class="qf-frame" src="quiz.html" title="dumb.co — find your plan"
                loading="lazy" referrerpolicy="no-referrer"></iframe>
        <noscript></noscript>
      </div>`;
    host.scrollTop = 0;
  }

/* The plans drawer. Desktop gets a closed drawer beside specs; a phone gets
   the cards, open, with no chevron to press -- that is the plans page there.
   <details> cannot be held open from CSS (the content is in a UA slot that a
   child display rule does not reliably reach), so the state is set here and
   kept in step from the resize handler in 04_wm.js. */
function plansDrawer(){
  const d = document.querySelector('.plans-drop');
  if(!d) return;
  if(window.matchMedia('(max-width: 760px)').matches){
    d.open = true;
    d.dataset.held = '1';
  }else if(d.dataset.held){
    delete d.dataset.held;
    d.open = false;          // only ever closes a drawer the phone had forced open
  }
}

  /* "plan" and "Find out what plan works for you" open the plans drawer
     in shop.exe and scroll to it, rather than swapping the window for a
     separate page of plans you then had to back out of (Jack, Oct 9:
     "it should just scroll you down to the plans dropdown, and then open
     it"). From any other window it opens shop.exe first. */
  function showPlans(){
    if(openKey !== 'shop') openSection('shop');
    const d = document.querySelector('#wm-section .plans-drop');
    if(!d) return;
    d.open = true;
    requestAnimationFrame(() => d.scrollIntoView({behavior:'smooth', block:'start'}));
  }

  /* ---------------- memories.exe ----------------
     Clicking a photo swaps the view inside this window, with a back button. */
  let memView = { ei: 0, pi: 0 };
  /* The two carousel arrows have called memScroll since the carousel was
     built and NOTHING EVER DEFINED IT -- every press threw a ReferenceError,
     which is exactly why dragging the strip worked and the buttons did
     nothing at all.

     It belongs here rather than beside the markup that calls it: the section
     files are fragments of an object literal, so a function declaration in
     one is a syntax error that takes the whole script down with it. (Found
     that out by putting it there first -- the build does not parse the JS, so
     nothing complained until openSection stopped existing.)

     One tile plus the gap per press, both read off the DOM, so it still steps
     by exactly one photo when the tile width changes at a breakpoint. */
  function memScroll(ei, dir){
    const strip = document.getElementById('mem-strip-' + ei);
    if(!strip) return;
    const tile = strip.querySelector('.mem-tile');
    const cs   = getComputedStyle(strip);
    const gap  = parseFloat(cs.columnGap || cs.gap) || 12;
    const step = tile ? tile.getBoundingClientRect().width + gap
                      : Math.round(strip.clientWidth * 0.8);
    strip.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  function openMemory(ei, pi){
    memView = { ei, pi };
    renderMemoryView();
  }
  function renderMemoryView(){
    const ev = MEMORY_EVENTS[memView.ei];
    const ph = ev.photos[memView.pi];
    const host = document.getElementById('wm-section');
    host.innerHTML = `
      <div class="wm-pad memdetail-pad">
        <div class="wm-back" onclick="openSection('memories')">‹ all memories</div>
        <div class="memdetail">
          <figure class="md-polaroid">
            <div class="md-img"><img src="${esc(ph.src)}" alt="${esc(ev.name)}"/></div>
            <figcaption class="md-cap">
              <span class="md-capline">${esc(ph.cap || ev.name)}</span>
              <span class="md-when">${esc(ev.when)} · ${esc(ev.where)}</span>
            </figcaption>
          </figure>
          <div class="md-foot">
            <button type="button" onclick="memStep(-1)" aria-label="previous photo">‹ prev</button>
            <span class="md-count">${memView.pi + 1} / ${ev.photos.length}</span>
            <button type="button" onclick="memStep(1)" aria-label="next photo">next ›</button>
          </div>
          ${paras(ev.blurb, 'md-blurb')}
        </div>
      </div>`;
    host.scrollTop = 0;
  }
  function memStep(dir){
    const ev = MEMORY_EVENTS[memView.ei];
    memView.pi = (memView.pi + dir + ev.photos.length) % ev.photos.length;
    renderMemoryView();
  }

  /* ---------------- the walking duck ----------------
     Runs only while the window is collapsed into the egg. It walks from beside
     the logo across to the egg, turns around, and walks back. */
  let duckAnim = null;

  /* Distance from `root`'s left edge, walked up the offsetParent chain.
     LAYOUT geometry, not painted geometry -- and that is the whole point here:
     getBoundingClientRect() includes transforms, and both landmarks are
     animated. The egg shakes rotate(±6deg) forever, and it pops in from
     scale(.25) translateY(46px). startDuckWalk() is called on the very line
     that adds .pop, so a rect read there catches the egg at a quarter size,
     which puts its left edge ~22px right of where it ends up. The duck then
     turned around too late, walked under the egg (z-index 19 against 45) and
     looked like it had vanished. offsetLeft ignores all of that. */
  function leftWithin(el, root){
    let x = 0;
    for(let n = el; n && n !== root; n = n.offsetParent) x += n.offsetLeft;
    return x;
  }

  function duckWalkPath(){
    const duck = document.getElementById('walkduck');
    const root = duck.offsetParent || document.body;
    const logo = document.getElementById('logo');
    const duckW = duck.offsetWidth || 62;

    /* It turns at both ends, symmetrically: just past the dumb.co logo on the
       way out, just short of the egg on the way back. Walking off the edge
       instead was tried and is not what we want -- the egg is the other end of
       the walk, not an obstacle. */
    const x0 = leftWithin(logo, root) + (logo.offsetWidth || 0) + 12;
    /* The egg shakes rotate(±6deg) forever, so its painted box reaches about
       height*sin(6deg) past its layout box on each side. The turn clears that
       as well as the egg itself; 12px of gap was less than the swing alone. */
    const egg = document.getElementById('egg');
    const swing = Math.ceil(((egg && egg.offsetHeight) || 70) * Math.sin(6 * Math.PI / 180));
    const eggX = (egg && egg.offsetWidth)
      ? leftWithin(egg, root)
      : (root.clientWidth || window.innerWidth) - 100;
    let x1 = eggX - swing - duckW - 14;

    /* The handset stands in the empty half of the page once the window is in
       the egg, and on a short screen its top reaches the duck's row -- the
       duck walked straight across the phone's screen (Jack, Oct 9). So if
       the drawn phone comes up as high as the duck, the walk turns back
       short of it. If that leaves no room to walk at all, the duck stays
       home rather than crossing the phone. */
    const frame = document.querySelector('#deskphone .phone-frame');
    if(frame && frame.offsetWidth){
      const rr = root.getBoundingClientRect(), fr = frame.getBoundingClientRect();
      const duckTop = duck.offsetTop, duckBottom = duckTop + (duck.offsetHeight || 60);
      const drawnTop = fr.top - rr.top + fr.height * ((typeof ART !== 'undefined' && ART.drawnTop) || 0.0128);
      if(drawnTop < duckBottom + 8){
        /* the widest the drawing gets on its left side, as a fraction of the art */
        const leftFrac = (typeof ART !== 'undefined' && ART.edges)
          ? Math.min(...ART.edges.slice(0, -1).map(e => e[0])) : 0.09;
        const phoneLeft = fr.left - rr.left + fr.width * leftFrac;
        x1 = Math.min(x1, phoneLeft - duckW - 14);
      }
    }
    if(x1 < x0 + 80) return null;
    return { x0: Math.round(x0), x1: Math.round(x1) };
  }

  function startDuckWalk(){
    const duck = document.getElementById('walkduck');
    if(!duck) return;
    stopDuckWalk();
    const path = duckWalkPath();
    if(!path) return;                  // no room that isn't the phone
    const { x0, x1 } = path;
    duck.classList.add('on');
    // ~95px a second, so the trip reads as a stroll rather than a scuttle
    const leg = Math.max(2200, Math.round((x1 - x0) / 95 * 1000));
    // steps(1) on the turn keyframes snaps the flip instead of animating
    // through scaleX(0), which read as the duck pivoting on its own axis
    duckAnim = duck.animate([
      { transform: `translateX(${x0}px) scaleX(1)`,  offset: 0,    easing: 'linear' },
      { transform: `translateX(${x1}px) scaleX(1)`,  offset: 0.49, easing: 'steps(1, end)' },
      { transform: `translateX(${x1}px) scaleX(-1)`, offset: 0.50, easing: 'linear' },
      { transform: `translateX(${x0}px) scaleX(-1)`, offset: 0.99, easing: 'steps(1, end)' },
      { transform: `translateX(${x0}px) scaleX(1)`,  offset: 1 },
    ], { duration: leg * 2.1, iterations: Infinity });
  }

  function stopDuckWalk(){
    const duck = document.getElementById('walkduck');
    if(!duck) return;
    if(duckAnim){ duckAnim.cancel(); duckAnim = null; }
    duck.classList.remove('on');
  }

  /* Debounced: a drag-resize fires this per frame, and each call cancels and
     restarts the walk, so the duck stuttered on the spot for as long as you
     held the mouse down. */
  let duckResize = null;
  window.addEventListener('resize', () => {
    if(!document.getElementById('walkduck')?.classList.contains('on')) return;
    clearTimeout(duckResize);
    duckResize = setTimeout(startDuckWalk, 180);
  });

  /* ---------------- the duck on a phone ----------------
     There is nowhere for it to walk down here: the drawn handset runs from
     about 17px to 373px of a 390px viewport, so anything crossing the page
     lands on it. It goes BEHIND instead. #mstage is the stacking context and
     #deskphone sits at z-index 2, so at z-index 1 the duck shows through the
     ~27% transparent margin the illustration carries on each side and is
     covered by the ink itself -- never "over the phone", and #mstage is
     overflow:hidden so it is clipped at the edge and reads as a head coming
     round the corner. It also holds off entirely while a section is open, so
     it can never appear over the modal. */
  let pokeEl = null, pokeTimer = null, pokeLastRight = null;

  const isPhoneWidth = () => window.matchMedia('(max-width: 760px)').matches;

  function pokeDuckEl(){
    /* #mstage only exists in the separate mobile build (build_mobile.py); the
       responsive index.html puts the handset in a position:fixed #deskphone
       inside #app. Take whichever is there. */
    const stage = document.getElementById('mstage') || document.getElementById('app') || document.body;
    if(!stage) return null;
    if(pokeEl && pokeEl.isConnected) return pokeEl;
    /* reuse the walking duck's inlined gif rather than asking build.py for a
       second copy of the same 6MB page's worth of base64 */
    const src = document.querySelector('#walkduck img')?.getAttribute('src');
    if(!src) return null;
    pokeEl = document.createElement('img');
    pokeEl.id = 'pokeduck';
    pokeEl.alt = '';
    pokeEl.setAttribute('aria-hidden', 'true');
    pokeEl.src = src;
    stage.appendChild(pokeEl);
    return pokeEl;
  }

  function modalIsOpen(){
    const w = document.getElementById('winmodal');
    return !!w && !w.classList.contains('collapsed');
  }

  function pokeOnce(){
    const el = pokeDuckEl();
    if(!el || modalIsOpen()) return;
    const w = el.offsetWidth || 46;
    const h = window.innerHeight;
    /* strict alternation, never the same edge twice running */
    const fromRight = (pokeLastRight === null) ? (Math.random() < 0.5) : !pokeLastRight;
    pokeLastRight = fromRight;
    el.style.left  = fromRight ? 'auto' : '0';
    el.style.right = fromRight ? '0' : 'auto';

    /* Choose the height AFTER the side, and prefer a band with room in it.
       The handset is not the same width all the way down -- it is widest
       across the keypad -- so a height picked blind put the duck somewhere
       there was only 8px of margin on that side and almost none of it showed.
       16%..72% keeps clear of the logo up top and the thumb's half of the
       keypad at the bottom; within that, take the roomiest few. */
    const top0 = h * 0.16, top1 = h * 0.72;
    let top = top0 + Math.random() * (top1 - top0);
    const frame0 = document.querySelector('.phone-frame');
    const edges0 = (typeof ART !== 'undefined' && ART.edges) ? ART.edges : null;
    if(frame0 && edges0){
      const fr = frame0.getBoundingClientRect();
      const room = [];
      for(let y = top0; y <= top1; y += 8){
        const t = ((y + (el.offsetHeight || 40) / 2) - fr.top) / (fr.height || 1);
        if(t < 0 || t > 1){ room.push({y, px: 1e4}); continue; }
        const bnd = edges0[Math.min(edges0.length - 1, Math.max(0, Math.floor(t * edges0.length)))];
        room.push({ y, px: fromRight
          ? window.innerWidth - (fr.left + bnd[1] * fr.width)
          : (fr.left + bnd[0] * fr.width) });
      }
      room.sort((a, b) => b.px - a.px);
      const pick = room.slice(0, Math.max(3, Math.round(room.length * 0.35)));
      top = pick[Math.floor(Math.random() * pick.length)].y;
    }
    el.style.top = Math.round(top) + 'px';

    /* Where the DRAWN phone starts AT THIS HEIGHT. Being behind the art
       already stopped the duck being painted over the phone, but it could
       still walk in far enough to disappear behind it, which reads the same.

       Clamping against the illustration's flat 27% margin was too blunt: 27%
       is the margin at the phone's WIDEST point, and the handset is narrower
       than that almost everywhere, so the duck stopped with 11px of itself
       showing when it had room for all of it. ART.edges is the silhouette in
       32 bands, measured off the drawing by build/trace_screen.py, so the duck
       clamps against the band it is standing in. */
    const frame = document.querySelector('.phone-frame');
    const GAP = 6;
    let inner = fromRight ? w * 0.38 : -w * 0.38;   // ~62% of it in view
    const edges = (typeof ART !== 'undefined' && ART.edges) ? ART.edges : null;
    if(frame && edges){
      const r = frame.getBoundingClientRect();
      const mid = parseFloat(el.style.top) + el.offsetHeight / 2;
      const t = (mid - r.top) / (r.height || 1);
      if(t >= 0 && t <= 1){
        const band = edges[Math.min(edges.length - 1, Math.max(0, Math.floor(t * edges.length)))];
        const inkL = r.left + band[0] * r.width;
        const inkR = r.left + band[1] * r.width;
        if(fromRight) inner = Math.max(inner, inkR + GAP - window.innerWidth + w);
        else          inner = Math.min(inner, inkL - GAP - w);
      }
    }

    const hidden = fromRight ? w : -w;        // fully outside the edge
    const shown  = inner;
    /* The gif is drawn facing right, so scaleX(1) faces right. Coming in from
       the left that is already inward; from the right it has to be mirrored. */
    const flip   = fromRight ? -1 : 1;
    /* Park it off-screen and mirrored BEFORE and AFTER, in the inline style.
       Without this the animation had no fill, so the moment it finished the
       transform reverted to none: no offset and no mirror, which left the duck
       sitting fully on screen at the edge, facing out, until the next poke.
       That is the duck pointing the wrong way -- it was never the flip, it was
       the resting state. */
    const park = `translateX(${hidden}px) scaleX(${flip})`;
    el.style.transform = park;
    el.animate([
      { transform: park },
      { transform: `translateX(${shown}px) scaleX(${flip})`, offset: 0.3 },
      { transform: `translateX(${shown}px) scaleX(${flip})`, offset: 0.7 },
      { transform: park },
    ], { duration: 2800, easing: 'ease-in-out', fill: 'both' });
  }

  function pokeSchedule(){
    clearTimeout(pokeTimer);
    if(!isPhoneWidth()) return;
    pokeTimer = setTimeout(() => { pokeOnce(); pokeSchedule(); },
                           5000 + Math.random() * 5000);
  }

  window.addEventListener('resize', () => { clearTimeout(pokeTimer); pokeSchedule(); });
  if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', pokeSchedule);
  else pokeSchedule();

  /* ==========================================================================
     Grant's snake, ported out of src/Phone/SnakeGame.tsx
     Same rules as the live site: 12x15 grid, 200ms tick easing down to 80ms,
     walls kill you, and the same ↑ ↑ ↓ ↓ ← → unlock from Phone.tsx. It plays
     inside the flip-phone illustration's screen on about.exe, driven by the
     drawn keypad (invisible hotspots over the nav ring) or the arrow keys.
     ========================================================================== */
  const SNK = { COLS: 12, ROWS: 15, START: 200, DECREMENT: 25, MIN: 80 };
  const SNAKE_SEQUENCE = ['up', 'up', 'down', 'down', 'left', 'right'];
  const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

  let snake = null;          // null while the screen is showing portraits
  let snakeTimer = null;
  let seqBuf = [];

  const screenEl = () => document.getElementById('tcl-screen');
  /* the phone sits behind the .exe window, so it is only playable once that
     window has been shrunk into the egg — otherwise arrow keys would fight
     with whatever section is open */
  const phonePlayable = () => !!document.querySelector('#winmodal.collapsed');

  /* every keypad press goes through here: it either drives the game or feeds
     the unlock sequence */
  function teamKey(dir){
    if(!phonePlayable()) return;
    if(snake){ snakeTurn(dir); return; }
    seqBuf = seqBuf.concat(dir).slice(-SNAKE_SEQUENCE.length);
    if(seqBuf.join(',') === SNAKE_SEQUENCE.join(',')){ seqBuf = []; startSnake(); }
  }

  function randomFood(body){
    let f;
    do {
      f = { x: Math.floor(Math.random() * SNK.COLS), y: Math.floor(Math.random() * SNK.ROWS) };
    } while(body.some(s => s.x === f.x && s.y === f.y));
    return f;
  }

  function startSnake(){
    const scr = screenEl();
    if(!scr) return;
    const body = [{x:6,y:7},{x:6,y:8},{x:6,y:9}];
    snake = { body, food: randomFood(body), dir: 'up', pending: 'up',
              score: 0, speed: SNK.START, over: false };

    scr.classList.add('playing');
    const cells = Array.from({length: SNK.COLS * SNK.ROWS}, () => '<i></i>').join('');
    let root = document.getElementById('snake-root');
    if(!root){
      root = document.createElement('div');
      root.id = 'snake-root';
      scr.appendChild(root);
    }
    root.innerHTML = `
      <div class="sn-hud"><span class="sn-pill"></span><b>0</b></div>
      <div class="sn-grid" id="sn-grid"
           style="grid-template-columns:repeat(${SNK.COLS},1fr);grid-template-rows:repeat(${SNK.ROWS},1fr);">${cells}</div>`;
    drawSnake();
    snakeLoop();
  }

  function snakeLoop(){
    clearInterval(snakeTimer);
    snakeTimer = setInterval(snakeTick, snake.speed);
  }

  function snakeTurn(dir){
    if(!snake || snake.over) return;
    if(OPPOSITE[dir] === snake.dir) return;   // no reversing, same as the original
    snake.pending = dir;
  }

  function snakeTick(){
    if(!snake || snake.over) return;
    snake.dir = snake.pending;
    const head = snake.body[0];
    const next = {
      x: head.x + (snake.dir === 'right' ? 1 : snake.dir === 'left' ? -1 : 0),
      y: head.y + (snake.dir === 'down'  ? 1 : snake.dir === 'up'   ? -1 : 0),
    };
    if(next.x < 0 || next.x >= SNK.COLS || next.y < 0 || next.y >= SNK.ROWS) return snakeOver();

    const ate = next.x === snake.food.x && next.y === snake.food.y;
    snake.body = ate ? [next, ...snake.body] : [next, ...snake.body.slice(0, -1)];
    if(ate){
      snake.score += 1;
      snake.food = randomFood(snake.body);
      snake.speed = Math.max(SNK.MIN, snake.speed - SNK.DECREMENT);
      snakeLoop();
    }
    drawSnake();
  }

  function drawSnake(){
    const grid = document.getElementById('sn-grid');
    if(!grid) return;
    const cells = grid.children;
    const set = new Set(snake.body.map(s => s.x + ',' + s.y));
    const head = snake.body[0];
    for(let y = 0; y < SNK.ROWS; y++){
      for(let x = 0; x < SNK.COLS; x++){
        const el = cells[y * SNK.COLS + x];
        const isHead = head.x === x && head.y === y;
        const isFood = snake.food.x === x && snake.food.y === y;
        el.className = isHead ? 'head' : set.has(x + ',' + y) ? 'body' : isFood ? 'food' : '';
      }
    }
    const hud = document.querySelector('#snake-root .sn-hud b');
    if(hud) hud.textContent = snake.score;
  }

  function snakeOver(){
    snake.over = true;
    clearInterval(snakeTimer);
    const root = document.getElementById('snake-root');
    if(root) root.innerHTML =
      `<div class="sn-over"><span>GAME<br/>OVER</span><b>${snake.score}</b><i>back to the team…</i></div>`;
    setTimeout(stopSnake, 3000);   // the original returns to the menu after 3s
  }

  function stopSnake(){
    clearInterval(snakeTimer);
    snakeTimer = null;
    snake = null;
    seqBuf = [];
    const root = document.getElementById('snake-root');
    if(root) root.remove();
    screenEl()?.classList.remove('playing');
  }

  /* arrow keys work too, but only while about.exe is the open window */
  window.addEventListener('keydown', (e) => {
    if(!screenEl() || !phonePlayable()) return;
    const dir = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' }[e.key];
    if(!dir) return;
    e.preventDefault();
    teamKey(dir);
  });

  /* ---------------------------------------------------------------- reviews
     The reviews are rendered into the page at build time from
     src/content/reviews_snapshot.csv. If REVIEWS_CSV_URL is ever set to a
     published sheet, the browser swaps in the live list when it loads. */
  const REVIEWS_CSV_URL = '';

  /* the place's own review page on Google -- same place_id the Places API
     lookups use. Opens Google's list, which is where "see all reviews" has to
     land: we only ever hold five of them. */
  const REVIEWS_PAGE =
    'https://search.google.com/local/reviews?placeid=ChIJiXXqrkq3t4kRFlcwNQMuk2k';

  function reviewsFromRows(rows){
    if(!rows || !rows.length) return {list: [], avg: '', count: ''};
    const head = rows[0].map(c => String(c || '').trim().toLowerCase());
    const col  = (r, n) => { const i = head.indexOf(n); return i < 0 ? '' : String(r[i] || '').trim(); };
    const body = rows.slice(1).filter(r => r && r.some(c => String(c || '').trim()));

    const list = body
      .filter(r => (col(r, 'show').toLowerCase() || 'yes') !== 'no')
      .map(r => ({
        order: parseInt(col(r, 'order'), 10) || 999,
        /* the Places API gives review text but not reviewer names, so blank is
           the normal case rather than an error */
        name:  col(r, 'name') || 'via Google',
        /* the avatar is the name's initial, which for the unnamed fallback
           would be a stray "V" -- use Google's G instead */
        avatar: (col(r, 'name') || '').trim().charAt(0).toUpperCase() || 'G',
        meta:  col(r, 'meta'),
        stars: Math.max(1, Math.min(5, parseInt(col(r, 'stars'), 10) || 5)),
        body:  col(r, 'body'),
      }))
      .filter(r => r.body)
      .sort((a, b) => a.order - b.order);

    /* avg and count describe the whole profile, not a row, so they sit on the
       first row only -- read the first non-empty one rather than assuming */
    const first = (n) => { for(const r of body){ const v = col(r, n); if(v) return v; } return ''; };
    return {list: list, avg: first('avg_rating'), count: first('review_count')};
  }

  function paintReviews(data){
    const rail = document.getElementById('review-rail');
    if(!rail || !data.list.length) return;
    rail.innerHTML = data.list.map(r => `
      <div class="review-card">
        <div class="rc-top">
          <div class="rc-av">${esc(r.avatar)}</div>
          <div>
            <div class="rc-name">${esc(r.name)}</div>
            <div class="rc-meta">${esc(r.meta)}</div>
          </div>
          <div style="margin-left:auto;">${starRow(r.stars)}</div>
        </div>
        <div class="rc-body">${esc(r.body)}</div>
      </div>`).join('');

    /* By id, NOT by '.shs-sub'. The plans drawer sits above this block and
       briefly carried the same class, so the first match was its subtitle --
       the star row and the review link were written into the plans drawer and
       "dumb, dumber, dumbest." disappeared. The one element this is allowed to
       rewrite now says so in its id. */
    const sub = document.getElementById('review-sub');
    if(sub && data.avg && data.count){
      /* The link still goes to the Google listing, but the label is just
         "reviews" -- Lafayette asked for it. Worth knowing: Google's terms
         ask for their reviews to be attributed where they are shown, and the
         count and the word "Google" were what did that here. */
      sub.innerHTML = starRow(Math.round(parseFloat(data.avg) || 5)) +
        ' ' + data.avg + ' · <a class="rv-src" href="' + REVIEWS_PAGE +
        '" target="_blank" rel="noopener noreferrer">reviews &#8599;</a>';
    }
  }

  async function loadReviews(){
    if(!REVIEWS_CSV_URL) return;              // the built-in list is already on the page
    try{
      const res = await fetch(REVIEWS_CSV_URL, {cache:'no-store'});
      if(!res.ok) return;                     // keep what is there, say nothing
      const data = reviewsFromRows(parseCsv(await res.text()));
      if(data.list.length) paintReviews(data);
    }catch(e){ /* offline, blocked, sheet unpublished: the built-in list stands */ }
  }

  /* ==========================================================================
     addressable sections, at real paths  (Jack: "when you click on a tab,
     have it just append /shop instead of /#/shop"; again on Oct 5: "instead
     of #/about it should just be /about")

     Every section has a path: <site>/shop, <site>/about ... It copies,
     pastes, bookmarks, reloads and back-buttons. The nav items are real
     <a href> elements, so right-click > copy link address gives the clean
     path too.

     Reloading /shop needs the server to answer with this page, which a
     static host does not do on its own:
       - GitHub Pages answers /shop with shop.html when it exists, else
         404.html. publish_preview.sh (via split_assets.py) writes both.
       - build/spa_server.py (used by serve.sh and dev.sh) does the same
         thing locally. `python3 -m http.server` does NOT -- it 404s.
       - The React port gets it from react-router plus the prerender step.

     The page works out where it lives (BASE) from its own address rather
     than assuming the site root, because the preview is served from
     /dumb.co-redesign-preview/ and dumb.co itself from /.

     Opened straight from disk (file://) there is no server to answer a
     path, so there -- and only there -- the slug falls back to the hash.

     Old #/shop links still work: they are read once on load and rewritten
     to /shop in place.

     ROUTES (built by build.py from NAV_ITEMS) is the same slug map the React
     port should hand to react-router.
     ========================================================================== */
  const SLUG_TO_KEY = Object.fromEntries(Object.entries(ROUTES).map(([k, s]) => [s, k]));
  const USE_HASH = location.protocol === 'file:';

  /* the directory the site lives in, always ending in "/" */
  const BASE = (function(){
    let p = location.pathname;
    const parts = p.split('/');
    const last = (parts[parts.length - 1] || '').toLowerCase();
    if(SLUG_TO_KEY[last] || /\.html?$/.test(last)) parts.pop();
    else if(last === '' && parts.length > 2 && SLUG_TO_KEY[(parts[parts.length - 2] || '').toLowerCase()]){
      parts.pop(); parts.pop();                 // "/shop/" -- trailing slash
    }
    p = parts.join('/');
    return p.endsWith('/') ? p : p + '/';
  })();

  function hrefFor(key){
    const slug = key ? ROUTES[key] : '';
    if(USE_HASH) return slug ? '#/' + slug : location.pathname;
    return BASE + (slug || '');
  }

  function currentSlug(){
    if(USE_HASH) return (location.hash || '').replace(/^#\/?/, '').replace(/\/$/, '').toLowerCase();
    const rest = location.pathname.slice(BASE.length).replace(/\/$/, '');
    return rest.toLowerCase();
  }

  function setRoute(key){
    const next = hrefFor(key);
    if(USE_HASH){
      const slug = key ? ROUTES[key] : null;
      if((location.hash || '') === (slug ? next : '')) return;
      if(slug){ history.pushState(null, '', next); }
      else history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    if(location.pathname === next && !location.hash) return;
    /* marked, so closing on a phone knows it can step back over it */
    history.pushState({dc: key || 'home'}, '', next + location.search);
  }

  function applyRoute(){
    const key = SLUG_TO_KEY[currentSlug()];
    if(key && sections[key]) openSection(key, true);
    /* On a phone the handset IS home: back (or the iPhone swipe) from a
       section has to land on it, not on flipoff.exe, which is the desktop's
       home window (Jack, Oct 10: "swipe left ... should take you back to the
       phone and not take you to another modal"). */
    else if(window.matchMedia('(max-width: 760px)').matches){
      const win = document.getElementById('winmodal');
      if(win && !win.classList.contains('collapsed')) collapseModal(true);
    }
    else goHome(true);
  }

  /* and the other way round: closing a section on a phone (the ×) goes back
     to the handset, so the address goes back to / with it. If we pushed the
     section's address, step back over it -- then the next swipe back leaves
     the site, as it should, instead of doing nothing visible. Opened from a
     link (no entry of ours behind it), the address is rewritten in place. */
  const _collapseRoute = collapseModal;
  collapseModal = function(fromRoute){
    _collapseRoute.apply(this, arguments);
    if(fromRoute === true || USE_HASH) return;
    if(!window.matchMedia('(max-width: 760px)').matches || !currentSlug()) return;
    if(history.state && history.state.dc) history.back();
    else history.replaceState(null, '', BASE + location.search);
  };

  /* an old #/shop link (from before the paths, or bookmarked): rewrite the
     address to /shop in place. True if it did. */
  function legacyHash(){
    if(USE_HASH) return false;
    const m = (location.hash || '').match(/^#\/?([a-z0-9_-]+)\/?$/i);
    if(!m || !SLUG_TO_KEY[m[1].toLowerCase()]) return false;
    history.replaceState(null, '', BASE + m[1].toLowerCase() + location.search);
    return true;
  }

  /* back/forward; a hand-typed #/slug on the file:// fallback; and an old
     #/slug link followed from INSIDE the page, which only changes the hash
     and so never reloads */
  window.addEventListener('popstate', applyRoute);
  window.addEventListener('hashchange', () => {
    if(USE_HASH || legacyHash()) applyRoute();
  });

  /* wrap the openers so the address follows whatever the window is showing.
     The second argument means "this came FROM the address" -- don't push it
     back onto history, or back would need pressing twice. */
  const _openSectionRoute = openSection;
  openSection = function(key, fromRoute){
    _openSectionRoute(key);
    if(!fromRoute) setRoute(key);
  };
  const _goHomeRoute = goHome;
  goHome = function(fromRoute){
    _goHomeRoute();
    if(!fromRoute) setRoute(null);
  };

  /* the nav's hrefs are written by the build as bare slugs; point them at the
     real address, and let a plain click route in place instead of loading a
     page. Modified clicks (cmd/ctrl/shift/middle) keep the browser's own
     behaviour, so "open in new tab" works. */
  function wireNavLinks(root){
    (root || document).querySelectorAll('a[data-slug], a.pmn-row[data-key]').forEach(a => {
      const key = a.dataset.key;
      if(!ROUTES[key]) return;
      a.setAttribute('href', hrefFor(key));
    });
  }
  wireNavLinks();
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a.navitem[data-slug]');
    if(!a) return;
    if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openSection(a.dataset.key);
  });

  legacyHash();

  /* "/shop/" and "/SHOP" settle on "/shop", so relative URLs (quiz.html)
     resolve against the right directory */
  (function tidy(){
    if(USE_HASH) return;
    const key = SLUG_TO_KEY[currentSlug()];
    if(key && location.pathname !== hrefFor(key)) history.replaceState(null, '', hrefFor(key) + location.search);
  })();

  /* a deep link should land on that section rather than the home carousel.
     Deferred to the end of the script, not run here: two things later in the
     page used to undo or break it. On a phone, initPhone() collapses the
     window on load to show the handset -- which collapsed a deep-linked
     /shop straight back to the menu. And /faq threw, because FAQ.exe's
     state (faqItems) is declared further down than this file. A microtask
     runs once the whole script has, and still before the first paint, so
     there is no flash of the home window either. */
  if(SLUG_TO_KEY[currentSlug()]) queueMicrotask(applyRoute);

  /* ==========================================================================
     keyboard: arrows move through the tabs, return opens, escape minimises
     (desktop build only — the mobile build drives the phone's own screen menu
     from build/parts/m02_mobile.js and bails out of this handler.)

     Two things this must not steal:
       - arrows while the window is collapsed into the egg, which are Grant's
         snake controls and its ↑↑↓↓←→ unlock
       - keys typed into the quiz iframe or any field
     ========================================================================== */
  (function keyboardNav(){
    /* checked per event, not here: the mobile shell is built by
       build/parts/m02_mobile.js, which is appended after this file, so #mstage
       does not exist yet at this point. */
    const isMobileBuild = () => !!document.getElementById('mstage');

    let kbIdx = -1;

    const els = () => [...document.querySelectorAll('#navlist .navitem')];

    function paint(){
      els().forEach((el, i) => el.classList.toggle('kbfocus', i === kbIdx));
      const cur = els()[kbIdx];
      if(cur && cur.scrollIntoView) cur.scrollIntoView({block:'nearest'});
    }

    /* Only pick a starting point when there isn't a cursor yet — then leave it
       where the user put it. Syncing to the open section on every press meant
       the cursor snapped back to it each time, so the arrows appeared to move
       one step and stick. */
    function startIndex(step){
      const list = els();
      const active = list.findIndex(el => el.classList.contains('active'));
      if(active >= 0) return active;
      return step > 0 ? -1 : 0;
    }

    function move(step){
      const list = els();
      if(!list.length) return;
      if(kbIdx < 0) kbIdx = startIndex(step);
      kbIdx = (kbIdx + step + list.length) % list.length;
      paint();
    }

    function confirm(){
      const el = els()[kbIdx];
      if(!el) return;
      if(el.classList.contains('external')){
        window.open(el.href, '_blank', 'noopener');
        return;
      }
      openSection(el.dataset.key);
      paint();
    }

    const typing = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'
                                || t.tagName === 'IFRAME' || t.isContentEditable);

    window.addEventListener('keydown', (e) => {
      if(isMobileBuild()) return;                      // m02_mobile.js owns the keys there
      if(e.metaKey || e.ctrlKey || e.altKey) return;
      if(typing(e.target)) return;

      const win = document.getElementById('winmodal');
      const collapsed = win.classList.contains('collapsed');

      if(e.key === 'Escape'){
        // minimise: the window goes into the egg, whatever it was showing
        if(!collapsed && typeof collapseModal === 'function'){
          e.preventDefault();
          collapseModal();
        }
        return;
      }

      // while the window is in the egg the phone is playable, and the arrows
      // are snake's (and its unlock sequence) — leave them alone
      if(collapsed) return;

      switch(e.key){
        case 'ArrowDown': case 'ArrowRight': e.preventDefault(); move(1);  break;
        case 'ArrowUp':   case 'ArrowLeft':  e.preventDefault(); move(-1); break;
        case 'Enter':     case ' ':          e.preventDefault(); confirm(); break;
      }
    });

    /* clicking a tab moves the keyboard cursor there too */
    document.querySelectorAll('#navlist .navitem').forEach((el, i) => {
      el.addEventListener('click', () => { kbIdx = i; paint(); });
    });
  })();

  /* ==========================================================================
     THE HANDSET IS THE NAV
     Jack's notes, in one place:
       - the phone screen and the .exe window mirror each other. Open Shop and
         the phone says Shop; minimise and it still says Shop.
       - below the breakpoint the window minimises into the egg and the phone
         zooms up into the mobile layout — same document, no second file.
       - the drawn oval keys are the D-pad, with arrows on them.
       - clicking the tab that's already highlighted pops the window back out.
     ========================================================================== */

  /* >>> art: generated by build/trace_screen.py, do not hand-edit */
  /* Measured off flipphone_bigscreen.png (1200x3600) by build/trace_screen.py. These drive
     how big the handset is drawn on a phone, so they have to follow the art:
     when the drawing was shortened these were still the old ones and the
     handset kept sizing itself to a height it no longer had. */
  const ART = {
    ratio: 3600 / 1200,
    drawnTop: 0.0128, drawnH: 0.9747, drawnW: 0.8225,
    keysBottom: 0.6650,   // just under the d-pad; anything lower crops off
    screenH: 0.3833,            // the screen aperture, as a fraction of the art
    /* the drawn silhouette in 32 horizontal bands, [leftEdge, rightEdge] as
       fractions of the art's width. The phone duck clamps against the band it
       is standing in rather than the phone's widest point. */
    edges: [[0.1633,0.8467], [0.1008,0.8950], [0.1025,0.9075], [0.1217,0.9092], [0.1217,0.9008], [0.1192,0.8992], [0.1217,0.9033], [0.1192,0.9050], [0.1217,0.8992], [0.1192,0.8992], [0.1233,0.8967], [0.1300,0.8967], [0.1317,0.9008], [0.1383,0.8992], [0.1425,0.8992], [0.1425,0.8908], [0.1317,0.8992], [0.1300,0.9008], [0.1275,0.9092], [0.1275,0.9117], [0.1300,0.9092], [0.1300,0.9092], [0.1275,0.9033], [0.1342,0.9050], [0.1342,0.9075], [0.1300,0.9075], [0.0883,0.9075], [0.1275,0.9092], [0.1300,0.9117], [0.1317,0.9092], [0.1667,0.8658], [0.9092,0.9117]],
  };
  /* <<< art */
  const BP = 760;

  const isPhone = () => window.innerWidth <= BP;
  const snakeOn = () => !!document.querySelector('#tcl-screen.playing');
  const winEl2  = () => document.getElementById('winmodal');
  const collapsed = () => winEl2().classList.contains('collapsed');

  let pmItems = [];
  let pmSel = 0;

  /* ---------------------------------------------------- the screen's menu */
  function buildPhoneMenu(){
    const screen = document.getElementById('tcl-screen');
    if(!screen) return;
    pmItems = [...document.querySelectorAll('#navlist .navitem')].map(el => ({
      key: el.dataset.key,
      label: (el.textContent || '').trim(),
      external: el.classList.contains('external'),
      href: el.getAttribute('href') || '',
    }));
    /* the menu is in the page already (Site.astro), so the phone shows it
       from the first paint; only build it if it somehow isn't */
    if(screen.querySelector('.pmn')) return;
    screen.insertAdjacentHTML('afterbegin',
      '<div class="pmn">' +
        '<div class="pmn-list">' +
          pmItems.map((it, i) =>
            '<a class="pmn-row' + (i === 0 ? ' on' : '') + '" data-key="' + it.key + '"' +
            ' href="' + it.href + '"' +
            (it.external ? ' target="_blank" rel="noopener noreferrer"' : '') +
            ' onclick="phonePick(' + i + ', event)">' + it.label + '</a>'
          ).join('') +
        '</div>' +
      '</div>');
  }

  function phonePaint(){
    const rows = document.querySelectorAll('#tcl-screen .pmn-row');
    rows.forEach((el, i) => el.classList.toggle('on', i === pmSel));
  }

  /* ---- mirror the minimised window onto the screen ----------------------
     Showing the menu with a row highlighted told you which section was
     minimised but not what was in it. This clones the window's own content
     onto the handset instead, scaled to fit, so shrinking the window reads
     as the page going into the phone.

     The clone is laid out at the window's own current width and then scaled
     down, so the miniature matches what you just minimised line for line.
     Laying it out at a fixed width instead made absolutely-positioned bits
     land in the wrong place and text collide. MIRROR_W is only the fallback
     for when the window has no width to read yet. */
  const MIRROR_W = 560;

  /* The blank screen gets a duck, the way a phone shows something when it
     boots. It is the same inlined gif the walking duck uses rather than a
     second copy of it. Replaced rather than restarted, so re-minimising
     plays the power-on again instead of leaving a duck already sitting
     there. Snake clears it: .playing hides .pf-boot. */
  function bootDuck(screen){
    screen.querySelector('.pf-boot')?.remove();
    const src = document.querySelector('#walkduck img')?.getAttribute('src');
    if(!src) return;
    const boot = document.createElement('div');
    boot.className = 'pf-boot';
    boot.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = src; img.alt = '';
    boot.appendChild(img);
    screen.appendChild(boot);
  }

  function phoneMirror(on){
    /* The handset is off the home page on desktop (Milk) and comes back only
       once a window has been minimised into the egg -- which is where snake
       and the power-on duck live, so neither is lost. body.section-open in the
       baseline is never actually set by anything, so this class is the marker.
       Set before the early return: the flag has to track the window even if
       the screen element is not in the DOM yet. */
    document.body.classList.toggle('win-collapsed', !!on);

    const screen = document.getElementById('tcl-screen');
    if(!screen) return;
    /* Never mirror on a phone. Below the breakpoint the handset IS the
       navigation, so replacing the menu with a picture of the section you
       just closed leaves nothing to tap -- Jack hit exactly this: "you can't
       go back to the main menu after clicking on something". */
    if(isPhone()) on = false;
    const menu = screen.querySelector('.pmn');
    let mir = screen.querySelector('.pmn-mirror');

    if(!on){
      if(mir) mir.remove();
      screen.querySelector('.pf-boot')?.remove();
      if(menu) menu.style.display = '';
      return;
    }

    /* On desktop the minimised window leaves the handset showing the same
       menu it has on a phone, and it works the same way: the arrows move,
       OK opens that section (Jack, Oct 9: "have the phone from the mobile
       version be in the blank space behind the modal so if somebody closes
       it they can see it and use it ... similar to how they use it on
       mobile"). It used to go blank here, with a power-on duck -- an earlier
       note of Jack's ("it should stay empty while the user is on desktop"),
       which this replaces. Snake still unlocks from the menu the way it does
       on a phone. */
    if(mir) mir.remove();
    screen.querySelector('.pf-boot')?.remove();
    if(menu) menu.style.display = '';
    phonePaint();
    return;

    const src = document.getElementById('wm-section') || document.getElementById('wm-body');
    if(!src || !src.firstChild){ if(mir) mir.remove(); if(menu) menu.style.display=''; return; }

    if(!mir){
      mir = document.createElement('div');
      mir.className = 'pmn-mirror';
      mir.setAttribute('aria-hidden', 'true');   // the real content is in the window
      screen.appendChild(mir);
    }
    const srcW = src.offsetWidth || MIRROR_W;    // layout width: transforms don't affect it

    const inner = document.createElement('div');
    inner.className = 'pmn-mirror-in';
    inner.style.width = srcW + 'px';
    const clone = src.cloneNode(true);
    clone.removeAttribute('id');                 // no duplicate ids in the document
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    /* the confetti is absolutely positioned against the section, so at this
       size it just lands on top of the words. It reads as noise in a
       thumbnail, not as decoration. */
    clone.querySelectorAll('i[style*="background"]').forEach(el => el.remove());
    inner.appendChild(clone);
    mir.replaceChildren(inner);

    const w = screen.clientWidth || 1;
    inner.style.transform = 'scale(' + (w / srcW) + ')';
    if(menu) menu.style.display = 'none';
  }

  /* the window changed — make the handset say the same thing */
  function phoneReflect(key){
    const i = pmItems.findIndex(it => it.key === key);
    if(i >= 0){ pmSel = i; phonePaint(); }
  }

  function phoneMove(step){
    if(!pmItems.length) return;
    pmSel = (pmSel + step + pmItems.length) % pmItems.length;
    phonePaint();
  }

  function phoneOpen(i){
    const it = pmItems[i];
    if(!it) return;
    if(it.external){ window.open(it.href, '_blank', 'noopener'); return; }
    if(collapsed() && typeof expandModal === 'function') expandModal();
    openSection(it.key);
  }

  function phonePick(i, ev){
    pmSel = i; phonePaint();
    const it = pmItems[i];
    if(it && it.external) return;        // let the <a> take it
    if(ev) ev.preventDefault();
    phoneOpen(i);
  }

  /* ---- the keys press (22_snake.css > PRESSED) -------------------------
     The pressed key paints the handset art over itself, 2px low. The patch
     has to line up with the drawing to the pixel, and the button's box is
     not a fixed fraction of the frame (the hit areas have a px floor), so the
     offset is measured at the moment of the press rather than worked out in
     CSS. */
  /* Only the key's own ink moves (Jack, Oct 9: "remove the circle hover and
     just have the movement state of the button shifting").

     The patch used to be the whole round hit area, painted over the handset
     with the drawing 2px lower on a flat yellow. That flat yellow never
     matched -- the handset is transparent and its drop-shadow tints the page
     under every stroke -- so it read as a shaded disc, and it dragged slices
     of the hinge line and the OK ring down with it.

     Now the drawing is read once into a canvas, and for each key we take
     just its own strokes: the connected ink inside its hit area, minus any
     stroke that runs out of the area (that is a neighbour -- the hinge, the
     ring, the next arrow). The OK key looks a little wider than its hit area
     so its ring comes along. On press, those strokes are cut out of the
     handset with a mask and drawn again 2px lower, with the same shadow. No
     background is painted at all, so there is nothing to mismatch. */
  let artCanvas = null;
  function artPixels(art){
    if(artCanvas && artCanvas.src === art.currentSrc) return artCanvas;
    if(!art.complete || !art.naturalWidth) return null;
    try{
      const c = document.createElement('canvas');
      c.width = art.naturalWidth; c.height = art.naturalHeight;
      const g = c.getContext('2d', {willReadFrequently:true});
      g.drawImage(art, 0, 0);
      g.getImageData(0, 0, 1, 1);               // throws now if the canvas is tainted
      artCanvas = {src: art.currentSrc, g, w: c.width, h: c.height, keys: new Map()};
      return artCanvas;
    }catch(e){ return null; }
  }
  /* the patch around a key, in art pixels: {x, y, orig, pressed} (ImageData) */
  function keyStrokes(btn, art, a, b){
    const px = artPixels(art);
    if(!px) return null;
    const id = btn.className.match(/k-\w+/)?.[0] + '@' + Math.round(a.width);
    if(px.keys.has(id)) return px.keys.get(id);
    const k = px.w / a.width;                          // art px per css px
    const grow = btn.classList.contains('k-ok') ? 0.16 : 0;
    const gx = b.width * grow, gy = b.height * grow;
    const x0 = Math.max(0, Math.floor((b.left - gx - a.left) * k));
    const y0 = Math.max(0, Math.floor((b.top  - gy - a.top)  * k));
    const x1 = Math.min(px.w, Math.ceil((b.right  + gx - a.left) * k));
    const y1 = Math.min(px.h, Math.ceil((b.bottom + gy - a.top)  * k));
    const W = x1 - x0, H = y1 - y0;
    if(W < 4 || H < 4){ px.keys.set(id, null); return null; }
    const d = px.g.getImageData(x0, y0, W, H).data;
    const isInk = (i) => d[i*4+3] > 40;
    const seen = new Uint8Array(W * H), keep = new Uint8Array(W * H), stack = [];
    for(let s0 = 0; s0 < W * H; s0++){
      if(seen[s0] || !isInk(s0)) continue;
      const comp = []; let edge = false;
      stack.push(s0); seen[s0] = 1;
      while(stack.length){
        const i = stack.pop(), x = i % W, y = (i / W) | 0;
        comp.push(i);
        if(x === 0 || y === 0 || x === W - 1 || y === H - 1) edge = true;
        if(x > 0     && !seen[i-1] && isInk(i-1)){ seen[i-1] = 1; stack.push(i-1); }
        if(x < W - 1 && !seen[i+1] && isInk(i+1)){ seen[i+1] = 1; stack.push(i+1); }
        if(y > 0     && !seen[i-W] && isInk(i-W)){ seen[i-W] = 1; stack.push(i-W); }
        if(y < H - 1 && !seen[i+W] && isInk(i+W)){ seen[i+W] = 1; stack.push(i+W); }
      }
      if(!edge) comp.forEach(i => keep[i] = 1);
    }
    let L = W, T = H, R = -1, B = -1;
    for(let i = 0; i < W * H; i++) if(keep[i]){
      const x = i % W, y = (i / W) | 0;
      if(x < L) L = x; if(x > R) R = x; if(y < T) T = y; if(y > B) B = y;
    }
    if(R < 0){ px.keys.set(id, null); return null; }
    const pad = Math.ceil(3 * k);                       // room for the 2px grow
    L = Math.max(0, L - pad); T = Math.max(0, T - pad);
    R = Math.min(W - 1, R + pad); B = Math.min(H - 1, B + pad);
    const w = R - L + 1, h = B - T + 1;
    /* Two patches of the drawing around this key, in art pixels: as drawn,
       and pressed -- the key's strokes (plus a 2px fringe, which takes the
       anti-aliasing with them) cleared, and drawn again 2px lower. A press
       just paints the pressed patch onto the live canvas, a release paints
       the original back. */
    const orig = px.g.getImageData(x0 + L, y0 + T, w, h);
    const pressed = new ImageData(new Uint8ClampedArray(orig.data), w, h);
    const o = pressed.data, r = Math.ceil(2 * k), dy = Math.round(2 * k);
    const inKey = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && keep[yy * W + xx];
    for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
      const sx = x + L, sy = y + T;
      let near = false;
      for(let ey = -r; ey <= r && !near; ey++) for(let ex = -r; ex <= r; ex++){
        if(inKey(sx + ex, sy + ey)){ near = true; break; }
      }
      if(near) o[(y * w + x) * 4 + 3] = 0;
    }
    for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
      const sx = x + L, sy = y + T - dy;
      if(!inKey(sx, sy)) continue;
      const si = (sy * W + sx) * 4, oi = (y * w + x) * 4;
      const a = d[si+3] / 255, b = o[oi+3] / 255, out = a + b * (1 - a);
      if(!out) continue;
      for(let c = 0; c < 3; c++) o[oi+c] = (d[si+c] * a + o[oi+c] * b * (1 - a)) / out;
      o[oi+3] = out * 255;
    }
    const res = {x: x0 + L, y: y0 + T, orig, pressed};
    px.keys.set(id, res);
    return res;
  }

  /* The handset as a canvas. The press used to cut the key out of the <img>
     with a CSS mask, and iPhone Safari intermittently drew NOTHING of a
     masked element that large with a drop-shadow on it: the whole handset
     blinked out as you tapped (Jack's videos, Oct 9 and 10; decoding the
     mask first did not help, it is the masking itself). Now the drawing is
     copied once into a canvas laid exactly over the <img>, the <img> is
     hidden (it still sets the size and every measurement), and a press
     repaints one small patch of the canvas. No mask, nothing to drop. */
  function liveArt(frame){
    let cv = frame.querySelector('canvas.pf-live');
    if(cv) return cv;
    const art = frame.querySelector('.pf-art');
    if(!art || !art.complete || !art.naturalWidth || !artPixels(art)) return null;
    cv = document.createElement('canvas');
    cv.className = 'pf-live';
    cv.width = art.naturalWidth; cv.height = art.naturalHeight;
    cv.setAttribute('aria-hidden', 'true');
    try{ cv.getContext('2d').drawImage(art, 0, 0); }catch(e){ return null; }
    art.after(cv);
    art.classList.add('pf-art-under');                 // hidden in the same frame the canvas appears
    return cv;
  }

  /* work the strokes out before the first tap, and again whenever the
     handset is resized, so a press never waits on them */
  function warmKeys(){
    const frame = document.querySelector('#deskphone .phone-frame');
    const art = frame && frame.querySelector('.pf-art');
    if(!art || !art.complete || !art.naturalWidth) return;
    const a = art.getBoundingClientRect();
    if(!a.width || !liveArt(frame)) return;
    frame.querySelectorAll('.pf-keys button').forEach(btn => {
      const b = btn.getBoundingClientRect();
      if(b.width) keyStrokes(btn, art, a, b);
    });
  }
  let warmTimer = 0;
  function warmKeysSoon(delay){
    clearTimeout(warmTimer);
    warmTimer = setTimeout(() => (window.requestIdleCallback || setTimeout)(warmKeys), delay);
  }
  let pressedBy = null;
  function keyDown(btn){
    const frame = btn.closest('.phone-frame');
    const art = frame?.querySelector('.pf-art');
    if(!art) return;
    btn.classList.add('down');
    const cv = liveArt(frame);
    if(!cv) return;                                      // can't read the art: no press look, rather than a wrong one
    const sk = keyStrokes(btn, art, art.getBoundingClientRect(), btn.getBoundingClientRect());
    if(!sk) return;
    if(pressedBy && pressedBy !== btn) keyRelease(pressedBy);
    cv.getContext('2d').putImageData(sk.pressed, sk.x, sk.y);
    pressedBy = btn; btn._sk = sk;
  }
  function keyRelease(btn){
    btn.classList.remove('down');
    if(pressedBy !== btn) return;
    pressedBy = null;
    const cv = btn.closest('.phone-frame')?.querySelector('canvas.pf-live');
    if(cv && btn._sk) cv.getContext('2d').putImageData(btn._sk.orig, btn._sk.x, btn._sk.y);
  }
  const keyTimers = new WeakMap();
  function keyUp(btn, after){
    clearTimeout(keyTimers.get(btn));
    keyTimers.set(btn, setTimeout(() => keyRelease(btn), after || 0));
  }
  /* a key pressed from the keyboard (or by a click that never had a
     pointerdown, e.g. assistive tech) still shows the press */
  function keyFlash(dir){
    const btn = document.querySelector('#deskphone .pf-keys .k-' + dir);
    if(!btn || btn.classList.contains('down')) return;
    keyDown(btn); keyUp(btn, 120);
  }
  (function wireKeys(){
    const frame = document.querySelector('#deskphone .phone-frame');
    const art = frame && frame.querySelector('.pf-art');
    if(!art) return;
    /* one reference to the inlined drawing, not a second copy of it */
    frame.style.setProperty('--pf-art', 'url("' + art.getAttribute('src') + '")');
    if(art.complete) warmKeysSoon(300); else art.addEventListener('load', () => warmKeysSoon(300), {once: true});
    window.addEventListener('resize', () => warmKeysSoon(400));
    frame.querySelectorAll('.pf-keys button').forEach(btn => {
      /* a tap is shorter than a frame, so hold the press at least 90ms or it
         is never seen */
      btn.addEventListener('pointerdown', () => { clearTimeout(keyTimers.get(btn)); keyDown(btn); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
        btn.addEventListener(ev, () => { if(btn.classList.contains('down')) keyUp(btn, 90); }));
    });
  })();

  /* the drawn keys: snake keeps first claim (including its ↑↑↓↓←→ unlock),
     the menu gets everything else */
  const _teamKeySnake = teamKey;
  teamKey = function(dir){
    keyFlash(dir);
    if(snakeOn()){ _teamKeySnake(dir); return; }
    _teamKeySnake(dir);                  // feeds the unlock buffer
    if(snakeOn()) return;                // that press was the last of the unlock
    if(dir === 'up')    { phoneMove(-1); return; }
    if(dir === 'down')  { phoneMove(1);  return; }
    /* OK opens. RIGHT used to open as well, which is wrong on a vertical
       menu: the arrows should only ever do the thing they point at, and
       right points at nothing here. It also quietly undid the lesson the
       touch nudge teaches -- if two different keys open a row, the one key
       that is actually labelled for it stops being the obvious answer.

       Left and right still reach _teamKeySnake above, so the unlock sequence
       is untouched; they just no longer navigate. */
    if(dir === 'ok'){ phoneOpen(pmSel); return; }
  };
  function phoneOk(){ teamKey('ok'); }

  /* ------------------------------------------------------- sizing the phone */
  function phoneFit(){
    const frame = document.querySelector('#deskphone .phone-frame');
    if(!frame) return;
    const root = document.documentElement;

    if(!isPhone()){
      root.style.removeProperty('--mpw');
      root.style.removeProperty('--mtop');

      /* Desktop size is pinned to the DRAWN handset, not to the image box.
         The frame used to be a flat 420px, which was fine while one drawing
         was in play and wrong the moment it changed: the old art was only
         45.5% ink across its width with big transparent margins, Marco's is
         82.25%, so the same 420px drew a phone nearly twice the size and it
         ran off the bottom of the page.

         DESK_DRAWN_H is what the previous handset actually drew at --
         420 * 1.645 * 0.923 = 638px of ink -- so pinning to it keeps the
         cameo the size it has always been, and any future redraw with
         different margins lands at the same size instead of needing this
         number found again. */
      const DESK_DRAWN_H = 638;
      const w = Math.round(DESK_DRAWN_H / (ART.drawnH * ART.ratio));
      frame.style.width = w + 'px';
      setRowVars(w);
      return;
    }

    /* Clear the desktop's inline width before the phone branch touches
       anything. The mobile rule is width:var(--mpw) in a stylesheet, and an
       inline style beats a stylesheet however specific -- so after the window
       had ever been wide, dragging it narrow left the handset stuck at the
       218px desktop size and the menu text clipped inside it. That is the
       "it didn't jump to the mobile size" -- the breakpoint fired correctly
       every time, the width just could not move. */
    frame.style.removeProperty('width');

    /* The wordmark used to sit in a band above the handset, so the phone had
       to start below it. It is on the hinge now, which hands that whole strip
       back: the phone starts at a plain 10px of air and can be scaled up into
       the space the logo was using. */
    const TOP_AIR = 10;
    /* room under the d-pad: at 6px the down arrow sat on Safari's toolbar
       and people kept missing it (Jack, Oct 10). Same number as the
       pre-paint script in Site.astro. */
    const BOTTOM_AIR = 40;
    const availH = Math.max(240, window.innerHeight - TOP_AIR - BOTTOM_AIR);
    const availW = Math.max(200, window.innerWidth - 8);

    /* scale until the D-pad reaches the bottom of the screen rather than the
       whole handset — the bigger of the two sizings from the review, which is
       the one we kept. The number keys crop off below. */
    let w = availH / ((ART.keysBottom - ART.drawnTop) * ART.ratio);
    w = Math.min(w, availW / ART.drawnW);

    root.style.setProperty('--mpw', Math.round(w) + 'px');
    root.style.setProperty('--mtop', Math.round(TOP_AIR - ART.drawnTop * ART.ratio * w) + 'px');
    setRowVars(w);
  }

  /* ------------------------------- "that's not a touchscreen" ------------ */
  /* 65% of visits are on a phone and the whole interface is a drawn d-pad, so
     the one thing worth teaching is that the buttons do the work. Tapping the
     screen is the exact moment someone is asking how this thing works, so
     that is where the answer goes.

     The picture in it is Marco's own ink -- build/trace_screen.py cuts the
     d-pad cluster straight out of the handset -- so what the nudge points at
     and what is drawn on the phone behind it cannot drift apart. */
  function nudgeEl(){
    let el = document.getElementById('nottouch');
    if(el) return el;
    el = document.createElement('div');
    el.id = 'nottouch';
    el.innerHTML =
      /* Matteo's copy (Oct 5): a heading in Cheltenham and one plain
         instruction in Helvetica, replacing "oh, you thought you could use a
         touch screen. that's real funny, hehehehe / try the buttons below!". */
      '<div class="nt-card" role="alertdialog" aria-live="assertive">' +
        '<p class="nt-go">helping you get ready for the dumb life</p>' +
        '<p class="nt-ha">try clicking the buttons below</p>' +
        '<img class="nt-keys" src="' + A.dpadCluster + '" alt="the four arrows and the OK button">' +
        '<button type="button" class="nt-x">got it</button>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', () => el.classList.remove('on'));
    return el;
  }

  /* The card was only built on the first tap, so its picture started loading
     then, and its heading font (Cheltenham, used nowhere else on a phone)
     too: for a frame it showed in the fallback face with no d-pad, then
     jumped into shape (Jack's video, Oct 9). Built hidden at load instead,
     with the font and picture fetched and decoded, and the first tap waits
     for them (briefly -- it shows regardless after 800ms). */
  let nudgeReady = null;
  function prepNudge(){
    if(nudgeReady) return nudgeReady;
    const el = nudgeEl(), img = el.querySelector('.nt-keys');
    const font = (document.fonts && document.fonts.load)
      ? document.fonts.load('700 32px "Cheltenham"').catch(() => {}) : Promise.resolve();
    const pic = (img.decode ? img.decode() : new Promise((ok, no) => {
      if(img.complete) ok(); else { img.onload = ok; img.onerror = no; }
    })).catch(() => {});
    nudgeReady = Promise.all([font, pic]);
    return nudgeReady;
  }
  if(isPhone()) (window.requestIdleCallback || setTimeout)(prepNudge);

  let nudgeTimer = null;
  /* The shake is the surprise, and a surprise only works once (Matteo: "after
     the first time, the shaking can be annoying"). First tap of the visit
     shakes and buzzes; every tap after that just shows the card. Remembered
     for the tab, so a reload does not start shaking again. */
  let shookOnce = false;
  try { shookOnce = sessionStorage.getItem('dumb-shook') === '1'; } catch(e){}
  function touchNudge(){
    const frame = document.querySelector('#deskphone .phone-frame');
    if(!frame) return;
    if(!shookOnce){
      shookOnce = true;
      try { sessionStorage.setItem('dumb-shook', '1'); } catch(e){}
      /* offsetWidth forces the reflow that makes the browser treat it as a
         new animation */
      frame.classList.remove('shake');
      void frame.offsetWidth;
      frame.classList.add('shake');
      clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(() => frame.classList.remove('shake'), 500);
      /* a real buzz where the hardware has one; iOS Safari has no vibrate, so
         the shake has to carry it on its own there */
      if(navigator.vibrate){ try { navigator.vibrate([16, 38, 16]); } catch(e){} }
    }
    let shown = false;
    const show = () => { if(!shown){ shown = true; nudgeEl().classList.add('on'); } };
    prepNudge().then(show);
    setTimeout(show, 800);
  }

  document.addEventListener('click', (e) => {
    if(!isPhone()) return;
    if(snakeOn()) return;                                   // snake owns the screen
    if(e.target.closest('#nottouch')) return;               // dismissing it
    if(e.target.closest('.pf-keys')) return;                // the buttons ARE the answer
    const win = document.getElementById('winmodal');
    if(win && !win.classList.contains('collapsed')) return;  // a section is open
    const scr = document.getElementById('tcl-screen');
    if(scr && (scr === e.target || scr.contains(e.target))) touchNudge();
  });

  /* ------------------------------------------- the wordmark on the hinge */
  /* Laffy: "can the dumb.co logo be moved to the phone hinge?" It lives in
     the sidebar, which is the desktop's furniture, so on a phone the node is
     moved into the handset itself and put over the drawn hinge panel --
     whose box trace_screen.py measures off the artwork (--hinge-*), so it
     follows the drawing rather than being placed by eye. Moved back on the
     way out, because the desktop sidebar still needs it. */
  function logoHome(){
    const logo = document.getElementById('logo');
    const frame = document.querySelector('#deskphone .phone-frame');
    const bar = document.getElementById('sidebar');
    if(!logo || !frame || !bar) return;
    if(isPhone()){
      if(logo.parentElement !== frame){ frame.appendChild(logo); logo.classList.add('on-hinge'); }
    } else if(logo.parentElement !== bar){
      bar.insertBefore(logo, bar.firstChild);
      logo.classList.remove('on-hinge');
    }
  }

  /* the menu is sized off the frame from ART.screenH, so it fits however big
     the handset is and follows the art if the drawing changes */
  function setRowVars(frameW){
    const root = document.documentElement;
    const screenH = ART.screenH * ART.ratio * frameW;
    /* counted from the nav, not pmItems: the first fit runs before the menu
       is wired up, and with n=1 every row was sized for a one-item menu --
       the menu loaded zoomed in and then shrank (Jack, Oct 9) */
    const n = Math.max(1, pmItems.length || document.querySelectorAll('#navlist .navitem').length);
    /* The strip at the top of the screen used to hold "DUMB.CO ..."; that was
       removed in the copy pass, but 6% of the screen was still being reserved
       for it on every build since. Measured: 26px of a 447px screen held back
       for an element that is not in the DOM. Reserved only when it is really
       there, which hands the rows the whole screen. */
    const bar = document.querySelector('#tcl-screen .pmn-bar')
      ? Math.max(9, Math.round(screenH * 0.06)) : 0;
    /* the whole screen, divided by the rows: with .pmn's padding gone there
       is nothing else to subtract, so seven rows reach both drawn edges */
    const rowH = Math.max(11, Math.floor((screenH - bar) / n));
    root.style.setProperty('--pmn-rowh', rowH + 'px');
    /* the cap was 17px, which on a real handset read as small print next to
       44px rows (Jack). 24px matches the minimum he asked for and still fits
       seven rows on the shortest screen we support. */
    root.style.setProperty('--pmn-rowf', Math.max(7.5, Math.min(24, Math.round(rowH * 0.52 * 10) / 10)) + 'px');
    root.style.setProperty('--pmn-barf', Math.max(6, Math.min(10, Math.round(bar * 0.62))) + 'px');
  }

  /* --------------------------------------------- crossing the breakpoint */
  let wasPhone = null;
  function onBreakpoint(){
    logoHome();
    const now = isPhone();
    if(wasPhone === null){ wasPhone = now; return; }
    if(now === wasPhone) return;
    wasPhone = now;
    /* Crossing into phone width used to minimise whatever was open, so the
       thing you were reading vanished mid-resize. Jack: "the modal should
       stay up instead of closing". It stays; the handset zooms up behind it
       (the width transition in 29_responsive.css), and closing the window
       lands you on the menu. */

    /* What the blank screen shows depends on the breakpoint, so crossing one
       has to re-decide it. Without this, minimising on a desktop and then
       narrowing the window left the phone showing the power-on duck and NO
       menu at 390px -- which on a phone is the dead end Jack reported, since
       the handset is the only navigation down there. Going the other way it
       left the menu sitting on a screen that should have gone blank. */
    if(document.querySelector('#winmodal.collapsed')) phoneMirror(true);
  }

  /* Where the sidebar's INK actually ends.
     #home used to start at the sidebar's column edge, but the column is much
     wider than what is drawn in it -- 340px of column holding 226px of logo
     and nav -- so centring the hero inside that column left it sitting well
     right of the middle of the gap a reader actually sees, by 45-64px
     depending on width. Measured rather than derived from the CSS constants,
     because the logo does not render at the width its rule asks for. */
  function navInk(){
    const bar = document.getElementById('sidebar');
    if(!bar) return;
    /* The right edge of the sidebar's INK -- where what is drawn actually
       stops, which is nowhere near where its column stops (340px of column
       holding ~226px of logo and nav). The hero is centred against this.

       Measured with a Range over each text node, NOT with element boxes: a
       block-level element is as wide as its column whether or not its text
       is, so "dumb.co boycotts all big tech" in a full-width div reported an
       edge 100px to the right of the words and #home started there, clipping
       the hero. A Range reports the glyphs. */
    let right = 0;
    const walk = document.createTreeWalker(bar, NodeFilter.SHOW_TEXT);
    for(let n = walk.nextNode(); n; n = walk.nextNode()){
      if(!n.nodeValue.trim()) continue;
      const rng = document.createRange();
      rng.selectNodeContents(n);
      for(const r of rng.getClientRects()) if(r.width) right = Math.max(right, r.right);
    }
    bar.querySelectorAll('img, svg').forEach(el => {
      const r = el.getBoundingClientRect();
      if(r.width && r.height) right = Math.max(right, r.right);
    });
    if(!right) return;                       // leave the CSS fallback in place
    document.documentElement.style.setProperty('--nav-ink', Math.ceil(right) + 'px');
  }

  /* measured on every resize, and again once the resizing stops and anything
     still easing has landed -- a zoom is a burst of resizes, and the last one
     can arrive before layout has settled */
  let inkTimer = 0;
  window.addEventListener('resize', () => {
    logoHome(); phoneFit(); onBreakpoint(); navInk();
    clearTimeout(inkTimer); inkTimer = setTimeout(navInk, 650);
  });
  document.getElementById('sidebar')?.addEventListener('transitionend', navInk);
  logoHome();
  phoneFit();
  navInk();

  /* The hero is positioned from a measurement of the sidebar's ink, and the
     logo is type -- so the first measurement is taken in the fallback face
     and the answer changes when the webfont lands, which is why the headline
     visibly jumped (Jack: "is it intentional to have the 'your life is
     waiting for you' text move?"). It is not. #home is held back for that one
     reflow (18_quiz.css) instead of being allowed to land twice.

     The timeout is the safety net: if fonts.ready never settles the hero must
     still appear, so it is revealed on whatever measurement we have. */
  function settleInk(){
    navInk();
    document.documentElement.classList.add('ink-measured');
  }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(settleInk);
  else settleInk();
  setTimeout(settleInk, 1200);

  /* the mobile sheet stays hidden until this lands, so the .exe window cannot
     paint full-screen for a frame before the phone does */
  requestAnimationFrame(() => {
    document.documentElement.classList.add('m-ready');
    /* resizes animate from here on; the first fit never does */
    requestAnimationFrame(() => document.documentElement.classList.add('m-settled'));
  });
  window.addEventListener('orientationchange', () => setTimeout(() => { phoneFit(); onBreakpoint(); }, 120));

  /* ------------------------------------------------------- wiring it up */
  (function initPhone(){
    buildPhoneMenu();

    /* clicking the tab that is already open pops the window back out of the
       egg. 24_routes.js opens the section on every plain click now (it routes
       in place rather than following the href), so this only has to bring
       the window back first. */
    document.querySelectorAll('#navlist .navitem').forEach(el => {
      el.addEventListener('click', () => {
        if(el.classList.contains('external')) return;
        if(collapsed() && typeof expandModal === 'function') expandModal();
      });
    });

    /* every opener also updates the handset. Arguments pass straight
       through: 24_routes.js uses the second one to tell a back/forward
       apart from a click. */
    const _openSectionPhone = openSection;
    openSection = function(key){
      _openSectionPhone.apply(this, arguments);
      phoneReflect(key);
      /* if we're opening while minimised (the phone is the nav on mobile),
         refresh the mirror to the section just picked */
      if(collapsed()) phoneMirror(true);
    };

    /* minimising fills the screen with the window's content; restoring hands
       the screen back to the menu. Wrapped rather than edited in place so the
       baseline's own inline onclick="collapseModal()" keeps working. */
    if(typeof collapseModal === 'function'){
      const _collapse = collapseModal;
      collapseModal = function(){ _collapse.apply(this, arguments); phoneMirror(true); };
    }
    if(typeof expandModal === 'function'){
      const _expand = expandModal;
      expandModal = function(){ _expand.apply(this, arguments); phoneMirror(false); };
    }

    phoneFit();
    wasPhone = isPhone();
    /* on a cold load at phone width the home window is the first thing you
       see, same as desktop; closing it reveals the handset menu */
    /* true: this is the page setting itself up, not someone closing a
       section, so the address (a deep link like /press) is left alone */
    if(isPhone() && typeof collapseModal === 'function' && !collapsed()) collapseModal(true);
  })();

  /* ---------------- faq.exe ----------------
     Every question is in the page (src/site/sections/Faq.astro); the tabs
     show one category at a time. */
  let faqTab = 'general';
  function parseCsv(text){
    const rows = []; let row = []; let cell = ''; let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i+1];
      if (c === '"'){ if(inQuotes && n === '"'){ cell+='"'; i++; } else inQuotes = !inQuotes; continue; }
      if (c === ',' && !inQuotes){ row.push(cell); cell=''; continue; }
      if ((c === '\n' || c === '\r') && !inQuotes){
        if (c === '\r' && n === '\n') i++;
        row.push(cell);
        if (row.some(v=>v.trim()!=='')) rows.push(row);
        row = []; cell=''; continue;
      }
      cell += c;
    }
    if (cell.length>0 || row.length>0){ row.push(cell); if(row.some(v=>v.trim()!=='')) rows.push(row); }
    return rows;
  }

  function loadFaq(){ faqTab = 'general'; renderFaq(); }

  function setFaqTab(tab, el){
    faqTab = tab;
    document.querySelectorAll('.faq-tab2').forEach(t => t.classList.remove('on'));
    el.classList.add('on');
    renderFaq();
  }

  function renderFaq(){
    const list = document.getElementById('faq-list2');
    if(!list) return;
    let shown = 0;
    list.querySelectorAll('[data-cat]').forEach(el => {
      const on = el.dataset.cat === faqTab;
      el.style.display = on ? '' : 'none';
      if(on && el.dataset.cat !== 'none') shown++;
    });
    const status = document.getElementById('faq-status');
    if(status) status.style.display = shown ? 'none' : '';
  }

  function toggleFaq(idx){
    document.getElementById('faq-i-'+idx).classList.toggle('open');
  }


/* the functions the markup's onclick="..." handlers call */
Object.assign(window, {
  carouselStep, goToSlide, collapseModal, expandModal, goHome, openSection,
  memScroll, memStep, openMemory, openQuiz, phoneOk, phonePick, railStep,
  setFaqTab, shopPhotoStep, showPlans, teamKey, toggleFaq,
});
