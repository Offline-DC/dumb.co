import { useCheckoutProducts } from "../../hooks/useCheckoutProducts";
import styles from "./index.module.css";
import PricingList from "./PricingList";
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
          <div className={styles.faqButtonContainer}>
            <a
              className={styles.faqButton}
              href="/faqs"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
          <div style={{ paddingRight: ".5rem" }}>
            buy 2+ & save $10. for financial aid, email milk@dumb.co
          </div>
        </div>
      </div>
    </div>
  );
}
