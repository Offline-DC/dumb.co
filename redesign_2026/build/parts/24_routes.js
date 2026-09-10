
  /* ==========================================================================
     addressable sections  (Jack's note: every page should have an address
     people can copy and paste)

     The prototype is one static file, so a real path (/shop) can't survive a
     reload — pasting it into a new tab would 404. The slug therefore rides in
     the hash: index.html#/shop, index.html#/get_involved. It copies, pastes,
     bookmarks, reloads and back-buttons correctly, and the nav items are real
     <a href> elements, so right-click > copy link address works too.

     ROUTES (built by build.py from NAV_ITEMS) is the same slug map the React
     port should hand to react-router, where they become dumb.co/shop etc.
     ========================================================================== */
  const SLUG_TO_KEY = Object.fromEntries(Object.entries(ROUTES).map(([k, s]) => [s, k]));

  let routing = false;          // set while we are the ones changing the hash

  function slugFromHash(){
    const h = (location.hash || '').replace(/^#\/?/, '').replace(/\/$/, '');
    return h.toLowerCase();
  }

  function setRoute(key){
    const slug = key ? ROUTES[key] : null;
    const next = slug ? '#/' + slug : '';
    const here = location.hash || '';
    if(here === next || (!slug && here === '')) return;
    routing = true;
    try {
      if(slug) location.hash = '#/' + slug;
      else if(history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      else location.hash = '';
    } finally {
      // hashchange fires on the next tick
      setTimeout(() => { routing = false; }, 0);
    }
  }

  function applyRoute(){
    const key = SLUG_TO_KEY[slugFromHash()];
    if(key && sections[key]) openSection(key);
    else goHome();
  }

  window.addEventListener('hashchange', () => { if(!routing) applyRoute(); });

  /* wrap the openers so the address follows whatever the window is showing */
  const _openSectionRoute = openSection;
  openSection = function(key){
    _openSectionRoute(key);
    setRoute(key);
  };
  const _goHomeRoute = goHome;
  goHome = function(){
    _goHomeRoute();
    setRoute(null);
  };

  /* a deep link should land on that section rather than the home carousel */
  if(SLUG_TO_KEY[slugFromHash()]) applyRoute();
