import styles from "./Press.module.css";
import PressItem, { type PressItemData } from "./PressItem";

type Props = {
  title: string;
  items: ReadonlyArray<PressItemData>;
};

export default function PressList({ title, items }: Props) {
  return (
    <div className={styles.pressCard}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.list}>
        {items.map((item) => (
          <PressItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
