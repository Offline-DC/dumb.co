import { useState } from "react";
import flyer from "./template.jpeg";
import styles from "./index.module.css";
import PhonePricing from "./PhonePricing";

export default function FlyerContainer() {
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <div className={styles.root}>
      <div
        className={styles.frame}
        style={
          ratio
            ? ({ aspectRatio: String(ratio) } as React.CSSProperties)
            : undefined
        }
      >
        <img
          src={flyer}
          alt="Dumb phone flyer"
          draggable={false}
          className={styles.image}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
        />
        <div className={styles.overlayBox}>
          <PhonePricing />
        </div>
      </div>
    </div>
  );
}
