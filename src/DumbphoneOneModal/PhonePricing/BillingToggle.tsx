import type { BillingView } from "../PhonePricing";
import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";

type Props = {
  billing: BillingView;
  onChange: (next: BillingView) => void;
};

export default function BillingToggle({ billing, onChange }: Props) {
  const navigate = useNavigate();
  return (
    <div className={styles.toggle}>
      <div></div>
      <div>
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
      <button
        type="button"
        onClick={() => navigate("/faqs")}
        style={{ all: "unset", cursor: "pointer" }}
      >
        FAQ
      </button>{" "}
    </div>
  );
}
