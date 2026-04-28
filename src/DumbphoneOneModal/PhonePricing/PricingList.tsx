import type { StripePrice } from "../../hooks/types/stripe";
import styles from "./index.module.css";
import PricingOptionRow from "./PricingOptionRow";

type Props = {
  prices: StripePrice[];
  isLoading: boolean;
  isError: boolean;
};

export default function PricingList({ prices, isLoading, isError }: Props) {
  if (isLoading) return <div className={styles.muted}>Loading…</div>;
  if (isError)
    return <div className={styles.muted}>Error loading pricing.</div>;
  if (prices.length === 0)
    return <div className={styles.muted}>No options available.</div>;

  return (
    <div className={styles.listMobile}>
      {prices.map((price) => (
        <PricingOptionRow key={price.id} price={price} />
      ))}
    </div>
  );
}
