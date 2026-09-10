    shop: () => `
      <div class="sh-hero">
        <div class="dots">${DOTS_EDGE}</div>
        <div class="hero-in">
          <div>
            <h3>DUMBPHONE 2</h3>
            <p class="hero-lines"><span>everything</span><span>u need 2</span><span>go out</span></p>
            <div class="hero-sync">can sync with ur smartphone</div>
            <button type="button" class="sh-cta" onclick="openQuiz()">click here to buy</button>
          </div>
          <div class="hero-phone"><img id="sh-main-img" src="${SHOP_PHOTOS[0]}" alt="dumbphone 2"/></div>
        </div>
      </div>

      <!-- product gallery: studio shots, alternating background colours -->
      <div class="sh-gallery">
        ${SHOP_PHOTOS.map((src, i) => `
          <img class="sh-thumb${i === 0 ? ' on' : ''}" src="${src}"
               onclick="switchShopPhoto(this)" alt="dumbphone 2"/>
        `).join('')}
      </div>

      <div class="wm-pad">
        <div class="sh-spec">
          <div class="spec-head">
            <span class="spec-name">dumbphone 2</span>
            <span class="spec-price">$20</span>
          </div>
          <ul>
            <li>$20 phone hardware with custom dumbOS + SIM card. plans start at $15.99/mo, activated when u receive the phone.</li>
            <li><b>4 month minimum plan, auto-renews monthly after that.</b></li>
            <li>every phone comes with the essentials: unlimited call/text, maps, signal, uber, 2-factor auth, bluetooth, hotspot, alarm, camera, weather + more.</li>
            <li>optional features: fwd calls from ur smartphone, sync smartphone texts + contacts, whatsapp, spotify, apple music, podcasts.</li>
            <li>iphone + android compatible.</li>
          </ul>
          <div class="spec-quiz"><a href="#" onclick="event.preventDefault(); openQuiz();"><b>take the plan quiz</b></a>, or <a href="#" onclick="event.preventDefault(); renderAllPlans();">Find out what plan works for you</a>.</div>
        </div>

        ${SHOW_PLAN_CARDS ? `
        <div class="shop-sec">
          <h3>the plans</h3>
          <div class="shs-sub">dumb, dumber, dumbest.</div>
          <div class="plan-cards">
            <img src="${A.planDumb}"    alt="dumb plan"/>
            <img src="${A.planDumber}"  alt="dumber plan"/>
            <img src="${A.planDumbest}" alt="dumbest plan"/>
          </div>
        </div>` : ``}

        <div class="shop-sec" style="margin-bottom:6px;">
          <div class="rail-head">
            <div>
              <h3>what dumb ppl say</h3>
              <div class="shs-sub">${starRow(5)} placeholder avg · placeholder reviews</div>
            </div>
            <div class="rail-nav">
              <button type="button" onclick="railStep('review-rail',-1)">‹</button>
              <button type="button" onclick="railStep('review-rail',1)">›</button>
            </div>
          </div>
          <div class="rail" id="review-rail">
            ${REVIEWS.map(r => `
              <div class="review-card">
                <div class="rc-top">
                  <div class="rc-av">${r.name.trim().charAt(0).toUpperCase()}</div>
                  <div>
                    <div class="rc-name">${r.name}</div>
                    <div class="rc-meta">${r.meta}</div>
                  </div>
                  <div style="margin-left:auto;">${starRow(r.stars)}</div>
                </div>
                <div class="rc-body">${r.body}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `,
