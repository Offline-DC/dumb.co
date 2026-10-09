    /* Community.exe — was "Get Involved". Afreka asked for Month Offline and
       Get Involved to merge into one Community section housing the organizing,
       career and community work; Jack asked for the contents to be dropdowns.
       The DIAL-UP sits at the bottom. `group dumb down` is parked as a hidden
       program in community.json -- untick "hidden" in the CMS to bring it back.
       (File keeps its old name so build.py's anchors stay put.) */
    community: () => `
      <div class="gi-page">
        <div class="dots">${DOTS_PAGE}</div>
        <div class="gi-in">
          <!-- words: src/content/community.json. A program marked hidden in the
               CMS isn't drawn (that is where "group dumb down" is parked). -->
          <h2>${esc(COPY.community.heading)}</h2>
          ${COPY.community.lede ? `<p class="gi-lede">${rich(COPY.community.lede)}</p>` : ``}

          <div class="gi-drops">
            ${COPY.community.programs.map(pg => `
            <details class="gi-drop">
              <summary>
                <span class="gi-sum">
                  ${pg.kicker ? `<span class="gi-kicker">${esc(pg.kicker)}</span>` : ``}
                  <span class="gi-name">${lines(pg.name)}</span>
                </span>
                <span class="gi-chev" aria-hidden="true">+</span>
              </summary>
              <div class="gi-body">
                ${paras(pg.body)}
                ${pg.link_url ? `<a class="gi-go" href="${esc(pg.link_url)}"${/^https?:/i.test(pg.link_url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(pg.link_label || pg.link_url.replace(/^mailto:/i, ''))}</a>` : ``}
              </div>
            </details>`).join('')}
          </div>

          <!-- the DIAL-UP sits at the bottom now, and bigger: it was competing
               with the section heading up top and nobody reads a signup form
               before they know what they are signing up for. -->
          <div id="newsletter" class="nl-big">
            <span class="nl-label"><span class="nl-kicker">${esc(COPY.community.newsletter_title)}</span><span class="nl-sub">${esc(COPY.community.newsletter_sub)}</span></span>
            <input type="email" placeholder="${esc(COPY.community.newsletter_placeholder)}" />
            <button type="button">${esc(COPY.community.newsletter_button)}</button>
          </div>

          <!-- one email, at the bottom -->
          <div class="gi-foot">
            <span>${esc(COPY.community.footer_text)}</span>
            ${COPY.community.footer_email ? `<a href="mailto:${esc(COPY.community.footer_email)}">${esc(COPY.community.footer_email)}</a>` : ``}
          </div>
        </div>
      </div>
    `,
