import styles from "./Press.module.css";

export type PressVariant = "light" | "dark";

export type PressItemData = {
  id: string;
  title: string;
  source?: string;
  image: string;
  href: string;
  variant?: PressVariant;
};

type Props = {
  item: PressItemData;
};

export default function PressItem({ item }: Props) {
  const { title, source, image, href, variant = "light" } = item;

  const rowClassName = [
    styles.itemRow,
    variant === "dark" ? styles.rowDark : styles.rowLight,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={rowClassName} href={href} target="_blank" rel="noreferrer">
      <img className={styles.thumb} src={image} alt={title} />

      <div className={styles.itemContent}>
        <div className={styles.itemText}>
          {title}
          {source ? <span className={styles.source}> — {source}</span> : null}
        </div>
      </div>
    </a>
  );
}
