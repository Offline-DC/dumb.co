
  /* ==========================================================================
     "you're on the desktop concept at phone width"
     index.html is the desktop layout and has no phone breakpoint on purpose —
     the phone version is a separate file. Opening this one in device emulation
     therefore looks broken, which is a trap worth removing rather than
     explaining. A bar appears under ~760px with a one-tap link to the mobile
     build, carrying the section you were on.
     The mobile build hides this bar (see build/parts/m01_mobile.css).
     Add ?desktop to the address to suppress it.
     ========================================================================== */
  (function mobileHint(){
    if(/mobile-(new|current)\.html$/.test(location.pathname)) return;
    if(/[?&]desktop\b/.test(location.search)) return;

    const bar = document.createElement('div');
    bar.id = 'mobhint';
    bar.innerHTML =
      '<span>this is the <b>desktop</b> concept &mdash; it has no phone layout</span>' +
      '<a id="mobhint-go">open the mobile build &rarr;</a>' +
      '<span id="mobhint-x" title="dismiss">&times;</span>';
    document.body.appendChild(bar);

    const go = bar.querySelector('#mobhint-go');
    const sync = () => { go.href = 'mobile-new.html' + (location.hash || ''); };
    sync();
    window.addEventListener('hashchange', sync);

    bar.querySelector('#mobhint-x').onclick = () => {
      bar.remove();
      try { sessionStorage.setItem('mobhint', 'off'); } catch(e){}
    };

    let off = false;
    try { off = sessionStorage.getItem('mobhint') === 'off'; } catch(e){}
    if(off){ bar.remove(); return; }

    const fit = () => bar.classList.toggle('on', window.innerWidth < 760);
    fit();
    window.addEventListener('resize', fit);
  })();
