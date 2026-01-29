import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import introRaw from "./intro.md?raw";
import techRaw from "./tech.md?raw";
import opsRaw from "./ops.md?raw";
import marketingRaw from "./marketing.md?raw";
import airRaw from "./artist.md?raw";
import conclusionRaw from "./conclusion.md?raw";
import styles from "./internship.module.css";

const JOBS = [
  { value: "tech", label: "🛠 Tech Intern", md: techRaw },
  { value: "ops", label: "📦 Business & Operations Intern", md: opsRaw },
  { value: "marketing", label: "📣 Marketing Intern", md: marketingRaw },
  { value: "air", label: "🎨 Artist-in-Residence", md: airRaw },
];

export default function Internship() {
  const [selected, setSelected] = useState("");

  const selectedMarkdown = useMemo(() => {
    return JOBS.find((j) => j.value === selected)?.md ?? "";
  }, [selected]);

  return (
    <div className={styles.page}>
      <div className={styles.markdown}>
        <ReactMarkdown>{introRaw}</ReactMarkdown>
      </div>

      <div className={styles.vintageSelectWrap}>
        <div className={styles.selectRow}>
          <select
            id="job-select"
            className={styles.vintageSelect}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">— choose a role —</option>
            {JOBS.map((job) => (
              <option key={job.value} value={job.value}>
                {job.label}
              </option>
            ))}
          </select>
        </div>

        {selectedMarkdown ? (
          <div className={`${styles.dropdownBody} ${styles.markdown}`}>
            <ReactMarkdown>{selectedMarkdown}</ReactMarkdown>
          </div>
        ) : (
          <div className={styles.emptyState}>
            Pick a role to see the description.
          </div>
        )}
      </div>

      <div className={styles.markdown}>
        <ReactMarkdown>{conclusionRaw}</ReactMarkdown>
      </div>
    </div>
  );
}
