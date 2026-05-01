import flyer from "./productpageextendoooooo.jpg";
import styles from "./index.module.css";
import PhonePricing from "./PhonePricing";
import { useEffect, useRef, useState } from "react";

type Props = {
  modalWidth: number;
  /** When provided the frame will be at least this tall, extending the image to fill gray space */
  containerHeight?: number;
};

export default function FlyerContainer({ modalWidth, containerHeight }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [overlayHeight, setOverlayHeight] = useState(0);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const measure = () => {
      setOverlayHeight(overlay.offsetHeight);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(overlay);
    return () => ro.disconnect();
  }, []);

  // Frame must be tall enough to show the overlay, but also fill the container so there's no gray
  const overlayTop = modalWidth * 0.7;
  const croppedHeight = overlayTop + overlayHeight + 24;
  const frameHeight = Math.max(croppedHeight, containerHeight ?? 0);

  return (
    <div className={styles.root} style={{ height: "auto", alignItems: "flex-start" }}>
      <div
        className={styles.frame}
        style={{
          display: "block",
          width: "100%",
          height: frameHeight > 0 ? frameHeight : undefined,
          overflow: "hidden",
        }}
      >
        <img
          src={flyer}
          alt="Dumb phone flyer"
          draggable={false}
          className={styles.image}
          style={{ width: "100%", height: "auto", maxHeight: "none" }}
        />
        <div
          ref={overlayRef}
          style={{ top: `${overlayTop}px` }}
          className={styles.overlayBox}
        >
          <PhonePricing />
          <div className={styles.supportLine}>
            human support 24/7 support@dumb.co or 404-716-3605
          </div>
        </div>
      </div>
    </div>
  );
}
