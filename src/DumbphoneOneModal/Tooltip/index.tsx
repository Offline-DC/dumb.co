import { useState, type ReactNode } from "react";
import styles from "./tooltip.module.css";

type Props = {
  content: string;
  children: ReactNode;
};

export default function Tooltip({ content, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
      }}
    >
      {children}
      {open && <span className={styles.tooltip}>{content}</span>}
    </span>
  );
}
