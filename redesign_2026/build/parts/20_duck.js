
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
    const egg  = document.getElementById('egg');
    const duckW = duck.offsetWidth || 62;

    const x0 = leftWithin(logo, root) + (logo.offsetWidth || 0) + 12;
    /* the shake swings the egg's painted box about height*sin(6deg) past its
       layout box on each side, so the turn has to clear that as well as the
       egg itself -- 12px of gap was less than the swing alone. */
    const swing = Math.ceil((egg.offsetHeight || 70) * Math.sin(6 * Math.PI / 180));
    const eggX = egg.offsetWidth
      ? leftWithin(egg, root)
      : (root.clientWidth || window.innerWidth) - 100;
    const x1 = eggX - swing - duckW - 14;
    return { x0: Math.round(x0), x1: Math.round(Math.max(x1, x0 + 80)) };
  }

  function startDuckWalk(){
    const duck = document.getElementById('walkduck');
    if(!duck) return;
    stopDuckWalk();
    const { x0, x1 } = duckWalkPath();
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
  let pokeEl = null, pokeTimer = null;

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
    /* 16%..72% down: clear of the logo at the top and of the thumb's half of
       the keypad at the bottom */
    el.style.top = Math.round(h * (0.16 + Math.random() * 0.56)) + 'px';
    const fromRight = Math.random() < 0.5;
    el.style.left  = fromRight ? 'auto' : '0';
    el.style.right = fromRight ? '0' : 'auto';

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
    el.animate([
      { transform: `translateX(${hidden}px) scaleX(${flip})` },
      { transform: `translateX(${shown}px) scaleX(${flip})`, offset: 0.3 },
      { transform: `translateX(${shown}px) scaleX(${flip})`, offset: 0.7 },
      { transform: `translateX(${hidden}px) scaleX(${flip})` },
    ], { duration: 2800, easing: 'ease-in-out' });
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
