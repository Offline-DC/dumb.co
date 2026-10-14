    about: () => `
      <div id="about-pink">
        <div id="about-top">
          <div class="txt">
            <!-- words: src/content/about.json -->
            <h2>${lines(COPY.about.heading)}</h2>
            ${paras(COPY.about.body)}
            ${COPY.about.sign_off ? `<p>${lines(COPY.about.sign_off)}</p>` : ``}
            <div id="about-signatures">
              ${A.signatures.map(s => `<img src="${s.src}" alt="${s.name}"/>`).join('')}
            </div>
          </div>
          <div id="about-photo">
            <img class="polaroid" src="${A.polaroid}" alt="dumb.co team polaroid"/>
            <img class="madeindc" src="${A.madeindc}" alt="made in D.C."/>
          </div>
        </div>

        <!-- TEAM + PHONE — parked, not deleted. The flip-phone illustration now
             lives on the desktop behind the .exe window (see #deskphone), and
             this block is commented out until we decide whether the team list
             comes back here. Uncomment to restore; setTeamPhoto() and the
             portraits are still in the build.
        <div id="about-team">
          <h3>the team</h3>
          <div class="team-wrap">
            <div class="team-names">
              ${teamMembers.map((m, i) => `
                <div class="team-row2" onmouseenter="setTeamPhoto(${i})" onfocus="setTeamPhoto(${i})" tabindex="0">
                  ${m.name}<span class="role">${m.role}</span>
                </div>
              `).join('')}
            </div>
            <div class="phone-frame">
              <div class="pf-screen"></div>
            </div>
          </div>
        </div>
        -->
      </div>
    `,
