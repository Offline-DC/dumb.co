import type { StripePrice } from "../../hooks/types/stripe";
import styles from "./index.module.css";

function formatUsdCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(0)}`;
}

type Props = {
  price: StripePrice;
};

export default function PricingOptionRow({ price }: Props) {
  const product = price.product;
  const rawDescription = product.description ?? "";

  const descriptionItems = rawDescription
    .split("///")
    .map((s) => s.trim())
    .filter(Boolean);

  const checkoutUrl = "https://buy.stripe.com/00w3cocK48f87HBakE8N20D";
  const ukPreorderUrl = "https://buy.stripe.com/dRm9AM7pK0MG6Dx78s8N20K";

  const handleClick = () => {
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  const handleUkClick = () => {
    window.open(ukPreorderUrl, "_blank", "noopener,noreferrer");
  };

  const rowButton = (
    <div className={`${styles.optionRow} ${styles.mobile}`}>
      <div className={styles.optionLeft}>
        <div className={styles.optionName}>dumbphone 2</div>
      </div>

      <div className={styles.optionRight}>
        <div className={styles.price}>{formatUsdCents(price.unit_amount)}</div>
      </div>
    </div>
  );

  const buyNowButton = (
    <button type="button" className={styles.buyNowButton} onClick={handleClick}>
      click here 2 buy!!!
      <span className={styles.buttonSubtext}>(US-only, ships by july 15)</span>
    </button>
  );

  const ukPreorderButton = (
    <button
      type="button"
      className={styles.ukPreorderButton}
      onClick={handleUkClick}
    >
      click here 2 pre-order!!!
      <span className={styles.buttonSubtext}>(UK, ships by sept 1)</span>
    </button>
  );

  return (
    <div className={styles.mobileAccordion}>
      <div className={styles.mobileRow}>{rowButton}</div>

      {descriptionItems.length > 0 && (
        <div
          className={styles.description}
          role="region"
          aria-label={`${product.name} description`}
        >
          <ul className={styles.descriptionList}>
            {descriptionItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {buyNowButton}
      {ukPreorderButton}
    </div>
  );
}
