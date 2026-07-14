import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./FAQs.css";
import VideoList from "./FAQVideos/VideoList";
import tvIcon from "./FAQVideos/tv-icon-black.png";

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

type FaqCategory = "general" | "tech";

// The "videos" tab (the SHOW ME HOW button) lives alongside the FAQ
// categories but renders the in-page video player instead of questions.
type FaqTab = FaqCategory | "videos";

/** Canonical path for the videos view. Pasting this URL opens that tab. */
const VIDEOS_PATH = "/faq/videos";
const FAQ_PATH = "/faq";

/** Does the current URL point at the videos view? */
const isVideosPath = () =>
  typeof window !== "undefined" &&
  window.location.pathname.replace(/\/+$/, "").endsWith("/faq/videos");

/**
 * Point the address bar at the right tab without a react-router navigation
 * (same replaceState trick as setUrlHash, so the Phone shell's path-sync
 * effect doesn't fight us). Switching to videos drops any open-question hash;
 * switching back to a category preserves the rest of the URL.
 */
const setUrlForTab = (tab: FaqTab) => {
  const { search } = window.location;
  const next = tab === "videos" ? `${VIDEOS_PATH}${search}` : `${FAQ_PATH}${search}`;
  window.history.replaceState(null, "", next);
};

type FaqItem = {
  question: string;
  answers: string[];
  category: FaqCategory;
};

const TABS: { id: FaqCategory; label: string }[] = [
  { id: "general", label: "General" },
  { id: "tech", label: "Tech Help" },
];

/**
 * Maps a free-text Category cell to one of our tabs. Anything that mentions
 * "tech" (e.g. "tech help", "Tech Help", "technical") lands in Tech Help;
 * everything else — including a blank cell — defaults to General. This keeps
 * the sheet forgiving: existing rows with no Category stay in General.
 */
const categoryFromCell = (value: string | undefined): FaqCategory =>
  value && value.toLowerCase().includes("tech") ? "tech" : "general";

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

/**
 * Split an answer into individual sentences so each one can be rendered on
 * its own line. Splits after ./!/? followed by whitespace, but only when
 * the next character starts a new sentence (not a decimal or abbreviation
 * like "e.g.") — good enough heuristic for the FAQ copy we have.
 */
const splitIntoSentences = (text: string): string[] =>
  text
    .split(/\n/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const parseMarkdownLinks = (text: string): ReactNode[] => {
  // Match **bold** and [text](url) in one pass
  const tokenRegex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      // **bold**
      parts.push(<strong key={match.index}>{match[1]}</strong>);
    } else {
      // [text](url)
      parts.push(
        <a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer">
          {match[2]}
        </a>
      );
    }
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
  /** Called once when FAQ items finish loading — used to signal the parent window to expand. */
  onReady?: () => void;
};

export default function FAQContent({ compact = false, onReady }: Props) {
  // Accordion: at most one question open at a time. `null` = all collapsed.
  // Keyed by slug (not index) so the open state survives tab filtering.
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Seed from the URL so a deep link to /faq/videos opens the videos tab on
  // first paint (mirrors how the hash deep-link seeds an open question).
  const [activeTab, setActiveTab] = useState<FaqTab>(() =>
    isVideosPath() ? "videos" : "general",
  );

  // Switch tabs and keep the address bar in sync, so the videos view is a
  // shareable /faq/videos link and the category tabs fall back to /faq.
  const selectTab = (tab: FaqTab) => {
    setActiveTab(tab);
    setUrlForTab(tab);
  };

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

        // Locate the category column by header name so it can live anywhere in
        // the sheet. We accept either "Type" or "Category" as the header. Falls
        // back to the column after "Answer 3" (index 4) when there's no header,
        // which is where we append it by convention.
        const headerCategoryIndex = isHeaderRow
          ? firstRow.findIndex((value) => {
              const name = value.trim().toLowerCase();
              return name === "type" || name === "category";
            })
          : -1;
        const categoryIndex = headerCategoryIndex >= 0 ? headerCategoryIndex : 4;

        const nextItems: FaqItem[] = dataRows
          .map((row) => {
            const question = row[0]?.trim() ?? "";
            const answers = [
              row[1]?.trim(),
              row[2]?.trim(),
              row[3]?.trim(),
            ].filter((answer): answer is string => Boolean(answer));
            const category = categoryFromCell(row[categoryIndex]?.trim());

            return { question, answers, category };
          })
          .filter((item) => item.question && item.answers.length > 0);

        if (isActive) {
          setItems(nextItems);
          onReady?.();
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
  // hash-open effect and the rendered ids. Computed over the full item list
  // so a slug is the same regardless of which tab is active.
  const slugs = useMemo(() => buildUniqueSlugs(items), [items]);

  // Look up an item's slug and category by its question text.
  const metaByQuestion = useMemo(() => {
    const map = new Map<string, { slug: string; category: FaqCategory }>();
    items.forEach((item, index) => {
      map.set(item.question, { slug: slugs[index], category: item.category });
    });
    return map;
  }, [items, slugs]);

  // After items load (and on hash changes), open + scroll to the matching
  // question if there's a `#slug` in the URL. Also switches to whichever tab
  // the linked question lives in, so deep links to Tech Help work.
  useEffect(() => {
    if (items.length === 0) return;

    const openFromHash = () => {
      const rawHash = window.location.hash.replace(/^#/, "");
      if (!rawHash) return;
      const target = decodeURIComponent(rawHash).toLowerCase();
      const index = slugs.findIndex((slug) => slug === target);
      if (index === -1) return;

      setActiveTab(items[index].category);
      setOpenSlug(slugs[index]);

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
  const toggleSlug = (slug: string | null) => {
    setOpenSlug((prev) => {
      if (prev === slug) {
        setUrlHash(null);
        return null;
      }
      setUrlHash(slug);
      return slug;
    });
  };

  const cardClass = compact ? "faq-card faq-card--compact" : "faq-card";
  const visibleItems = items.filter((item) => item.category === activeTab);

  return (
    <div className={cardClass}>
      <div className="faq-header">
        <h1>frequently asked questions.</h1>
        <div className="faq-tabs" role="tablist" aria-label="FAQ categories">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`faq-tab-${tab.id}`}
              className={`faq-tab ${activeTab === tab.id ? "active" : ""}`}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              aria-controls="faq-list"
              onClick={() => selectTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button
            id="faq-tab-videos"
            className={`faq-tab faq-tab--videos ${
              activeTab === "videos" ? "active" : ""
            }`}
            role="tab"
            type="button"
            aria-selected={activeTab === "videos"}
            aria-controls="faq-list"
            onClick={() => selectTab("videos")}
          >
            <span
              className="faq-tab-tv"
              style={{ "--tv-mask": `url(${tvIcon})` } as CSSProperties}
              aria-hidden="true"
            />
            Phone Demo
          </button>
        </div>
      </div>
      <div
        className="faq-list"
        id="faq-list"
        role="tabpanel"
        aria-labelledby={`faq-tab-${activeTab}`}
      >
        {activeTab === "videos" ? (
          <VideoList />
        ) : (
          <>
        {visibleItems.map((item) => {
          const meta = metaByQuestion.get(item.question);
          const slug = meta?.slug ?? slugify(item.question);
          const isOpen = openSlug === slug;
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
                onClick={() => toggleSlug(slug)}
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
                      <p>
                        {splitIntoSentences(answer).map((sentence, sentenceIndex) => (
                          <span className="faq-sentence" key={sentenceIndex}>
                            {parseMarkdownLinks(sentence)}
                          </span>
                        ))}
                      </p>
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
        {!loadError && visibleItems.length === 0 ? (
          <p className="faq-empty-tab" role="status">
            {items.length === 0
              ? "Loading…"
              : "No questions here yet — check back soon."}
          </p>
        ) : null}
          </>
        )}
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
