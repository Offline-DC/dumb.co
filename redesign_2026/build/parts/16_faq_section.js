    faq: () => `
      <!-- words: src/content/faq.json (Pages CMS: "FAQ") -->
      <h2>${esc(COPY.faq.heading)}</h2>
      ${COPY.faq.sub ? `<div class="sub">${esc(COPY.faq.sub)}</div>` : ``}
      <div class="faq-tabs2">
        <div class="faq-tab2 on" onclick="setFaqTab('general', this)">${esc(COPY.faq.general_tab)}</div>
        <div class="faq-tab2" onclick="setFaqTab('tech', this)">${esc(COPY.faq.tech_tab)}</div>
        ${COPY.faq.videos.length ? `<div class="faq-tab2" onclick="setFaqTab('demo', this)">${esc(COPY.faq.videos_tab)}</div>` : ``}
      </div>
      <div id="faq-list2"></div>
    `,
