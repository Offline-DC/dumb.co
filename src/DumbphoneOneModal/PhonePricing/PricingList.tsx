import { useState } from "react";
import type { CheckoutProduct, StripePrice } from "../../hooks/types/stripe";
import type { BillingView } from "../PhonePricing";
import styles from "./index.module.css";
import PricingOptionRow from "./PricingOptionRow";

type Row = { product: CheckoutProduct; price: StripePrice };

type Props = {
  rows: Row[];
  billing: BillingView;
  isLoading: boolean;
  isError: boolean;
  onSelectPrice: (priceId: string) => void;
};

export default function PricingList({
  rows,
  billing,
  isLoading,
  isError,
  onSelectPrice,
}: Props) {
  const [openProductId, setOpenProductId] = useState<string | null>(
    "prod_Tq5pnPvibIdvNg",
  );

  if (isLoading) return <div className={styles.muted}>Loading…</div>;
  if (isError)
    return <div className={styles.muted}>Error loading pricing.</div>;
  if (rows.length === 0)
    return <div className={styles.muted}>No options available.</div>;

  return (
    <div className={styles.listMobile}>
      {rows.map(({ product, price }) => (
        <PricingOptionRow
          key={`${product.id}-${billing}-${price.id}`}
          product={product}
          price={price}
          billing={billing}
          onClick={() => onSelectPrice(price.id)}
          isExpanded={openProductId === product.id}
          onToggleInfo={() =>
            setOpenProductId((prev) =>
              prev === product.id ? prev : product.id,
            )
          }
        />
      ))}
    </div>
  );
}
