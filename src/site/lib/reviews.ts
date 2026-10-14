/**
 * The Google reviews shown on shop.exe, from src/content/reviews_snapshot.csv
 * (refresh it with redesign_2026/build/refresh_reviews_snapshot.py, or edit it
 * by hand). Rendered into the page at build time; the browser can still swap
 * in a live sheet if REVIEWS_CSV_URL is ever set in site.js.
 */
import raw from "../../content/reviews_snapshot.csv?raw";

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"') { if (inQuotes && n === '"') { cell += '"'; i++; } else inQuotes = !inQuotes; continue; }
    if (c === "," && !inQuotes) { row.push(cell); cell = ""; continue; }
    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && n === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = []; cell = ""; continue;
    }
    cell += c;
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); if (row.some((v) => v.trim() !== "")) rows.push(row); }
  return rows;
}

export type Review = { name: string; avatar: string; meta: string; stars: number; body: string };

export function reviewsFromRows(rows: string[][]) {
  if (!rows.length) return { list: [] as Review[], avg: "", count: "" };
  const head = rows[0].map((c) => String(c || "").trim().toLowerCase());
  const col = (r: string[], n: string) => { const i = head.indexOf(n); return i < 0 ? "" : String(r[i] || "").trim(); };
  const body = rows.slice(1).filter((r) => r && r.some((c) => String(c || "").trim()));
  const list = body
    .filter((r) => (col(r, "show").toLowerCase() || "yes") !== "no")
    .map((r) => ({
      order: parseInt(col(r, "order"), 10) || 999,
      name: col(r, "name") || "via Google",
      avatar: (col(r, "name") || "").trim().charAt(0).toUpperCase() || "G",
      meta: col(r, "meta"),
      stars: Math.max(1, Math.min(5, parseInt(col(r, "stars"), 10) || 5)),
      body: col(r, "body"),
    }))
    .filter((r) => r.body)
    .sort((a, b) => a.order - b.order);
  const first = (n: string) => { for (const r of body) { const v = col(r, n); if (v) return v; } return ""; };
  return { list, avg: first("avg_rating"), count: first("review_count") };
}

export const REVIEWS_ROWS = parseCsv(raw);
export const REVIEWS = reviewsFromRows(REVIEWS_ROWS);
/* Google's own list of them -- where "reviews" links to */
export const REVIEWS_PAGE = "https://search.google.com/local/reviews?placeid=ChIJiXXqrkq3t4kRFlcwNQMuk2k";
