    press: () => `
      <div id="press-mirror">
        <h1 class="pm-title">Press</h1>
        <div class="pm-sub"><a href="mailto:afreka@dumb.co">afreka@dumb.co</a></div>
        <div class="pm-list">
          ${PRESS_MIRROR.map((p) => `
            <a class="pm-row" href="${p.href}" target="_blank" rel="noopener">
              <img class="pm-thumb" src="${p.img}" alt="${p.source || p.title}"/>
              <div class="pm-body">
                <div class="pm-head">${p.title}</div>
                <div>
                  ${p.source ? `<div class="pm-source">• ${p.source}</div>` : ``}
                  <div class="pm-out">open article ↗</div>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `,
