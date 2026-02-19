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

const priceIDPaymentLinkMap: Record<string, string> = {
  'price_1SsPe46YQdMFHNu4pI8p7hrm': 'https://buy.stripe.com/aFa6oA8tO7b4aTNeAU8N200',
  'price_1Sx7yp6YQdMFHNu4KkhnTmGW':'https://buy.stripe.com/8x29AM11mcvo6Dx50k8N202',
  'price_1Sx8YC6YQdMFHNu4vCoJFwcQ':'https://buy.stripe.com/00w14g11mdzs0f9gJ28N203',//student monthly,
  'price_1Sx8Z66YQdMFHNu4RFIEORO8':'https://buy.stripe.com/28E5kwfWg7b46DxgJ28N207',//student yearly,
  'price_1Sx8Um6YQdMFHNu4QjPoEQ2m':'https://buy.stripe.com/fZubIUcK41QK3rlcsM8N205',//sponsor monthly,
  'price_1Sx8VY6YQdMFHNu4Y8MgL8Pz':'https://buy.stripe.com/cNi28kfWg3YSd1VcsM8N208',//sponsor yearly,
  'price_1Sx8X36YQdMFHNu42TCLkgIX':'https://buy.stripe.com/dRm7sEcK48f8bXReAU8N204',//patron monthly,
  'price_1Sx8XQ6YQdMFHNu4NqhLyGS0':'https://buy.stripe.com/6oU28kdO8brk3rldwQ8N209',//patron yearly,
  'price_1Sx8Q76YQdMFHNu4vg2hggTq':'https://buy.stripe.com/14A00c25q670fa30K48N206',//family monthly,
  'price_1Sx8Si6YQdMFHNu41TPhuYDk':'https://buy.stripe.com/00weV625q9jce5Z3Wg8N20a'//family yearly,
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

  const checkoutUrl = priceIDPaymentLinkMap[price.id];

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
