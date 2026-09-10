    faq: () => `
      <h2>FAQ</h2>
      <div class="sub">frequently asked questions.</div>
      <div class="faq-tabs2">
        <div class="faq-tab2 on" onclick="setFaqTab('general', this)">General</div>
        <div class="faq-tab2" onclick="setFaqTab('tech', this)">Tech Help</div>
        <div class="faq-tab2" onclick="setFaqTab('demo', this)">Phone Demo</div>
      </div>
      <div id="faq-list2"><div id="faq-status">loading…</div></div>
    `,
