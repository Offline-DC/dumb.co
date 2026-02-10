import { apiFetch } from "../../utils/fetchHeper";
import styles from "./index.module.css";
import { useQuery } from "@tanstack/react-query";

export default function PhonePricing() {
  const { data } = useQuery({
    queryKey: ["something"],
    queryFn: () => apiFetch("/api/something"),
  });

  console.log(data);

  return <div className={styles.container}>Hiii</div>;
}
