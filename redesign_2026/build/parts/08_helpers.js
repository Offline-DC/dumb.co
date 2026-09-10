
  /* ---------------- shop.exe ---------------- */
  function switchShopPhoto(el){
    document.getElementById('sh-main-img').src = el.dataset.full || el.src;
    el.parentElement.querySelectorAll('.sh-thumb').forEach(i => i.classList.remove('on'));
    el.classList.add('on');
  }

  /* horizontal carousels (users, reviews, event photos) share one stepper */
  function railStep(id, dir){
    const rail = document.getElementById(id);
    if(!rail) return;
    const first = rail.querySelector(':scope > *');
    const step = first ? first.getBoundingClientRect().width + 14 : 260;
    rail.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  /* ---------------- the subscription quiz ----------------
     This is the real thing: reference/subscription-quiz-FINAL-2026-08-18.html
     (the final build that was sitting in Downloads as index_10.html), copied to
     concept/quiz.html by the build and framed inside quiz.exe. Framing it
     rather than re-typing its questions keeps one source of truth — when the
     quiz is updated, drop the new file in reference/ and rebuild.
     Opens from "shop dumbphone 2" and from the spec-panel link. */
  function openQuiz(){
    setExeTitle('quiz');
    const host = document.getElementById('wm-section');
    host.innerHTML = `
      <div class="quizframe">
        <div class="qf-bar">
          <button type="button" class="wm-back" onclick="openSection('shop')">‹ back to Shop.exe</button>
          <a class="qf-open" href="quiz.html" target="_blank" rel="noopener">open on its own ↗</a>
        </div>
        <iframe class="qf-frame" src="quiz.html" title="dumb.co — find your plan"
                loading="lazy" referrerpolicy="no-referrer"></iframe>
        <noscript></noscript>
      </div>`;
    host.scrollTop = 0;
  }

  function renderAllPlans(){
    const host = document.getElementById('wm-section');
    host.innerHTML = `
      <div class="wm-pad">
        <div class="wm-back" onclick="openSection('shop')">‹ back to Shop.exe</div>
        <h2>the plans</h2>
        <div class="plan-table">
          ${Object.keys(PLANS).map(k => {
            const p = PLANS[k];
            return `
            <div class="plan-col ${p.theme}">
              <div class="pt-name">${p.name}</div>
              <div class="pt-price">${p.price}<span>/month</span></div>
              <div class="pt-blurb">${p.blurb}</div>
              <ul class="pt-feats">
                ${FEATURES.map((f, i) => `
                  <li class="${planHas(k, i) ? 'yes' : 'no'}"><span>${planHas(k, i) ? '✓' : '✗'}</span>${f}</li>
                `).join('')}
              </ul>
            </div>`;
          }).join('')}
        </div>
        <div class="qr-min" style="margin-top:16px;">4 month minimum, auto-renews monthly after that. u confirm the plan after ur purchase.</div>
        <div class="quiz-foot" style="margin-top:16px;">
          <a class="qr-cta" href="${DUMBPHONE_CHECKOUT}" target="_blank" rel="noopener">shop dumbphone 2 →</a>
          <button type="button" class="quiz-link" onclick="openQuiz()">take the quiz</button>
        </div>
      </div>`;
    host.scrollTop = 0;
  }

  /* ---------------- memories.exe ----------------
     Clicking a photo swaps the view inside this window, with a back button. */
  let memView = { ei: 0, pi: 0 };
  function openMemory(ei, pi){
    memView = { ei, pi };
    renderMemoryView();
  }
  function renderMemoryView(){
    const ev = MEMORY_EVENTS[memView.ei];
    const ph = ev.photos[memView.pi];
    const host = document.getElementById('wm-section');
    host.innerHTML = `
      <div class="wm-pad">
        <div class="wm-back" onclick="openSection('memories')">‹ all memories</div>
        <div class="memdetail">
          <div class="md-img"><img src="${ph.src()}" alt="${ev.name}"/></div>
          <div class="md-txt">
            <h4>${ev.name}</h4>
            <div class="md-when">${ev.when} · ${ev.where}</div>
            <p>${ev.blurb}</p>
            <div class="md-foot">
              <button type="button" onclick="memStep(-1)">‹ prev</button>
              <button type="button" onclick="memStep(1)">next ›</button>
              <span class="md-count">${memView.pi + 1} / ${ev.photos.length}</span>
            </div>
          </div>
        </div>
      </div>`;
    host.scrollTop = 0;
  }
  function memStep(dir){
    const ev = MEMORY_EVENTS[memView.ei];
    memView.pi = (memView.pi + dir + ev.photos.length) % ev.photos.length;
    renderMemoryView();
  }

  /* ---------------- about.exe: team ---------------- */
  function setTeamPhoto(i){
    if(typeof snake !== 'undefined' && snake) return;   // snake owns the screen
    document.querySelectorAll('#tcl-screen img').forEach(img => img.classList.remove('on'));
    const img = document.getElementById('tcl-photo-' + i);
    if(img) img.classList.add('on');
    const hint = document.getElementById('tcl-hint');
    if(hint) hint.style.display = 'none';
  }
