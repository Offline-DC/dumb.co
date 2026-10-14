  /* ==========================================================================
     content
     ========================================================================== */
  /* SHOW_PLAN_CARDS is gone: Marco's cards are no longer optional, they
     ARE the plans. */
  const DUMBPHONE_CHECKOUT = COPY.shop.checkout_url;     // shop.json; build.py keeps it https

  /* ---- copy from src/content (Pages CMS) into markup ----------------------
     Everything a CMS user types is escaped. On top of that, three bits of
     formatting, because the copy already uses them:
       **bold**
       [words](https://...)  a link; [words](plans) opens the plans
       a line break          stays a line break                          */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const lines = (s) => esc(s).replace(/\n/g, '<br/>');
  function rich(s){
    return esc(s)
      .replace(/\*\*\*(.+?)\*\*\*/g, '<b>$1</b>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
        if(u === 'plans') return `<a href="#" onclick="event.preventDefault(); showPlans();">${t}</a>`;
        const raw = u.replace(/&amp;/g, '&');
        if(/^(mailto|tel):/i.test(raw)) return `<a href="${u}">${t}</a>`;
        if(/^https?:\/\//i.test(raw)) return `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
        return t;
      })
      .replace(/\n/g, '<br/>');
  }
  /* blank lines split paragraphs */
  const paras = (s, cls) => String(s || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    .map(p => `<p${cls ? ` class="${cls}"` : ''}>${rich(p)}</p>`).join('');

  /* ---- confetti ----------------------------------------------------------
     Deterministic pseudo-random dot fields, so every rebuild lays them out
     identically. avoid = [l,t,w,h] in %, a zone to keep clear (headings). */
  const DOT_SIZE = 12;
  const DOT_COLORS = ['var(--orange)','var(--blue)','var(--pink)','var(--white)','var(--black)','var(--yellow)'];
  function makeDots(count, seed, avoid){
    let s = seed * 2654435761 % 2147483647;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const out = [];
    const zones = !avoid ? [] : (Array.isArray(avoid[0]) ? avoid : [avoid]);
    let guard = 0;
    while(out.length < count && guard++ < count * 60){
      const l = 1 + rnd() * 95, t = 1 + rnd() * 94;
      if(zones.some(z => l > z[0] && l < z[0] + z[2] && t > z[1] && t < z[1] + z[3])) continue;
      const size = DOT_SIZE;      // the confetti is only ever one size
      const c = DOT_COLORS[Math.floor(rnd() * DOT_COLORS.length)];
      out.push(`<i style="left:${l.toFixed(1)}%;top:${t.toFixed(1)}%;width:${size}px;height:${size}px;background:${c};"></i>`);
    }
    return out.join('');
  }
  const DOTS      = makeDots(20, 7);
  const DOTS_EDGE = makeDots(18, 11, [0, 0, 62, 58]);   // clear of a top-left heading
  /* Shop.exe's hero on a phone is ONE column -- heading, three lines and the
     button stacked down the left, the photo below them -- so DOTS_EDGE's
     "clear of a top-left heading" zone no longer covers where the words are,
     and dots landed inside "everything u need 2 go out" (Kunal: "some of the
     neurons make it hard to read"). This field keeps clear of the whole text
     block; anything under the photo is hidden by the photo anyway. */
  const DOTS_SHOP_NARROW = makeDots(14, 11, [0, 0, 80, 46]);
  const DOTS_SHOP_END    = makeDots(12, 5,  [0, 0, 72, 100]);
  const DOTS_PAGE = makeDots(46, 3,  [[0, 0, 46, 20], [0, 70, 100, 30]]);  // clear of the heading and the bottom rows
  const DOTS_CARD = (seed) => makeDots(11, seed, [0, 0, 74, 46]);

  /* ---- the three plans, straight off the plan cards ---- */
  const FEATURES = ["spotify","apple music","podcasts","fwd calls","sync txts/contacts",
                    "unlimited calls/sms","hotspot","rideshare","signal","whatsapp","2-factor authentication"];
  const PLANS = {
    dumb: {
      name:"dumb", price:"$25.99", blurb:"a companion device for ur smartphone",
      art:() => A.planDumb, theme:"dumb", has:11,
      why:"u want the dumbphone to do everything — including ur music and podcasts.",
    },
    dumber: {
      name:"dumber", price:"$20.99", blurb:"a companion device for ur smartphone",
      art:() => A.planDumber, theme:"dumber", has:8,
      why:"u want ur texts, contacts and forwarded calls, but music can stay on the smartphone.",
    },
    dumbest: {
      name:"dumbest", price:"$15.99", blurb:"a standalone device; no connection to a smartphone",
      art:() => A.planDumbest, theme:"dumbest", has:6,
      why:"this is ur only phone. nothing to sync, nothing to forward.",
    },
  };
  // features are strictly nested: dumb has all 11, dumber the last 8, dumbest the last 6
  const planHas = (plan, i) => i >= FEATURES.length - PLANS[plan].has;

  /* PLACEHOLDER copy — swap for the real thing */
  const REVIEWS = [
    { name:"placeholder name", meta:"dumbphone 2 · 5 months", stars:5,
      body:"placeholder review copy. real layout, fake words." },
    { name:"placeholder name", meta:"dumbphone 2 · 7 months", stars:5,
      body:"placeholder review copy. about this much text per quote keeps the cards even." },
    { name:"placeholder name", meta:"month offline · dc", stars:4,
      body:"placeholder review copy. a 4-star one on purpose, so we can see a non-perfect rating." },
    { name:"placeholder name", meta:"dumbphone 2 · 4 months", stars:5,
      body:"placeholder review copy. the shortest realistic quote length." },
    { name:"placeholder name", meta:"friend fone · 6 months", stars:5,
      body:"placeholder review copy. a fifth card so the carousel has somewhere to scroll." },
  ];

  /* MEMORY_EVENTS comes from src/content/memories.json (build.py). */

  const starRow = (n) => `<span class="stars">${"★".repeat(n)}${"☆".repeat(5-n)}</span>`;
