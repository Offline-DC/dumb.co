import { useMemo } from "react";
import type { CheckoutProduct, StripePrice } from "../../hooks/types/stripe";
import type { BillingView } from "../PhonePricing";
import Tooltip from "../Tooltip";
import styles from "./index.module.css";

function formatUsdCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

type Props = {
  product: CheckoutProduct;
  price: StripePrice;
  billing: BillingView;
  onClick: () => void;
  isExpanded?: boolean;
  onToggleInfo?: () => void;
};

export default function PricingOptionRow({
  product,
  price,
  billing,
  onClick,
  isExpanded = false,
  onToggleInfo,
}: Props) {
  const description = useMemo(
    () => (product.description ?? "").trim(),
    [product.description],
  );

  const rowButton = (
    <button
      type="button"
      className={`${styles.optionRow} ${styles.mobile}`}
      onClick={onClick}
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
          aria-expanded={description ? isExpanded : undefined}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!description) return;
            onToggleInfo?.();
          }}
        >
          i
        </button>

        {rowButton}
      </div>

      {description && isExpanded && (
        <div
          className={styles.description}
          role="region"
          aria-label={`${product.name} description`}
        >
          {description}
        </div>
      )}
    </div>
  );
}
