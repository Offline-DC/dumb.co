import styles from "./Press.module.css";

export type PressVariant = "light" | "dark";

export type PressItemData = {
  id: string;
  title: string;
  source?: string;
  image: string;
  href: string;
};

type Props = {
  item: PressItemData;
  isHighlighted: boolean;
};

export default function PressItem({ item, isHighlighted }: Props) {
  const { title, source, image } = item;

  const rowClassName = [
    styles.itemRow,
    isHighlighted ? styles.rowDark : styles.rowLight,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClassName}>
      <img className={styles.thumb} src={image} alt={title} />

      <div className={styles.itemContent}>
        <div className={styles.itemText}>{title}</div>
        {source ? <div className={styles.source}> • {source}</div> : null}
      </div>
    </div>
  );
}
