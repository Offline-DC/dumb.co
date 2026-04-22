import styles from "./index.module.css";
import funPercent from "../the_fun_percent.webp";
import dumbCoLogo from "../dumb_co_logo.webp";
import teamPolaroid from "../polaroid.webp";
import madeInDc from "../made_in_dc.png";

// Signatures — new vector PNGs (higher-res replacements for the originals).
import sigLydia from "../signatures/lydia sig vector 1.png";
import sigTheo from "../signatures/theo sig vector 1.png";
import sigJack from "../signatures/jack sig vector 1.png";
import sigMilk from "../signatures/milk sig vector 1.png";
import sigMarco from "../signatures/marco sig vector 1.png";
import sigDanny from "../signatures/danny sig vector 1.png";
import sigAarron from "../signatures/aarron sig vector 1.png";
import sigAfreka from "../signatures/afreka sig vector 1.png";
import sigJosh from "../signatures/josh sig vector 1.png";

const signatures: { src: string; alt: string }[] = [
  { src: sigLydia, alt: "Lydia" },
  { src: sigTheo, alt: "Theo" },
  { src: sigJack, alt: "Jack" },
  { src: sigMilk, alt: "Milk" },
  { src: sigMarco, alt: "Marco" },
  { src: sigDanny, alt: "Danny" },
  { src: sigAarron, alt: "Aaron" },
  { src: sigAfreka, alt: "Afreka" },
  { src: sigJosh, alt: "Josh" },
];

type Props = {
  /**
   * The current rendered width of the modal body. Mirrors the prop on
   * DumbphoneOneModal's FlyerContainer — use this if any sub-elements need
   * to scale / position themselves relative to the modal width.
   */
  modalWidth: number;
  /**
   * On mobile, WindowModal passes its body height so the content can stretch
   * to fill the gray area instead of leaving dead space beneath short content.
   * Undefined on desktop (modal uses autoHeight).
   */
  containerHeight?: number;
  /** Closes the modal (wired through from WindowModal.onClose). */
  onClose: () => void;
};

/**
 * Scaffold content for the home modal. Intentionally sparse — fill in below.
 *
 * Sizing / scroll contract (matches FlyerContainer):
 *   - `modalWidth`     — width of the body in px, use for scaling children
 *   - `containerHeight` — defined on mobile only; use as a min-height so the
 *                         frame fills the viewport-height modal body
 *
 * On desktop the parent modal has `autoHeight`, so the body collapses to the
 * natural height of this component (up to maxHeight, then scrolls).
 */
export default function HomeModalContent({
  // Reserved for future use — accepted so the component signature matches
  // FlyerContainer's. Remove the underscore prefix when actually consumed.
  modalWidth: _modalWidth,
  containerHeight,
  onClose,
}: Props) {
  return (
    <div
      className={styles.root}
      style={{ height: "auto", alignItems: "flex-start" }}
    >
      <div
        className={styles.frame}
        style={{
          display: "block",
          width: "100%",
          // On mobile, stretch to fill the body so there's no gray gap.
          // On desktop, let content dictate height.
          minHeight: containerHeight ?? undefined,
          overflow: "hidden",
        }}
      >
        {/* Polaroid hero — white frame w/ rounded corners, image inside,
            "make your move." overlay text, dumb.co logo beneath. */}
        <div className={styles.polaroid}>
          <div className={styles.imageWrap}>
            <img
              src={funPercent}
              alt="friends jumping into a lake"
              className={styles.image}
              draggable={false}
            />
            <div className={styles.overlayText}>make your move.</div>
          </div>
          <img
            src={dumbCoLogo}
            alt="dumb.co"
            className={styles.logo}
            draggable={false}
          />
        </div>

        {/* "hello from the flip side." — pink section with two columns on
            desktop; polaroid stacks above the text on mobile (column-reverse).
            Signatures at the bottom of the reference are intentionally omitted
            for now. */}
        <section className={styles.helloFlipSide}>
          <div className={styles.flipTextCol}>
            <h2 className={styles.flipTitle}>
              hello from
              <br />
              the flip side.
            </h2>
            <p className={styles.flipBody}>
              dumb.co was born in Washington, DC in 2025 after a small group of
              neighbors came together to form Month Offline: a 30-day challenge
              to ditch our smartphones. we learned a lot along the way, and
              decided to design a device that&apos;s just dumb enough. the
              dumbphone 2 is a companion device that syncs with ur smartphone
              and includes maps, music, uber, and all ur messages (but only if u
              want). our little team is stoked that ur part of the growing
              movement of dumb ppl choosing dumb down.
            </p>
            <p style={{ marginBottom: "1rem" }} className={styles.flipBody}>
              quack,
            </p>
          </div>
          <div className={styles.flipPolaroidCol}>
            <img
              src={teamPolaroid}
              alt="dumb.co team polaroid, made in D.C."
              className={styles.flipPolaroidImage}
              draggable={false}
            />
            <img
              src={madeInDc}
              alt="made in D.C."
              className={styles.madeInDc}
              draggable={false}
            />
          </div>
        </section>

        {/* Signatures strip — scattered team signatures beneath the pink
            section. Rendered outside .helloFlipSide so they sit on the
            modal's neutral body background like the reference. */}
        <div className={styles.signatures}>
          {signatures.map((s) => (
            <img
              key={s.alt}
              src={s.src}
              alt={s.alt}
              className={styles.signature}
              draggable={false}
            />
          ))}
        </div>

        {/* Basic 90s-style close button — classic Win95 raised bevel.
            Closes the modal so the user can explore the rest of the site. */}
        <div className={styles.seeMoreContainer}>
          <button
            type="button"
            className={styles.seeMoreButton}
            onClick={onClose}
          >
            see more
          </button>
        </div>
      </div>
    </div>
  );
}
