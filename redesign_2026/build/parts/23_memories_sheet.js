
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
  const MEMORIES_CSV_URL = "";

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
      if(url) ev.photos.push({ src: () => url, cap: (r[6] || '').trim() });
    });
    return out;
  }

  async function loadMemories(){
    if(!MEMORIES_CSV_URL) return;
    try {
      const res = await fetch(MEMORIES_CSV_URL, {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const events = memoriesFromRows(parseCsv(await res.text()));
      if(!events.length) return;                 // an empty sheet is a mistake, not a wipe
      MEMORY_EVENTS.splice(0, MEMORY_EVENTS.length, ...events);
      refreshMemories();
    } catch (e) {
      /* leave the built-in events in place */
    }
  }

  function refreshMemories(){
    if(typeof openKey !== 'undefined' && openKey === 'memories') openSection('memories');
  }

  loadMemories();
