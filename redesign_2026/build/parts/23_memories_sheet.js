
  /* ==========================================================================
     memories.exe — marketing can edit it without touching the code
     Same mechanism the FAQ already runs on (src/FAQContent.tsx reads a
     published Google Sheet as CSV): one row per photo, event columns repeated.

       event | date | city | blurb | vimeo id | photo url | caption

     Row order is display order, so putting a new event in the top rows puts it
     at the top of the page. An event with no photo rows renders "photos coming
     soon" — which is how baird sits there today.

     Until MEMORIES_CSV_URL is filled in (File > Share > Publish to web >
     Comma-separated values), the events built into this file are what shows,
     and they also stay as the fallback if the sheet is ever unreachable.
     ========================================================================== */
  /* One or more published sheets, applied in the order listed. More than one
     is the point: a standing sheet can hold the events as they are, and a
     second can be handed to whoever is running a new event without giving
     them edit access to everything that is already live. */
  const MEMORIES_CSV_URLS = [
    // "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",
  ];

  function memoriesFromRows(rows){
    if(!rows || !rows.length) return [];
    const first = rows[0] || [];
    const isHeader = first.some(v => (v||'').trim().toLowerCase() === 'event');
    const data = isHeader ? rows.slice(1) : rows;

    const out = [];
    const byName = new Map();
    data.forEach(r => {
      const name = (r[0] || '').trim();
      if(!name) return;
      let ev = byName.get(name);
      if(!ev){
        ev = { name,
               when:  (r[1] || '').trim(),
               where: (r[2] || '').trim(),
               blurb: (r[3] || '').trim(),
               vimeoId: (r[4] || '').trim() || null,
               photos: [] };
        byName.set(name, ev);
        out.push(ev);
      }
      const url = (r[5] || '').trim();
      if(url) ev.photos.push({ src: () => url, cap: (r[6] || '').trim(), url });
    });
    return out;
  }

  /* MERGE, not replace.

     This used to splice the sheet over MEMORY_EVENTS wholesale, which meant a
     sheet had to restate every event and every photo already on the page or
     they vanished -- and one malformed sheet took Memories down with it. It
     now merges, so a sheet only has to carry what it is adding.

     The rules, all chosen so that the quiet failure is "nothing happened"
     rather than "something disappeared":

       - events match on name, ignoring case and surrounding space, so
         "month offline gallery" finds the built-in one.
       - a name that matches nothing is a new event, appended after the
         built-ins in the order its rows appear.
       - a BLANK CELL MEANS "leave what is there". It does not mean "set this
         to empty". Someone adding a photo row should not have to retype the
         blurb to avoid wiping it.
       - photos append, deduped on the url, so re-running this or listing the
         same photo in two sheets cannot double it.

     What this deliberately cannot do is REMOVE a photo. Taking one down stays
     a code change, which given these are photographs of real people who have
     to consent to being on the site is the right place for it: a spreadsheet
     anyone can edit is not where that decision should live. */
  function mergeMemories(incoming){
    const key = s => (s || '').trim().toLowerCase();
    const byName = new Map(MEMORY_EVENTS.map(ev => [key(ev.name), ev]));
    let touched = false;

    incoming.forEach(inc => {
      const ev = byName.get(key(inc.name));
      if(!ev){
        MEMORY_EVENTS.push(inc);
        byName.set(key(inc.name), inc);
        touched = true;
        return;
      }
      ['when','where','blurb','vimeoId'].forEach(f => {
        if(inc[f]) { ev[f] = inc[f]; touched = true; }
      });
      /* dedupe on the sheet's own url -- never on src(), which for a built-in
         photo is an 80 KB data: URI and would be pointless to compare */
      const have = new Set(ev.photos.map(ph => ph.url).filter(Boolean));
      inc.photos.forEach(ph => {
        if(ph.url && have.has(ph.url)) return;
        ev.photos.push(ph);
        if(ph.url) have.add(ph.url);
        touched = true;
      });
    });
    return touched;
  }

  async function loadOne(url){
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return memoriesFromRows(parseCsv(await res.text()));
  }

  async function loadMemories(){
    const urls = (MEMORIES_CSV_URLS || []).filter(Boolean);
    if(!urls.length) return;

    /* fetched together, merged in the order they are listed, so the result
       does not depend on which sheet answers first */
    const results = await Promise.all(urls.map(u =>
      loadOne(u).catch(() => null)));           // one unreachable sheet must
                                                // not cost us the others
    let touched = false;
    results.forEach(events => {
      if(events && events.length) touched = mergeMemories(events) || touched;
    });
    if(touched) refreshMemories();
  }

  function refreshMemories(){
    if(typeof openKey !== 'undefined' && openKey === 'memories') openSection('memories');
  }

  loadMemories();
