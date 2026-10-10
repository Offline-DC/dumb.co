
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
