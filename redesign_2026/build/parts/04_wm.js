  /* ==========================================================================
     v8 — one window, reused
     Nav items no longer spawn pop-ups. They retitle and refill #winmodal, which
     is the same frame flipoff.exe lives in on the home state. The .exe names
     below are the ones written on the mock-up slides.
     ========================================================================== */
  const EXE = {
    home:     "flipoff.exe",
    about:    "about.exe",
    shop:     "Shop.exe",
    community: "Community.exe",
    press:    "Press.exe",
    memories: "Memories.exe",
    faq:      "FAQ.exe",
    contact:  "Contact.exe",
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

  // remember the flipoff.exe geometry so going home restores it exactly
  let homeGeom = null;
  let openKey = null;   // which section the window is showing
  function rememberHomeGeom(){
    if(homeGeom) return;
    const w = winEl(), r = w.getBoundingClientRect();
    homeGeom = { left:r.left, top:r.top, width:r.width, height:r.height };
  }

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

  function openSection(key){
    if(!sections[key]) return;
    if(typeof stopSnake === 'function') stopSnake();
    /* the duck only walks while the window is in the egg; opening a section
       from that state used to leave it walking over the open window */
    if(typeof stopDuckWalk === 'function') stopDuckWalk();
    rememberHomeGeom();

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
  }

  function goHome(){
    openKey = null;
    if(typeof stopSnake === 'function') stopSnake();
    const w = winEl();
    w.classList.remove('sectionmode');
    setExeTitle('home');
    sectionEl().innerHTML = '';
    if(homeGeom){
      w.style.left = homeGeom.left + 'px';
      w.style.top = homeGeom.top + 'px';
      w.style.width = homeGeom.width + 'px';
      w.style.height = homeGeom.height + 'px';
    }
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
  });
