import './MonthOffline.css';

function MonthOffline() {
  return (
    <div className="month-offline">
      <div className="month-offline-container">
        <div className="month-offline-title-bar">
          <h1>Month Offline Challenge</h1>
        </div>
        <div className="month-offline-content">
          <img
            src="/img/mo_logo.png"
            alt="Month Offline Logo"
            className="month-offline-logo"
          />

          <h2>Take the Challenge</h2>

          <p>
            Disconnect from the noise. Reconnect with life. The Month Offline
            Challenge invites you to step away from your smartphone for 30 days
            and rediscover what matters most.
          </p>


          <div className="included-section">
            <h3 className="included-header">✦ Included: Dumb Phone I by dumb.co</h3>
            <p className="included-subtext">receive @ first meetup</p>
            
            <ul className="included-list">
              <li><span className="symbol">✧</span> dumbOS & Dumb Down app connects ur dumb & smart phone</li>
              <li className="sub-item"><span className="symbol">╰┈➤</span> 2 phones, 1 phone #</li>
              <li><span className="symbol">𖤓</span> calls, texts, contacts, synced</li>
              <li><span className="symbol">☼</span> respond 2 iMessage & group message from dumb phone</li>
              <li><span className="symbol">✰</span> unlimited calling & texting, 100 hours of emergency data</li>
              <li><span className="symbol">☺︎</span> 4 old-school tools for weekly creative exercises</li>
            </ul>
          </div>

          <div className="reservation-notice">
            <p className="deadline">⏰ Reservations 2 join close on <strong>February 26th</strong> or when the cohort is filled.</p>
            <p className="discount-info">✰ email <a href="mailto:month@offline.community">month@offline.community</a> for a discount code if u need financial support!</p>
            <p className="alt-option">if u already have a dumbphone, check out w/o the phone plan</p>
          </div>

          <div className="month-offline-features">
            <h3>What You Get:</h3>
            <ul>
              <li>30-day guided challenge experience</li>
              <li>Daily prompts and reflection exercises</li>
              <li>Access to the Month Offline community</li>
              <li>Digital detox toolkit and resources</li>
              <li>Certificate of completion</li>
            </ul>
          </div>

          <p>
            Join thousands of others who have taken the leap. Reclaim your time,
            attention, and peace of mind. Your future self will thank you.
          </p>

          <div className="schedule-section">
            <h2 className="schedule-header">📍 March 2026 Locations</h2>
            
            <div className="schedule-grid">
              <div className="schedule-card">
                <div className="schedule-card-header">
                  <span className="location-icon">🗽</span>
                  <h3>NYC</h3>
                </div>
                <ul className="schedule-list">
                  <li><span className="star">✰</span> march 2nd – 7pm, <em>orientation</em></li>
                  <li><span className="star">✰</span> march 9th – 7pm</li>
                  <li><span className="star">✰</span> march 16th – 7pm</li>
                  <li><span className="star">✰</span> march 23rd – 7pm</li>
                  <li><span className="star">✰</span> march 30th – 7pm, <em>graduation</em></li>
                  <li className="special-event"><span className="star">✰</span> april 9th – gallery exhibit & graduation party</li>
                </ul>
              </div>

              <div className="schedule-card">
                <div className="schedule-card-header">
                  <span className="location-icon">🏛️</span>
                  <h3>DC</h3>
                </div>
                <ul className="schedule-list">
                  <li><span className="star">✰</span> march 5th – 7pm, <em>orientation</em></li>
                  <li><span className="star">✰</span> march 12th – 7pm</li>
                  <li><span className="star">✰</span> march 19th – 7pm</li>
                  <li><span className="star">✰</span> march 26th – 7pm</li>
                  <li><span className="star">✰</span> april 2nd – 7pm, <em>graduation</em></li>
                  <li className="special-event"><span className="star">✰</span> april 9th – art gallery exhibit & graduation party</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="month-offline-image-row">
            <img src="https://shop.offline.community/cdn/shop/files/IMG_7135.jpg?v=1769106219" alt="Month Offline Badge 1" />
            <img src="https://shop.offline.community/cdn/shop/files/IMG_0080.heic?v=1769106189&width=2200" alt="Month Offline Badge 2" />
            <img src="https://shop.offline.community/cdn/shop/files/IMG_7136.jpg?v=1769106219" alt="Month Offline Badge 3" />
          </div>

          <a
            href="https://buy.stripe.com/aFa5kw11meDwaTN2Sc8N20b"
            target="_blank"
            rel="noopener noreferrer"
            className="register-button"
          >
            Register Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default MonthOffline;
