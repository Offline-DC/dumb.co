    memories: () => `
      <h2>Memories</h2>
      <div class="sub">the events we've actually done. click any photo to open it up.</div>

      ${MEMORY_EVENTS.map((ev, ei) => `
        <div class="mem-event">
          <div class="mem-head">
            <h3>${ev.name}</h3>
            <span class="mem-when">${ev.when}</span>
            <span class="mem-where">${ev.where}</span>
          </div>
          <p class="mem-blurb">${ev.blurb}</p>
          ${ev.photos.length === 0 ? `
          <div class="mem-pending">photos coming soon</div>` : `
          <div class="mem-carousel">
            <div class="mem-strip" id="mem-strip-${ei}">
              ${ev.photos.map((ph, pi) => `
                <div class="mem-tile" onclick="openMemory(${ei}, ${pi})">
                  <img src="${ph.src()}" alt="${ev.name}"/>
                  <div class="mt-cap">${ph.cap}</div>
                </div>
              `).join('')}
              ${ev.vimeoId ? `
              <div class="mem-tile video">
                <div class="mt-video">
                  <iframe src="https://player.vimeo.com/video/${ev.vimeoId}?title=0&byline=0&portrait=0&color=000000"
                    title="${ev.name}" loading="lazy"
                    allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="mt-cap">${ev.name} — video</div>
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
