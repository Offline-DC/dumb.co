import type { CheckoutProduct, StripePrice } from "../../hooks/types/stripe";
import type { BillingView } from "../PhonePricing";
import styles from "./index.module.css";

function formatUsdCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

type Props = {
  product: CheckoutProduct;
  price: StripePrice;
  billing: BillingView;
  isExpanded?: boolean;
  onToggleInfo?: () => void;
};

export default function PricingOptionRow({
  product,
  price,
  billing,
  isExpanded = false,
  onToggleInfo,
}: Props) {
  const rawDescription = product.description ?? "";

  const descriptionItems = rawDescription
    .split("///")
    .map((s) => s.trim())
    .filter(Boolean);

  const checkoutUrl = `/checkout?price_id=${encodeURIComponent(price.id)}`;

  const rowButton = (
    <button
      type="button"
      className={`${styles.optionRow} ${styles.mobile}`}
      onClick={() => {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      }}
    >
      <div className={styles.optionLeft}>
        <div className={styles.optionName}>{product.name}</div>
      </div>

      <div className={styles.optionRight}>
        <div className={styles.price}>{formatUsdCents(price.unit_amount)}</div>
        <div className={styles.per}>/{billing === "year" ? "yr" : "mo"}</div>
      </div>
    </button>
  );

  return (
    <div className={styles.mobileAccordion}>
      <div className={styles.mobileRow}>
        <button
          type="button"
          className={styles.infoButton}
          aria-label={`${isExpanded ? "Hide" : "Show"} info about ${product.name}`}
          aria-expanded={descriptionItems.length > 0 ? isExpanded : undefined}
          onClick={(e) => {
            e.stopPropagation();
            // prevent triggering the row's click behavior in some browsers/layouts
            e.preventDefault();
            if (descriptionItems.length === 0) return;
            onToggleInfo?.();
          }}
        >
          i
        </button>

        {rowButton}
      </div>

      {descriptionItems.length > 0 && isExpanded && (
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
