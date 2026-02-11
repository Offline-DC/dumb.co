import flyer from "./productpageextendoooooo.jpg";
import styles from "./index.module.css";
import PhonePricing from "./PhonePricing";

type Props = {
  modalWidth: number;
};

export default function FlyerContainer({ modalWidth }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.frame}>
        <img
          src={flyer}
          alt="Dumb phone flyer"
          draggable={false}
          className={styles.image}
        />
        <div
          style={{ top: `${modalWidth * 0.7}px` }}
          className={styles.overlayBox}
        >
          <PhonePricing />
        </div>
      </div>
    </div>
  );
}
