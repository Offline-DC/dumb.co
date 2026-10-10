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
    history.pushState(null, '', next + location.search);
  }

  function applyRoute(){
    const key = SLUG_TO_KEY[currentSlug()];
    if(key && sections[key]) openSection(key, true);
    else goHome(true);
  }

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
