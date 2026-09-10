
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
     560x921, drawn phone in the alpha bbox x 29.8-75.4%, y 2.6-94.9% */
  const M_ART = { ratio: 921 / 560, drawnTop: 0.026, drawnH: 0.923, drawnW: 0.455 };

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

    // image width from the drawn height, capped so the drawn width still fits
    let w = availH / (M_ART.drawnH * M_ART.ratio);
    w = Math.min(w, availW / M_ART.drawnW);

    stage.style.setProperty('--mpw', Math.round(w) + 'px');
    // pull the transparent strip above the drawing back up under the logo
    stage.style.setProperty('--mtop', Math.round(band - M_ART.drawnTop * M_ART.ratio * w) + 'px');

    /* the drawn screen is 25.2% of the image height; split what is left after
       the status bar between the items so nothing needs scrolling */
    const n = Math.max(1, mRows.length || 8);
    const screenH = 0.252 * M_ART.ratio * w;
    const rowH = Math.max(13, Math.floor((screenH - 14) / n));
    stage.style.setProperty('--mrowh', rowH + 'px');
    stage.style.setProperty('--mrowf', Math.max(8.5, Math.min(12.5, Math.round(rowH * 0.48 * 10) / 10)) + 'px');
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
    mPaint();
  }

  /* every opener also raises the sheet */
  const _openSectionMobile = openSection;
  openSection = function(key){
    document.getElementById('winmodal').classList.remove('collapsed');
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

  window.addEventListener('keydown', (e) => {
    if(mSheetOpen()) return;
    const map = {ArrowUp:'up', ArrowDown:'down', ArrowRight:'right', ArrowLeft:'left'};
    if(map[e.key]){ e.preventDefault(); teamKey(map[e.key]); }
    if(e.key === 'Enter'){ e.preventDefault(); mSelect(); }
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
