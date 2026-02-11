import type { BillingView } from "../PhonePricing";
import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";

type Props = {
  billing: BillingView;
  onChange: (next: BillingView) => void;
};

export default function BillingToggle({ billing, onChange }: Props) {
  return (
    <div className={styles.toggle}>
      <div className={styles.faqButtonContainer}>
        <a
          className={styles.faqButton}
          href="/faqs"
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
      <div>
        <button
          type="button"
          className={`${styles.toggleBtn} ${
            billing === "month" ? styles.active : ""
          }`}
          onClick={() => onChange("month")}
        >
          monthly
        </button>

        <button
          type="button"
          className={`${styles.toggleBtn} ${
            billing === "year" ? styles.active : ""
          }`}
          onClick={() => onChange("year")}
        >
          yearly
        </button>
      </div>
    </div>
  );
}
