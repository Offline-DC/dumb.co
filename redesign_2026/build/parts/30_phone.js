
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

  /* measured off assets/flipphone.png (560x921): the drawn phone occupies the
     alpha box x 29.8-75.4%, y 2.6-94.9%, and the four oval keys sit at
     x 39.4/63.3%, y 55.4/63.2% with OK at 52.1/59.3%. */
  const ART = { ratio: 921 / 560, drawnTop: 0.026, drawnH: 0.923, drawnW: 0.455,
                keysBottom: 0.655 };
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
    screen.insertAdjacentHTML('afterbegin',
      '<div class="pmn">' +
        '<div class="pmn-bar"><span>dumb.co</span><span>&#9679;&#9679;&#9679;</span></div>' +
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

  function phoneMirror(on){
    const screen = document.getElementById('tcl-screen');
    if(!screen) return;
    /* Never mirror on a phone. Below the breakpoint the handset IS the
       navigation, so replacing the menu with a picture of the section you
       just closed leaves nothing to tap -- Jack hit exactly this: "you can't
       go back to the main menu after clicking on something". On desktop the
       sidebar is still there, so the mirror costs nothing. */
    if(isPhone()) on = false;
    const menu = screen.querySelector('.pmn');
    let mir = screen.querySelector('.pmn-mirror');

    if(!on){
      if(mir) mir.remove();
      if(menu) menu.style.display = '';
      return;
    }

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

  /* the drawn keys: snake keeps first claim (including its ↑↑↓↓←→ unlock),
     the menu gets everything else */
  const _teamKeySnake = teamKey;
  teamKey = function(dir){
    if(snakeOn()){ _teamKeySnake(dir); return; }
    _teamKeySnake(dir);                  // feeds the unlock buffer
    if(snakeOn()) return;                // that press was the last of the unlock
    if(dir === 'up')    { phoneMove(-1); return; }
    if(dir === 'down')  { phoneMove(1);  return; }
    if(dir === 'right' || dir === 'ok'){ phoneOpen(pmSel); return; }
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
      setRowVars(frame.getBoundingClientRect().width || 420);
      return;
    }

    const logo = document.getElementById('logo');
    const band = logo ? logo.getBoundingClientRect().bottom + 10 : 56;
    const availH = Math.max(240, window.innerHeight - band - 6);
    const availW = Math.max(200, window.innerWidth - 20);

    /* scale until the D-pad reaches the bottom of the screen rather than the
       whole handset — the bigger of the two sizings from the review, which is
       the one we kept. The number keys crop off below. */
    let w = availH / ((ART.keysBottom - ART.drawnTop) * ART.ratio);
    w = Math.min(w, availW / ART.drawnW);

    root.style.setProperty('--mpw', Math.round(w) + 'px');
    root.style.setProperty('--mtop', Math.round(band - ART.drawnTop * ART.ratio * w) + 'px');
    setRowVars(w);
  }

  /* the screen is 30% x 25.2% of the image, so the menu is sized off the frame
     and always fits however big the handset is */
  function setRowVars(frameW){
    const root = document.documentElement;
    const screenH = 0.252 * ART.ratio * frameW;
    const n = Math.max(1, pmItems.length);
    const bar = Math.max(9, Math.round(screenH * 0.06));
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
    const now = isPhone();
    if(wasPhone === null){ wasPhone = now; return; }
    if(now === wasPhone) return;
    wasPhone = now;
    /* Crossing into phone width used to minimise whatever was open, so the
       thing you were reading vanished mid-resize. Jack: "the modal should
       stay up instead of closing". It stays; the handset zooms up behind it
       (the width transition in 29_responsive.css), and closing the window
       lands you on the menu. */
  }

  window.addEventListener('resize', () => { phoneFit(); onBreakpoint(); });
  window.addEventListener('orientationchange', () => setTimeout(() => { phoneFit(); onBreakpoint(); }, 120));

  /* ------------------------------------------------------- wiring it up */
  (function initPhone(){
    buildPhoneMenu();

    /* clicking the tab that is already open pops the window back out of the
       egg. The nav items are plain <a href="#/slug"> now, so an already-current
       slug fires no hashchange and nothing used to happen. */
    document.querySelectorAll('#navlist .navitem').forEach(el => {
      el.addEventListener('click', () => {
        if(el.classList.contains('external')) return;
        if(collapsed() && typeof expandModal === 'function') expandModal();
        if(location.hash === el.getAttribute('href')) openSection(el.dataset.key);
      });
    });

    /* every opener also updates the handset */
    const _openSectionPhone = openSection;
    openSection = function(key){
      _openSectionPhone(key);
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
    if(isPhone() && typeof collapseModal === 'function' && !collapsed()) collapseModal();
  })();
