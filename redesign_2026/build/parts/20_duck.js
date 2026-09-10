
  /* ---------------- the walking duck ----------------
     Runs only while the window is collapsed into the egg. It walks from beside
     the logo across to the egg, turns around, and walks back. */
  let duckAnim = null;

  function duckWalkPath(){
    const logo = document.getElementById('logo').getBoundingClientRect();
    const egg  = document.getElementById('egg').getBoundingClientRect();
    const duckW = 62;
    const x0 = Math.round(logo.right + 12);
    const x1 = Math.round((egg.width ? egg.left : window.innerWidth - 100) - duckW - 12);
    return { x0, x1: Math.max(x1, x0 + 80) };
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

  window.addEventListener('resize', () => {
    if(document.getElementById('walkduck')?.classList.contains('on')) startDuckWalk();
  });
