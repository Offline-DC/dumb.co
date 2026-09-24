    about: () => `
      <div id="about-pink">
        <div id="about-top">
          <div class="txt">
            <h2>hello from<br/>the flip side.</h2>
            <p>dumb.co was born in Washington, DC in 2025 after a small group of neighbors came together to form Month Offline: a 30-day challenge to ditch our smartphones. we learned a lot along the way, and decided to design a device that's just dumb enough. the dumbphone 2 is a companion device that syncs with ur smartphone and includes maps, music, rideshare, and all ur messages (but only if u want). our little team is stoked that ur part of the growing movement of dumb ppl choosing dumb down.</p>
            <p>quack,<br/>the dumb.co team</p>
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
