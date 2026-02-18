import { useMemo, useState } from "react";
import { useCheckoutProducts } from "../../hooks/useCheckoutProducts";
import styles from "./index.module.css";
import type { CheckoutProduct, StripePrice } from "../../hooks/types/stripe";
import BillingToggle from "./BillingToggle";
import PricingList from "./PricingList";
import "@fontsource/biorhyme/400.css";
import "@fontsource/biorhyme/700.css";
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/400.css";

export type BillingView = "year" | "month";

function pickPriceForInterval(
  product: CheckoutProduct,
  interval: BillingView,
): StripePrice | null {
  const recurring = product.prices.filter(
    (p) => p.type === "recurring" && p.recurring?.interval,
  );

  const target = recurring.find((p) => p.recurring?.interval === interval);
  if (target) return target;

  if (recurring.length > 0) {
    return [...recurring].sort(
      (a, b) => (a.unit_amount ?? Infinity) - (b.unit_amount ?? Infinity),
    )[0]!;
  }

  return null;
}

export default function PhonePricing() {
  const { data: products = [], isLoading, isError } = useCheckoutProducts();
  const [billing, setBilling] = useState<BillingView>("year");

  const rows = useMemo(() => {
    return products
      .map((product) => {
        const price = pickPriceForInterval(product, billing);
        return { product, price };
      })
      .filter((r) => r.price !== null) as Array<{
      product: CheckoutProduct;
      price: StripePrice;
    }>;
  }, [products, billing]);

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        <div className={styles.headerRow}>
          <BillingToggle billing={billing} onChange={setBilling} />
        </div>
        <PricingList
          rows={rows}
          billing={billing}
          isLoading={isLoading}
          isError={isError}
        />
        <div className={styles.footer}>
          <div className={styles.faqButtonContainer}>
            <a
              className={styles.faqButton}
              href="/faqs"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
          <div>
            dumb means every1. if u r under 25 or need financial aid, email
            milk@offline.community
          </div>
        </div>
      </div>
    </div>
  );
}
