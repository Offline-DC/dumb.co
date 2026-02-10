import styles from "./index.module.css";

export default function PricingHeader({ title }: { title: string }) {
  return <h1 className={styles.title}>{title}</h1>;
}
