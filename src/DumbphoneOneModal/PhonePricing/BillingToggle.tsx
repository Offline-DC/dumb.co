import type { BillingView } from "../PhonePricing";
import styles from "./index.module.css";

type Props = {
  billing: BillingView;
  onChange: (next: BillingView) => void;
};

export default function BillingToggle({ billing, onChange }: Props) {
  return (
    <div className={styles.toggle}>
      <button
        type="button"
        className={`${styles.toggleBtn} ${billing === "month" ? styles.active : ""}`}
        onClick={() => onChange("month")}
      >
        monthly
      </button>
      <button
        type="button"
        className={`${styles.toggleBtn} ${billing === "year" ? styles.active : ""}`}
        onClick={() => onChange("year")}
      >
        yearly
      </button>
    </div>
  );
}
