import styles from "./Press.module.css";
import PressItem, { type PressItemData } from "./PressItem";

type Props = {
  title: string;
  items: ReadonlyArray<PressItemData>;
  row: number;
};

const PAGE_SIZE = 3;

export function getSnappedItems<T>(
  items: ReadonlyArray<T>,
  row: number,
  pageSize: number = PAGE_SIZE
) {
  const n = items.length;
  if (n === 0) return { visibleItems: [] as T[], highlightedIndex: 0 };

  const r = Math.min(row, n - 1);
  const isLastSlot = r % pageSize === pageSize - 1;
  let windowStart = Math.floor(r / pageSize) * pageSize;

  if (isLastSlot) windowStart = r;

  const visibleItems = items.slice(windowStart, windowStart + pageSize);

  return {
    visibleItems,
    highlightedIndex: r - windowStart,
  };
}

export default function PressList({ title, items, row }: Props) {
  const { visibleItems, highlightedIndex } = getSnappedItems(items, row, 3);

  return (
    <div className={styles.pressCard}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.subtitle}>afreka@offline.community</div>

      <div className={styles.list}>
        {visibleItems.map((item, i) => (
          <PressItem
            key={item.id}
            item={item}
            isHighlighted={i === highlightedIndex}
          />
        ))}
      </div>
    </div>
  );
}
