    shop: () => `
      <div class="sh-hero">
        <div class="dots dots-wide">${DOTS_EDGE}</div>
        <div class="dots dots-narrow">${DOTS_SHOP_NARROW}</div>
        <div class="hero-in">
          <div>
            <h3>${esc(COPY.shop.product_name)}</h3>
            <p class="hero-lines">${COPY.shop.hero_lines.map(l => `<span>${esc(l)}</span>`).join('')}</p>
            <a class="sh-cta" href="${esc(DUMBPHONE_CHECKOUT)}" target="_blank" rel="noopener">${esc(COPY.shop.buy_button)}</a>
          </div>
          <div class="hero-phone">
            <button type="button" class="hp-arrow prev" onclick="shopPhotoStep(-1)" aria-label="previous photo">‹</button>
            <img id="sh-main-img" src="${SHOP_PHOTOS[0]}" data-i="0" alt="${esc(COPY.shop.product_name)}"/>
            <button type="button" class="hp-arrow next" onclick="shopPhotoStep(1)" aria-label="next photo">›</button>
            <div class="hp-dots">${SHOP_PHOTOS.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
          </div>
        </div>
      </div>


      <div class="wm-pad">
        <div class="sh-spec">
          <div class="spec-head">
            <span class="spec-name">${esc(COPY.shop.product_name)}</span>
            <span class="spec-price">${esc(COPY.shop.price)}</span>
          </div>
          ${COPY.shop.plan_line ? `<p class="spec-plan">${rich(COPY.shop.plan_line)}</p>` : ``}
          <ul>
            ${COPY.shop.highlights.map(h => `<li>${rich(h)}</li>`).join('')}
          </ul>
          ${COPY.shop.quiz_link ? `<div class="spec-quiz">${rich(COPY.shop.quiz_link)}</div>` : ``}
        </div>

        <!-- Milk's four drawers. Same .gi-drop furniture the community section
             uses, so the two stay in step. -->
        <div class="gi-drops sh-drops">
          <details class="gi-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">${esc(COPY.shop.what_is_title)}</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              ${paras(COPY.shop.what_is)}
            </div>
          </details>

          <details class="gi-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">${esc(COPY.shop.included_title)}</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              <ul class="sh-list">
                ${COPY.shop.included.map(x => `<li>${rich(x)}</li>`).join('')}
              </ul>
            </div>
          </details>

          <details class="gi-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">${esc(COPY.shop.essentials_title)}</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              <ul class="sh-list two-up">
                ${COPY.shop.essentials.map(x => `<li>${rich(x)}</li>`).join('')}
              </ul>
            </div>
          </details>

          <details class="gi-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">${esc(COPY.shop.specs_title)}</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              ${paras(COPY.shop.specs_intro)}
              <dl class="sh-specs">
                ${COPY.shop.specs.map(x => `<dt>${esc(x.label)}</dt><dd>${rich(x.value)}</dd>`).join('')}
              </dl>
            </div>
          </details>

          <!-- the plans, as a drawer beside specs. MARCO'S CARDS, not a
               rebuild of them: there was an HTML table here reproducing the
               three cards in divs, and it was only ever an approximation --
               his type, his spacing and his tick marks redrawn in CSS and
               drifting a little further every time either side changed. Milk
               asked for his design; this is his design.

               They sit in a drawer because at full size three 1500x946 cards
               are taller than the Shop.exe window twice over, and everything
               under them -- the reviews, the fine print -- got pushed off the
               bottom. A phone is the other way round: the cards ARE the plans
               page there, so plansDrawer() holds this open below 760px and the
               stylesheet takes the chevron off, which leaves mobile exactly as
               it is now. -->
          <details class="gi-drop plans-drop">
            <summary>
              <span class="gi-sum"><span class="gi-name">${esc(COPY.shop.plans_title)}</span></span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              <div class="plans-sub">${esc(COPY.shop.plans_sub)}</div>
              <div class="plan-cards">
                <img src="${A.planDumb}"    alt="the dumb plan, $25.99 a month"/>
                <img src="${A.planDumber}"  alt="the dumber plan, $20.99 a month"/>
                <img src="${A.planDumbest}" alt="the dumbest plan, $15.99 a month"/>
              </div>
              ${COPY.shop.plans_note ? `<div class="qr-min" style="margin-top:14px;">${rich(COPY.shop.plans_note)}</div>` : ``}
              <!-- the quiz used to be reached from the separate plans page,
                   which is gone; it lives with the plans now -->
              ${COPY.shop.quiz_button ? `<div class="quiz-foot" style="margin-top:14px;"><button type="button" class="quiz-link" onclick="openQuiz()">${esc(COPY.shop.quiz_button)}</button></div>` : ``}
            </div>
          </details>
        </div>
        <div class="shop-sec" style="margin-bottom:6px;">
          <div class="rail-head">
            <div>
              <h3>${esc(COPY.shop.reviews_heading)}</h3>
              <div class="shs-sub" id="review-sub">${starRow(5)} placeholder avg · placeholder reviews</div>
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

        <!-- Matteo: once someone has read to the bottom, ask them. The only
             buy button used to be in the hero, a full page of scrolling back
             up. Copy is the home page's own headline and the hero's own
             button label, both already approved, rather than new words. -->
        <div class="sh-end">
          <div class="dots">${DOTS_SHOP_END}</div>
          <div class="sh-end-in">
            <h3>${esc(COPY.shop.end_heading)}</h3>
            ${COPY.shop.end_line ? `<p>${rich(COPY.shop.end_line)}</p>` : ``}
            <a class="sh-cta" href="${esc(DUMBPHONE_CHECKOUT)}" target="_blank" rel="noopener">${esc(COPY.shop.buy_button)}</a>
          </div>
        </div>

      </div>
    `,
