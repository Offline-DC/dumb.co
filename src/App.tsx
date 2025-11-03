import { CTAButton } from "./CTAButton";

function App() {
  return (
    <main>
      <div className="page-container">
        <div>
          <img
            className="art"
            src="art.jpg"
            alt="dumb phone I — promo artwork"
          />
        </div>
        <CTAButton
          href="https://shop.offline.community/products/dumbphone-1"
          title="join the dumb community"
          ariaLabel="join the dumb community. half-step into dumb livin with dumb phone I — syncs with your iPhone. shop now."
        >
          <div className="line medium">
            half-step into dumb livin w/ dumb phone I
          </div>
          <div className="line small">syncs w/ ur iPhone</div>
        </CTAButton>
        <div className="ctas-container">
          <CTAButton
            href="https://shop.offline.community/products/month-offline-nyc"
            title="Month Offline – January – NYC"
          />
          <CTAButton
            href="https://shop.offline.community/products/month-offline-dc?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web"
            title="Month Offline – January – DC"
          />
          <CTAButton
            href="https://shop.offline.community/products/month-offline-anywhere"
            title="Dumb Organizers"
          />
        </div>
      </div>
    </main>
  );
}

export default App;
