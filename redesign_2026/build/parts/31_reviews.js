
  /* ---------------------------------------------------------------- reviews
     Same two-step as FAQ.exe: REVIEWS_SNAPSHOT (baked in at build time from
     assets/reviews_snapshot.csv) renders instantly with no network, then the
     live sheet replaces it if the fetch succeeds. A visitor on a bad connection
     still sees reviews; a review hidden in the sheet disappears without a
     deploy.

     Paste the published-CSV URL here and in build/refresh_reviews_snapshot.py.
     Empty means snapshot only, which is a perfectly good state to ship in. */
  const REVIEWS_CSV_URL = '';

  function reviewsFromRows(rows){
    if(!rows || !rows.length) return {list: [], avg: '', count: ''};
    const head = rows[0].map(c => String(c || '').trim().toLowerCase());
    const col  = (r, n) => { const i = head.indexOf(n); return i < 0 ? '' : String(r[i] || '').trim(); };
    const body = rows.slice(1).filter(r => r && r.some(c => String(c || '').trim()));

    const list = body
      .filter(r => (col(r, 'show').toLowerCase() || 'yes') !== 'no')
      .map(r => ({
        order: parseInt(col(r, 'order'), 10) || 999,
        /* the Places API gives review text but not reviewer names, so blank is
           the normal case rather than an error */
        name:  col(r, 'name') || 'via Google',
        /* the avatar is the name's initial, which for the unnamed fallback
           would be a stray "V" -- use Google's G instead */
        avatar: (col(r, 'name') || '').trim().charAt(0).toUpperCase() || 'G',
        meta:  col(r, 'meta'),
        stars: Math.max(1, Math.min(5, parseInt(col(r, 'stars'), 10) || 5)),
        body:  col(r, 'body'),
      }))
      .filter(r => r.body)
      .sort((a, b) => a.order - b.order);

    /* avg and count describe the whole profile, not a row, so they sit on the
       first row only -- read the first non-empty one rather than assuming */
    const first = (n) => { for(const r of body){ const v = col(r, n); if(v) return v; } return ''; };
    return {list: list, avg: first('avg_rating'), count: first('review_count')};
  }

  function paintReviews(data){
    const rail = document.getElementById('review-rail');
    if(!rail || !data.list.length) return;
    rail.innerHTML = data.list.map(r => `
      <div class="review-card">
        <div class="rc-top">
          <div class="rc-av">${r.avatar}</div>
          <div>
            <div class="rc-name">${r.name}</div>
            <div class="rc-meta">${r.meta}</div>
          </div>
          <div style="margin-left:auto;">${starRow(r.stars)}</div>
        </div>
        <div class="rc-body">${r.body}</div>
      </div>`).join('');

    const sub = document.querySelector('.shs-sub');
    if(sub && data.avg && data.count){
      /* Google's terms want their reviews attributed, so the source is named
         rather than implied */
      sub.innerHTML = starRow(Math.round(parseFloat(data.avg) || 5)) +
        ' ' + data.avg + ' · ' + data.count + ' reviews on Google';
    }
  }

  async function loadReviews(){
    /* paint the snapshot first so the rail is right the moment the section
       opens -- 05_data.js still carries placeholder REVIEWS for the initial
       markup, and this replaces them before anyone reads them */
    if(typeof REVIEWS_SNAPSHOT !== 'undefined'){
      const snap = reviewsFromRows(REVIEWS_SNAPSHOT);
      if(snap.list.length) paintReviews(snap);
    }
    if(!REVIEWS_CSV_URL) return;              // snapshot only; nothing to upgrade to
    try{
      const res = await fetch(REVIEWS_CSV_URL, {cache:'no-store'});
      if(!res.ok) return;                     // keep the snapshot, say nothing
      const data = reviewsFromRows(parseCsv(await res.text()));
      if(data.list.length) paintReviews(data);
    }catch(e){ /* offline, blocked, sheet unpublished: the snapshot stands */ }
  }
