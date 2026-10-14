    press: () => `
      <div id="press-mirror">
        <h1 class="pm-title">${esc(COPY.press.heading)}</h1>
        ${COPY.press.contact_email ? `<div class="pm-sub"><a href="mailto:${esc(COPY.press.contact_email)}">${esc(COPY.press.contact_email)}</a></div>` : ``}
        <div class="pm-list">
          ${PRESS_MIRROR.map((p) => `
            <a class="pm-row" href="${esc(p.href)}" target="_blank" rel="noopener">
              <img class="pm-thumb" src="${p.img}" alt="${esc(p.source || p.title)}"/>
              <div class="pm-body">
                <div class="pm-head">${esc(p.title)}</div>
                <div>
                  ${p.source ? `<div class="pm-source">• ${esc(p.source)}</div>` : ``}
                  <div class="pm-out">open article ↗</div>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `,
