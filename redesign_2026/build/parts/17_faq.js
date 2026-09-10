  /* rows -> the shape renderFaq wants. Same columns as the live site's
     FAQContent.tsx: question, three answer columns, type. */
  function faqItemsFromRows(rows){
    const [first, ...rest] = rows || [];
    const isHeader = first?.some(v => (v || '').trim().toLowerCase() === 'question');
    const data = isHeader ? rest : (rows || []);
    return data.map(r => ({
      question: r[0]?.trim() ?? '',
      answer: [r[1], r[2], r[3]].map(a => a?.trim()).filter(Boolean).join(' '),
      category: (r[4] || '').toLowerCase().includes('tech') ? 'tech' : 'general',
    })).filter(i => i.question && i.answer);
  }

  /* FAQ.exe used to show nothing but "questions are loading in from the
     sheet" — because it only ever had the live fetch. Google's published-CSV
     endpoint redirects to a googleusercontent host that doesn't answer with
     CORS headers on the final hop, and a page opened from a file:// path has a
     null origin on top of that, so the fetch fails and there was no fallback.

     So the build embeds a snapshot of the sheet (build/build.py writes
     FAQ_SNAPSHOT from assets/faq_snapshot.csv). The snapshot renders
     immediately, every time, with no network at all — then the live fetch is
     still attempted, and replaces it if it succeeds. Re-snapshot with:

         python3 build/refresh_faq_snapshot.py && python3 build/build.py
  */
  async function loadFaq(){
    const snapshot = (typeof FAQ_SNAPSHOT !== 'undefined') ? faqItemsFromRows(FAQ_SNAPSHOT) : [];
    if(snapshot.length){
      faqItems = snapshot;
      renderFaq();
    } else {
      const list = document.getElementById('faq-list2');
      if(list) list.innerHTML = '<div id="faq-status">questions are loading in from the sheet — one sec.</div>';
    }

    try {
      const res = await fetch(FAQ_CSV_URL, {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const live = faqItemsFromRows(parseCsv(await res.text()));
      if(live.length){
        faqItems = live;
        renderFaq();
      }
    } catch (e) {
      /* the snapshot is already on screen; nothing to say */
    }
  }

  /* Phone Demo — same source shape as src/FAQVideos/videos_data.md.
     Titles are Vimeo's own for each ID. */
  const demoVideos = [
    { title: "setting up the dumbphone 2",       vimeoId: "1205491825" },
    { title: "setting up the dumb plan",         vimeoId: "1209576549" },
    { title: "T9 bootcamp! (& voice 2 text)",    vimeoId: "1215826540" },
  ];

  function setFaqTab(tab, el){
    faqTab = tab;
    document.querySelectorAll('.faq-tab2').forEach(t => t.classList.remove('on'));
    el.classList.add('on');
    renderFaq();
  }

  function renderFaq(){
    const list = document.getElementById('faq-list2');
    if(!list) return;

    if(faqTab === 'demo'){
      list.innerHTML = `
        <div class="faq-videos">
          ${demoVideos.map(v => `
            <div class="faq-video-card">
              <div class="faq-video-title">${v.title}</div>
              <div class="faq-video-embed">
                <iframe
                  src="https://player.vimeo.com/video/${v.vimeoId}?title=0&byline=0&portrait=0&color=000000"
                  title="${v.title}" loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowfullscreen></iframe>
              </div>
            </div>
          `).join('')}
        </div>`;
      return;
    }

    const visible = faqItems.filter(i => i.category === faqTab);
    if(visible.length === 0){ list.innerHTML = '<div id="faq-status">nothing in this tab yet.</div>'; return; }
    list.innerHTML = visible.map((item, idx) => `
      <div class="faq-item2" id="faq-i-${idx}">
        <div class="faq-q2" onclick="toggleFaq(${idx})"><span>${item.question}</span><span>+</span></div>
        <div class="faq-a2">${item.answer}</div>
      </div>
    `).join('');
  }
