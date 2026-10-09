import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { INTERNSHIP } from "../content";
import styles from "./internship.module.css";

// edited in Pages CMS ("Internship"), stored in src/content/internship.json
const JOBS = INTERNSHIP.roles.map((role, i) => ({
  value: String(i),
  label: role.label as string,
  md: role.description as string,
}));

export default function Internship() {
  const [selected, setSelected] = useState("");

  const selectedMarkdown = useMemo(() => {
    return JOBS.find((j) => j.value === selected)?.md ?? "";
  }, [selected]);

  return (
    <div className={styles.page}>
      <div className={styles.markdown}>
        <ReactMarkdown>{INTERNSHIP.intro}</ReactMarkdown>
      </div>

      <div className={styles.vintageSelectWrap}>
        <div className={styles.selectRow}>
          <select
            id="job-select"
            className={styles.vintageSelect}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">{INTERNSHIP.chooseLabel}</option>
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
            {INTERNSHIP.emptyState}
          </div>
        )}
      </div>

      <div className={styles.markdown}>
        <ReactMarkdown>{INTERNSHIP.conclusion}</ReactMarkdown>
      </div>
    </div>
  );
}
