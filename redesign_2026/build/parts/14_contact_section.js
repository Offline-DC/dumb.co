    contact: () => `
      <div class="contact-ground">
        <h2>${esc(COPY.contact.contact_heading)}</h2>
        <div class="contact-card support">
          <div class="dots">${DOTS_EDGE}</div>
          <div class="cc-head">
            <h3>${esc(COPY.contact.support_heading)}</h3>
            ${COPY.contact.support_tagline ? `<div class="card-sub">${esc(COPY.contact.support_tagline)}</div>` : ``}
          </div>
          <div class="cc-lines">
            <div class="contact-line"><span class="ico">✉</span><a href="mailto:${esc(COPY.contact.support_email)}">${esc(COPY.contact.support_email)}</a></div>
            ${COPY.contact.support_phone ? `<div class="contact-line"><span class="ico">☎</span><a href="tel:${esc(COPY.contact.support_phone.replace(/[^\d+]/g, ''))}">${esc(COPY.contact.support_phone)}</a></div>` : ``}
          </div>
          ${COPY.contact.hours.length ? `
          <div class="contact-hours-block">
            ${COPY.contact.hours.map(h => `<div class="hr-row"><span>${esc(h.days)}</span><b>${esc(h.hours)}</b></div>`).join('')}
          </div>` : ``}
        </div>
      </div>
    `,
