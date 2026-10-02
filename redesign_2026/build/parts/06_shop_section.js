    shop: () => `
      <div class="sh-hero">
        <div class="dots">${DOTS_EDGE}</div>
        <div class="hero-in">
          <div>
            <h3>dumbphone 2</h3>
            <p class="hero-lines"><span>everything</span><span>u need 2</span><span>go out</span></p>
            <a class="sh-cta" href="${DUMBPHONE_CHECKOUT}" target="_blank" rel="noopener">click here to buy</a>
          </div>
          <div class="hero-phone">
            <button type="button" class="hp-arrow prev" onclick="shopPhotoStep(-1)" aria-label="previous photo">‹</button>
            <img id="sh-main-img" src="${SHOP_PHOTOS[0]}" data-i="0" alt="dumbphone 2"/>
            <button type="button" class="hp-arrow next" onclick="shopPhotoStep(1)" aria-label="next photo">›</button>
            <div class="hp-dots">${SHOP_PHOTOS.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
          </div>
        </div>
      </div>


      <div class="wm-pad">
        <div class="sh-spec">
          <div class="spec-head">
            <span class="spec-name">dumbphone 2</span>
            <span class="spec-price">$20</span>
            <a class="sh-buy" href="${DUMBPHONE_CHECKOUT}" target="_blank" rel="noopener">buy</a>
          </div>
          <p class="spec-plan">all phones come with a
            <a href="#" onclick="event.preventDefault(); renderAllPlans();">plan</a>
            starting at $15.99/mo + tax</p>
          <ul>
            <li>$20 phone hardware with custom dumbOS + SIM card. plans start at $15.99/mo + tax, activated when u receive the phone.</li>
            <li><b>4 month minimum plan, auto-renews monthly after that.</b></li>
            <li>every phone comes with the essentials: unlimited call/text, maps, signal, rideshare, 2-factor auth, bluetooth, hotspot, alarm, camera, weather + more.</li>
            <li>optional features: fwd calls from ur smartphone, sync smartphone texts + contacts, whatsapp, spotify, apple music, podcasts.</li>
            <li>iphone + android compatible.</li>
          </ul>
          <div class="spec-quiz"><a href="#" onclick="event.preventDefault(); renderAllPlans();"><b>Find out what plan works for you</b></a>.</div>
        </div>

        <!-- Milk's four drawers. Same .gi-drop furniture the community section
             uses, so the two stay in step. -->
        <div class="gi-drops sh-drops">
          <details class="gi-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">what is the dumbphone 2?</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              <p>a companion device that syncs with ur smartphone: maps, music, rideshare and all ur messages, but only if u want them. a highly modified TCL Flip 2 running our own dumbOS.</p>
            </div>
          </details>

          <details class="gi-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">what's included</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              <ul class="sh-list">
                <li>dumbphone 2 hardware</li>
                <li>SIM card w/ an active phone number &mdash; choose a brand new number or transfer ur current one</li>
                <li>monthly <a href="#" onclick="event.preventDefault(); renderAllPlans();">plan</a></li>
                <li>USB-C charging cable</li>
                <li>USB-C charging block</li>
              </ul>
            </div>
          </details>

          <details class="gi-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">essentials</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              <ul class="sh-list two-up">
                <li>active phone line</li>
                <li>unlimited calls and SMS texts</li>
                <li>1 GB data (all u need for a dumbphone)</li>
                <li>voice-to-text and TT9</li>
                <li>camera</li>
                <li>bluetooth and wifi</li>
                <li>maps</li>
                <li>rideshare (uber and lyft)</li>
                <li>2-factor authentication</li>
                <li>calendar (syncs with google cal)</li>
                <li>weather</li>
                <li>music streaming (spotify &amp; apple music)</li>
                <li>Signal</li>
                <li>WhatsApp</li>
                <li>clock (alarm, timer, stopwatch)</li>
                <li>recorder</li>
                <li>snake :p</li>
              </ul>
            </div>
          </details>

          <details class="gi-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">specs</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              <p>the dumbphone 2 is a highly modified version of the classic TCL Flip 2 with our custom dumbOS.</p>
              <dl class="sh-specs">
                <dt>screen</dt><dd>2.8&Prime; main screen and 1.44&Prime; outer screen for caller ID &amp; time</dd>
                <dt>battery</dt><dd>1,850 mAh, charges with USB-C</dd>
                <dt>camera</dt><dd>2MP rear camera</dd>
                <dt>storage</dt><dd>4GB storage, 1GB RAM &mdash; microSD slot for more photos and downloaded music</dd>
                <dt>connectivity</dt><dd>4G LTE</dd>
                <dt>carrier</dt><dd>T-Mobile</dd>
                <dt>wireless</dt><dd>wi-fi, bluetooth (connects with car audio), headphone jack</dd>
                <dt>weight</dt><dd>140g</dd>
                <dt>dimensions</dt><dd>4.2&Prime; &times; 2.2&Prime; &times; 0.8&Prime;</dd>
                <dt>color</dt><dd>blue (refurbished) or grey (new)</dd>
              </dl>
            </div>
          </details>
        </div>
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

        <!-- the plans, at the bottom. MARCO'S CARDS, not a rebuild of them.
             There was an HTML table here reproducing the three cards in divs
             and it was only ever an approximation -- his type, his spacing and
             his tick marks redrawn in CSS and drifting a little further every
             time either side changed. Milk asked for his design; this is his
             design. The flag that used to hide the real cards is gone with
             it. -->
        <div class="shop-sec sh-plans">
          <h3>the plans</h3>
          <div class="shs-sub">dumb, dumber, dumbest.</div>
          <div class="plan-cards">
            <img src="${A.planDumb}"    alt="the dumb plan, $25.99 a month"/>
            <img src="${A.planDumber}"  alt="the dumber plan, $20.99 a month"/>
            <img src="${A.planDumbest}" alt="the dumbest plan, $15.99 a month"/>
          </div>
          <div class="qr-min" style="margin-top:14px;">4 month minimum, auto-renews monthly after that. u confirm the plan after ur purchase.</div>
        </div>
      </div>
    `,
