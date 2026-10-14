  /* The FAQ is src/content/faq.json, edited in Pages CMS, and built into the
     page (COPY.faq). It used to be the Google Sheet the live site reads,
     snapshotted at build time and then re-fetched in the browser; that
     fetch is gone along with the sheet. An answer can use **bold**,
     [links](https://...), and blank lines between paragraphs. */
  function loadFaq(){
    faqTab = 'general';
    faqItems = COPY.faq.questions;
    renderFaq();
  }

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
          ${COPY.faq.videos.map(v => `
            <div class="faq-video-card">
              <div class="faq-video-title">${esc(v.title)}</div>
              <div class="faq-video-embed">
                <iframe
                  src="https://player.vimeo.com/video/${encodeURIComponent(v.vimeoId)}?title=0&byline=0&portrait=0&color=000000"
                  title="${esc(v.title)}" loading="lazy"
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
        <div class="faq-q2" onclick="toggleFaq(${idx})"><span>${esc(item.question)}</span><span>+</span></div>
        <div class="faq-a2">${paras(item.answer)}</div>
      </div>
    `).join('');
  }
