    /* Community.exe — was "Get Involved". Afreka asked for Month Offline and
       Get Involved to merge into one Community section housing the organizing,
       career and community work; Jack asked for the contents to be dropdowns.
       The DIAL-UP sits at the bottom. `group dumb down` is parked below in a
       comment — it's one paste away when it comes back.
       (File keeps its old name so build.py's anchors stay put.) */
    community: () => `
      <div class="gi-page">
        <div class="dots">${DOTS_PAGE}</div>
        <div class="gi-in">
          <h2>Community</h2>
          <p class="gi-lede">everything we organize together — the challenge, the campus programme, and whatever you start next.</p>

          <div class="gi-drops">
            <details class="gi-drop">
              <summary>
                <span class="gi-sum">
                  <span class="gi-kicker">the 30&#8209;day challenge</span>
                  <span class="gi-name">Month Offline</span>
                </span>
                <span class="gi-chev" aria-hidden="true">+</span>
              </summary>
              <div class="gi-body">
                <p>a month without the smartphone, together. cohorts, meetups and a whole lot of people finding out what they do with the time.</p>
                <a class="gi-go" href="https://offline.community" target="_blank" rel="noopener noreferrer">go to Month Offline &#8599;</a>
              </div>
            </details>

            <details class="gi-drop">
              <summary>
                <span class="gi-sum">
                  <span class="gi-kicker">on campus</span>
                  <span class="gi-name">project xtraordinary</span>
                </span>
                <span class="gi-chev" aria-hidden="true">+</span>
              </summary>
              <div class="gi-body">
                <p>organize a dumb down at ur school and we'll <b>fund it</b> — money to break the shell, put on the event and get ur campus off the feed.</p>
                <a class="gi-go" href="https://luma.com/user/dumbco" target="_blank" rel="noopener noreferrer">sign up on luma &#8599;</a>
              </div>
            </details>
          </div>

          <!--  parked, per Jack: "Month Offline and Project Xtra-ordinary (for now)"
          <details class="gi-drop">
            <summary>
              <span class="gi-sum">
                <span class="gi-kicker">everyone else</span>
                <span class="gi-name">group<br/>dumb down</span>
              </span>
              <span class="gi-chev" aria-hidden="true">+</span>
            </summary>
            <div class="gi-body">
              <p>bring ur crew, office, team or block and everyone <b>gets $ off</b> their dumbphone plan. no campus required.</p>
              <a class="gi-go" href="mailto:organize@dumb.co">organize@dumb.co</a>
            </div>
          </details>
          -->

          <!-- the DIAL-UP sits at the bottom now, and bigger: it was competing
               with the section heading up top and nobody reads a signup form
               before they know what they are signing up for. -->
          <div id="newsletter" class="nl-big">
            <span class="nl-label"><span class="nl-kicker">the DIAL-UP</span><span class="nl-sub">catch up on dumb updates</span></span>
            <input type="email" placeholder="you@email.com" />
            <button type="button">subscribe</button>
          </div>

          <!-- one email, at the bottom -->
          <div class="gi-foot">
            <span>want to start something else? —</span>
            <a href="mailto:organize@dumb.co">organize@dumb.co</a>
          </div>
        </div>
      </div>
    `,
