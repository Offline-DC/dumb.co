import type { Dispatch, SetStateAction } from "react";
import styles from "./Press.module.css";
import PressItem, { type PressItemData } from "./PressItem";

type Props = {
  title: string;
  items: ReadonlyArray<PressItemData>;
  row: number;
  setRow: Dispatch<SetStateAction<number>>;
};

export default function PressList({ title, items, row, setRow }: Props) {
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
