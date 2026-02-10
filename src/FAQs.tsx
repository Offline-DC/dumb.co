import { useEffect, useState } from "react";
import "./FAQs.css";

type FaqItem = {
  question: string;
  answers: string[];
};

const FAQ_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWuMc1UItkIUZusBTqpN10gkWT0q8RXvxPb6muvfWAUdKCODYkaT5_PUmZMIkbqPBl-K_A2asfTJuB/pub?output=csv";

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
};

function FAQs() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadFaqs = async () => {
      try {
        setLoadError(null);
        const response = await fetch(FAQ_CSV_URL, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load FAQs (${response.status})`);
        }

        const csvText = await response.text();
        const rows = parseCsv(csvText);

        const [firstRow, ...restRows] = rows;
        const isHeaderRow =
          firstRow?.some((value) => value.trim().toLowerCase() === "question") ||
          firstRow?.some((value) => value.trim().toLowerCase() === "answer");
        const dataRows = isHeaderRow ? restRows : rows;

        const nextItems: FaqItem[] = dataRows
          .map((row) => ({
            question: row[0]?.trim() ?? "",
            answers: row[1] ? [row[1].trim()] : [],
          }))
          .filter((item) => item.question && item.answers.length > 0);

        if (isActive) {
          setItems(nextItems);
        }
      } catch (error) {
        if (isActive) {
          const message = error instanceof Error ? error.message : "Failed to load FAQs";
          setLoadError(message);
          setItems([]);
        }
      }
    };

    loadFaqs();

    return () => {
      isActive = false;
    };
  }, []);

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    );
  }; 

  return (
    <div className="faq-page">
      <div className="faq-card">
        <div className="faq-header">
          <h1>FREQUENTLY ASKED QUESTIONS</h1>
        </div>
        <div className="faq-list" role="list">
          {items.map((item, index) => {
            const isOpen = openIndexes.includes(index);
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={item.question} className="faq-item" role="listitem">
                <button
                  id={buttonId}
                  className="faq-question"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  type="button"
                  onClick={() => toggleIndex(index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-indicator">{isOpen ? "-" : "+"}</span>
                </button>
                <div
                  id={panelId}
                  className={`faq-panel ${isOpen ? "open" : ""}`}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  {item.answers.length > 0 ? (
                    item.answers.map((answer, answerIndex) => (
                      <p key={answerIndex}>{answer}</p>
                    ))
                  ) : (
                    <p className="faq-empty" aria-hidden="true"></p>
                  )}
                </div>
              </div>
            );
          })}
          {loadError ? (
            <p className="faq-empty" role="status">
              {loadError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default FAQs;
