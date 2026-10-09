import { useCheckoutProducts } from "../../hooks/useCheckoutProducts";
import styles from "./index.module.css";
import PricingList from "./PricingList";
import { SHOP } from "../../content";
import "@fontsource/biorhyme/400.css";
import "@fontsource/biorhyme/700.css";
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/400.css";

export default function PhonePricing() {
  const { data: prices = [], isLoading, isError } = useCheckoutProducts();

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        <PricingList prices={prices} isLoading={isLoading} isError={isError} />
        <div className={styles.footer}>
          <a
            className={styles.faqLink}
            href="/faq"
            target="_blank"
            rel="noopener noreferrer"
          >
            {SHOP.questionsLink}
          </a>
          <div style={{ paddingRight: ".5rem" }}>
            {SHOP.financialAid}
          </div>
        </div>
      </div>
    </div>
  );
}
