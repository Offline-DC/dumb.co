
  /* ==========================================================================
     MOBILE BUILD shim (concept/mobile-new.html)

     Home state = the phone. The side-menu is rendered onto the illustration's
     screen and driven by the drawn D-pad; choosing an item opens the same
     .exe window the desktop uses, as a full-screen sheet, closed with the red
     button. The duck is not used on mobile (it walks between the logo and the
     egg, and neither is on this layout).

     Everything below the shell — data, section bodies, openSection, the
     carousel, the router, the quiz frame — is the code the desktop runs.
     ========================================================================== */

  /* the illustration's geometry, measured off assets/flipphone.png:
     560x921, drawn phone in the alpha bbox x 29.8-75.4%, y 2.6-94.9%.
     keysBottom is where the D-pad ends (pf-keys top 52.5% + height 13%). */
  const M_ART = { ratio: 921 / 560, drawnTop: 0.026, drawnH: 0.923, drawnW: 0.455,
                  keysBottom: 0.655 };

  /* Two ways to size the phone, because "how big should it be" is a taste call:
       'whole'  the entire phone fits the screen — nothing cropped, smaller menu
       'dpad'   scaled until the D-pad reaches the bottom of the screen, so the
                menu is much bigger and the number keys crop off below
     concept/mobile-new.html is 'whole'; concept/mobile-new-big.html sets
     window.DUMB_MOBILE_FIT = 'dpad' before this script runs (see
     build/build_mobile.py). */
  const M_FIT = (typeof window !== 'undefined' && window.DUMB_MOBILE_FIT === 'dpad')
    ? 'dpad' : 'whole';

  let mSel = 0;
  let mRows = [];

  (function mobileShell(){
    const app = document.getElementById('app');
    if(!app || document.getElementById('mstage')) return;

    const stage = document.createElement('div');
    stage.id = 'mstage';

    const logo  = document.getElementById('logo');
    const phone = document.getElementById('deskphone');
    if(logo)  stage.appendChild(logo);
    if(phone) stage.appendChild(phone);
    app.insertBefore(stage, app.firstChild);

    /* the menu goes on the phone's screen, built from the nav items so the
       labels, keys and the Month Offline link stay single-source */
    const items = [...document.querySelectorAll('#navlist .navitem')].map(el => ({
      key:      el.dataset.key,
      label:    (el.textContent || '').trim(),
      external: el.classList.contains('external'),
      href:     el.getAttribute('href') || '',
    }));

    const screen = document.getElementById('tcl-screen');
    if(screen){
      screen.innerHTML =
        '<div id="mmenu">' +
          '<div class="mm-bar"><span>dumb.co</span><span>&#9679;&#9679;&#9679;</span></div>' +
          '<div class="mm-list">' +
            items.map((it, i) =>
              '<a class="mm-row' + (i === 0 ? ' on' : '') + '" data-key="' + it.key + '"' +
              ' href="' + it.href + '"' +
              (it.external ? ' target="_blank" rel="noopener noreferrer"' : '') +
              ' onclick="mPick(' + i + ', event)">' + it.label +
              (it.external ? ' <span class="mm-ext">&#8599;</span>' : '') + '</a>'
            ).join('') +
          '</div>' +
        '</div>';
      mRows = items;
    }

    /* the illustration draws an OK button in the middle of the D-pad; the
       desktop only needed the four arrows, a phone needs select as well */
    const keys = document.querySelector('#deskphone .pf-keys');
    if(keys && !keys.querySelector('.k-ok')){
      const ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'k-ok';
      ok.setAttribute('aria-label', 'select');
      ok.addEventListener('click', () => mSelect());
      keys.appendChild(ok);
    }

    // the sidebar shell has been emptied out
    const aside = document.getElementById('sidebar');
    if(aside) aside.remove();

    const x = document.querySelector('#winmodal .wm-x');
    if(x){
      x.setAttribute('onclick', 'mobileClose()');
      x.setAttribute('aria-label', 'close');
    }

    const hint = document.createElement('div');
    hint.id = 'mhint';
    hint.textContent = 'mobile build — review at a phone width';
    document.body.appendChild(hint);

    /* how to drive the phone. Shown once per tab, and the ? badge brings it
       back — a phone-shaped menu is not a convention anyone has seen before. */
    const help = document.createElement('div');
    help.id = 'mhelp';
    help.innerHTML =
      '<div class="mh-card">' +
        '<div class="mh-q">?</div>' +
        '<p>to navigate, use the d&#8209;pad on screen or click on the tab you would like to see</p>' +
        '<button type="button" id="mhelp-ok">got it</button>' +
      '</div>';
    document.body.appendChild(help);

    const badge = document.createElement('button');
    badge.id = 'mhelp-badge';
    badge.type = 'button';
    badge.setAttribute('aria-label', 'how to navigate');
    badge.textContent = '?';
    document.body.appendChild(badge);

    const showHelp = () => help.classList.add('on');
    const hideHelp = () => {
      help.classList.remove('on');
      try { sessionStorage.setItem('mhelp', 'seen'); } catch(e){}
    };
    badge.onclick = showHelp;
    help.querySelector('#mhelp-ok').onclick = hideHelp;
    help.onclick = (e) => { if(e.target === help) hideHelp(); };

    let seen = false;
    try { seen = sessionStorage.getItem('mhelp') === 'seen'; } catch(e){}
    if(!seen) setTimeout(showHelp, 550);

    mFit();
    window.addEventListener('resize', mFit);
    window.addEventListener('orientationchange', () => setTimeout(mFit, 120));
  })();

  /* scale the phone so the drawn body fills the stage under the logo */
  function mFit(){
    const stage = document.getElementById('mstage');
    if(!stage) return;
    const logo = document.getElementById('logo');
    const band = logo ? logo.getBoundingClientRect().bottom + 10 : 56;
    const availH = Math.max(240, window.innerHeight - band - 6);
    const availW = Math.max(200, window.innerWidth - 20);

    // image width from whatever has to fit vertically, capped so the drawn
    // width still fits across
    const vFraction = M_FIT === 'dpad'
      ? (M_ART.keysBottom - M_ART.drawnTop)   // top of the phone -> end of the D-pad
      : M_ART.drawnH;                          // the whole phone
    let w = availH / (vFraction * M_ART.ratio);
    w = Math.min(w, availW / M_ART.drawnW);

    stage.style.setProperty('--mpw', Math.round(w) + 'px');
    // pull the transparent strip above the drawing back up under the logo
    stage.style.setProperty('--mtop', Math.round(band - M_ART.drawnTop * M_ART.ratio * w) + 'px');

    /* the drawn screen is 25.2% of the image height; split what is left after
       the status bar between the items so nothing needs scrolling */
    const n = Math.max(1, mRows.length || 8);
    const screenH = 0.252 * M_ART.ratio * w;
    const rowH = Math.max(13, Math.floor((screenH - 14) / n));
    const maxFont = M_FIT === 'dpad' ? 17 : 12.5;
    stage.style.setProperty('--mrowh', rowH + 'px');
    stage.style.setProperty('--mrowf', Math.max(8.5, Math.min(maxFont, Math.round(rowH * 0.46 * 10) / 10)) + 'px');
    stage.style.setProperty('--mbarf', (M_FIT === 'dpad' ? 10 : 8) + 'px');
  }

  /* --- menu: highlight, move, choose ----------------------------------- */
  function mPaint(){
    const rows = document.querySelectorAll('#mmenu .mm-row');
    rows.forEach((el, i) => el.classList.toggle('on', i === mSel));
    const cur = rows[mSel];
    if(cur && cur.scrollIntoView) cur.scrollIntoView({block:'nearest'});
  }

  function mMove(step){
    if(!mRows.length) return;
    mSel = (mSel + step + mRows.length) % mRows.length;
    mPaint();
  }

  /* a tap on a row selects it and opens it in one go */
  function mPick(i, ev){
    mSel = i;
    mPaint();
    const it = mRows[i];
    if(it && it.external) return;          // let the <a> open Month Offline
    if(ev) ev.preventDefault();
    mSelect();
  }

  function mSelect(){
    const it = mRows[mSel];
    if(!it) return;
    if(it.external){ window.open(it.href, '_blank', 'noopener'); return; }
    openSection(it.key);
  }

  /* --- the sheet -------------------------------------------------------- */
  function mSheetOpen(){
    return !document.getElementById('winmodal').classList.contains('collapsed');
  }

  function mobileClose(){
    if(typeof stopSnake === 'function') stopSnake();
    const w = document.getElementById('winmodal');
    w.classList.remove('sectionmode');
    w.classList.add('collapsed');
    document.getElementById('wm-section').innerHTML = '';
    document.querySelectorAll('.navitem').forEach(el => el.classList.remove('active'));
    if(typeof setExeTitle === 'function') setExeTitle('home');
    if(typeof setRoute === 'function') setRoute(null);
    document.body.classList.remove('sheet-open');
    mPaint();
  }

  /* every opener also raises the sheet */
  const _openSectionMobile = openSection;
  openSection = function(key){
    document.getElementById('winmodal').classList.remove('collapsed');
    /* body.sheet-open is what hides the ? badge and dims the review switcher.
       Without it the badge sat on top of the sheet's red x and swallowed the
       tap that closes the window. */
    document.body.classList.add('sheet-open');
    _openSectionMobile(key);
    document.getElementById('wm-section').scrollTop = 0;
    const i = mRows.findIndex(r => r.key === key);
    if(i >= 0){ mSel = i; mPaint(); }
  };

  /* the logo goes back to the phone, not to the flipoff.exe geometry */
  const _goHomeMobile = goHome;
  goHome = function(){ _goHomeMobile(); mobileClose(); };

  /* the D-pad drives the menu when the sheet is closed. When it is open the
     arrows belong to snake, which the desktop wires to the same hotspots. */
  const _teamKeyMobile = typeof teamKey === 'function' ? teamKey : null;
  teamKey = function(dir){
    if(mSheetOpen()){ if(_teamKeyMobile) _teamKeyMobile(dir); return; }
    if(dir === 'up')    { mMove(-1); return; }
    if(dir === 'down')  { mMove(1);  return; }
    if(dir === 'right') { mSelect(); return; }
    if(dir === 'left')  { return; }
    if(_teamKeyMobile) _teamKeyMobile(dir);
  };

  /* same keys as the desktop build: arrows move through the tabs, return
     confirms, escape minimises whatever the sheet is showing */
  window.addEventListener('keydown', (e) => {
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'
             || t.tagName === 'IFRAME' || t.isContentEditable)) return;

    if(e.key === 'Escape'){
      if(mSheetOpen()){ e.preventDefault(); mobileClose(); }
      return;
    }
    if(mSheetOpen()) return;

    /* The arrows are deliberately NOT handled here. 21_snake.js already listens
       for them and calls teamKey(), and the teamKey wrapper above sends them to
       this menu — so handling them here as well moved the highlight twice per
       press and appeared to skip a row. Return and space are ours; the arrows
       arrive through teamKey. */
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); mSelect(); }
  });

  /* swipe the flipoff.exe carousel */
  (function swipe(){
    const car = document.getElementById('wm-carousel');
    if(!car || typeof carouselStep !== 'function') return;
    let x0 = null;
    car.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, {passive:true});
    car.addEventListener('touchend', e => {
      if(x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if(Math.abs(dx) > 46) carouselStep(dx < 0 ? 1 : -1);
      x0 = null;
    }, {passive:true});
  })();

  /* home state on a phone is the phone, not a sheet over it — unless the
     address names a section, in which case land on it */
  if(typeof applyRoute === 'function' && typeof slugFromHash === 'function'
     && SLUG_TO_KEY[slugFromHash()]){
    applyRoute();
  } else {
    document.getElementById('winmodal').classList.add('collapsed');
  }
