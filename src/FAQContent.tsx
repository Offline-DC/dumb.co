import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./FAQs.css";

/**
 * Update the URL hash without triggering a navigation/scroll-jump. We use
 * replaceState so the back button doesn't fill up with every open/close.
 * Passing an empty string strips the `#` entirely instead of leaving a bare
 * `#` dangling in the address bar.
 */
const setUrlHash = (slug: string | null) => {
  const { pathname, search } = window.location;
  const next = slug ? `${pathname}${search}#${slug}` : `${pathname}${search}`;
  window.history.replaceState(null, "", next);
};

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

const parseMarkdownLinks = (text: string): ReactNode[] => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer">
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

/**
 * Turn a question string into a URL-safe slug used as the FAQ's anchor.
 *   "What is dumbphone 2?" → "what-is-dumbphone-2"
 * Stable across reloads as long as the question text doesn't change in
 * the source CSV.
 */
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/**
 * Make all slugs unique by appending -2, -3, ... to collisions, so two
 * questions that slugify to the same string still get distinct anchors.
 */
const buildUniqueSlugs = (items: FaqItem[]): string[] => {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = slugify(item.question) || "question";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
};

type Props = {
  /** When true, drops the .faq-card chrome — the surrounding modal supplies its own frame. */
  compact?: boolean;
};

export default function FAQContent({ compact = false }: Props) {
  // Accordion: at most one question open at a time. `null` = all collapsed.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Track whether we've already auto-opened/scrolled to the hash item, so
  // we don't keep yanking the page around on re-renders.
  const didScrollToHashRef = useRef(false);

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
          .map((row) => {
            const question = row[0]?.trim() ?? "";
            const answers = [
              row[1]?.trim(),
              row[2]?.trim(),
              row[3]?.trim(),
            ].filter((answer): answer is string => Boolean(answer));

            return { question, answers };
          })
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

  // Memoize slugs so they're stable across renders and match between the
  // hash-open effect and the rendered ids.
  const slugs = useMemo(() => buildUniqueSlugs(items), [items]);

  // After items load (and on hash changes), open + scroll to the matching
  // question if there's a `#slug` in the URL.
  useEffect(() => {
    if (items.length === 0) return;

    const openFromHash = () => {
      const rawHash = window.location.hash.replace(/^#/, "");
      if (!rawHash) return;
      const target = decodeURIComponent(rawHash).toLowerCase();
      const index = slugs.findIndex((slug) => slug === target);
      if (index === -1) return;

      setOpenIndex(index);

      // Defer scroll until after the panel paints open.
      window.requestAnimationFrame(() => {
        const el = document.getElementById(`faq-item-${slugs[index]}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    };

    // First load: jump to hash once.
    if (!didScrollToHashRef.current) {
      didScrollToHashRef.current = true;
      openFromHash();
    }

    // Also respond to in-page hash changes (e.g. user pastes a #slug URL
    // into the address bar without a full reload).
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [items, slugs]);

  // Toggle a question. Opening one closes whatever was open before
  // (accordion behavior) and pushes its slug into the URL hash so the
  // address bar itself becomes the shareable link.
  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => {
      if (prev === index) {
        setUrlHash(null);
        return null;
      }
      setUrlHash(slugs[index] ?? null);
      return index;
    });
  };

  const cardClass = compact ? "faq-card faq-card--compact" : "faq-card";

  return (
    <div className={cardClass}>
      <div className="faq-header">
        <h1>frequently asked questions.</h1>
      </div>
      <div className="faq-list" role="list">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const slug = slugs[index];
          const panelId = `faq-panel-${slug}`;
          const buttonId = `faq-button-${slug}`;
          const itemId = `faq-item-${slug}`;

          return (
            <div
              key={slug}
              id={itemId}
              className="faq-item"
              role="listitem"
            >
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
                    <div key={answerIndex}>
                      <p>{parseMarkdownLinks(answer)}</p>
                      {answerIndex < item.answers.length - 1 && (
                        <div className="faq-answer-separator" />
                      )}
                    </div>
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
      <div className="faq-contact">
        <p>
          questions? contact{" "}
          <a href="mailto:support@dumb.co">support@dumb.co</a>{" "}
          or call us: <a href="tel:404-716-3605">404-716-3605</a>
        </p>
        <p>24/7 human support</p>
      </div>
    </div>
  );
}
