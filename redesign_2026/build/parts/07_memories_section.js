    memories: () => `
      <h2>${esc(COPY.memories.heading)}</h2>

      ${MEMORY_EVENTS.map((ev, ei) => `
        <div class="mem-event">
          <div class="mem-head">
            <h3>${esc(ev.name)}</h3>
            <span class="mem-when">${esc(ev.when)}</span>
            <span class="mem-where">${esc(ev.where)}</span>
          </div>
          ${(ev.blurb || '').trim() ? `
          ${paras(ev.blurb, 'mem-blurb')}` : ``}
          ${ev.photos.length === 0 ? `
          <div class="mem-pending">photos coming soon</div>` : `
          <div class="mem-carousel">
            <div class="mem-strip" id="mem-strip-${ei}">
              ${ev.photos.map((ph, pi) => `
                <div class="mem-tile" onclick="openMemory(${ei}, ${pi})">
                  <img src="${esc(ph.src())}" alt="${esc(ev.name)}"/>
                  ${(ph.cap || '').trim() ? `
                  <div class="mt-cap">${esc(ph.cap)}</div>` : ``}
                </div>
              `).join('')}
              ${ev.vimeoId ? `
              <div class="mem-tile video">
                <div class="mt-video">
                  <iframe src="https://player.vimeo.com/video/${encodeURIComponent(ev.vimeoId)}?title=0&byline=0&portrait=0&color=000000"
                    title="${esc(ev.name)}" loading="lazy"
                    allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="mt-cap">${esc(ev.name)} — video</div>
              </div>` : ``}
            </div>
            <div class="mem-nav">
              <button type="button" onclick="memScroll(${ei}, -1)" aria-label="scroll left">‹</button>
              <button type="button" onclick="memScroll(${ei}, 1)" aria-label="scroll right">›</button>
            </div>
          </div>`}
        </div>
      `).join('')}
    `,

