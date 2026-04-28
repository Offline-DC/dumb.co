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

  const handleClick = () => {
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  const rowButton = (
    <button
      type="button"
      className={`${styles.optionRow} ${styles.mobile}`}
      onClick={handleClick}
    >
      <div className={styles.optionLeft}>
        <div className={styles.optionName}>{product.name}</div>
      </div>

      <div className={styles.optionRight}>
        <div className={styles.price}>{formatUsdCents(price.unit_amount)}</div>
      </div>
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
    </div>
  );
}
