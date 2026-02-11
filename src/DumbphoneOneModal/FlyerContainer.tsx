import flyer from "./productpageextendoooooo.jpg";
import styles from "./index.module.css";
import PhonePricing from "./PhonePricing";

type Props = {
  isMobile: boolean;
};

export default function FlyerContainer({ isMobile }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.frame}>
        <img
          src={flyer}
          alt="Dumb phone flyer"
          draggable={false}
          className={styles.image}
        />
        <div className={styles.overlayBox}>
          <PhonePricing />
        </div>
      </div>
    </div>
  );
}
