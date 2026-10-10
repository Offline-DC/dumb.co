/**
 * Turning CMS text into markup, at build time. Everything a CMS user types is
 * escaped; on top of that there are three bits of formatting, because the
 * copy already uses them:
 *   **bold** (and ***bold***)
 *   [words](https://...)   a link; [words](plans) opens the plans drawer
 *   a line break           stays a line break; a blank line starts a paragraph
 *
 * These return HTML strings for Astro's set:html. They mirror what the
 * prototype's esc()/lines()/rich()/paras() produced, so the pages read the
 * same as before.
 */
export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const lines = (s: unknown) => esc(s).replace(/\n/g, "<br/>");

export function rich(s: unknown): string {
  return esc(s)
    .replace(/\*\*\*(.+?)\*\*\*/g, "<b>$1</b>")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, t: string, u: string) => {
      if (u === "plans") return `<a href="#" onclick="event.preventDefault(); showPlans();">${t}</a>`;
      const raw = u.replace(/&amp;/g, "&");
      if (/^(mailto|tel):/i.test(raw)) return `<a href="${u}">${t}</a>`;
      if (/^https?:\/\//i.test(raw)) return `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
      return t;
    })
    .replace(/\n/g, "<br/>");
}

export const paras = (s: unknown, cls?: string) =>
  String(s || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p${cls ? ` class="${cls}"` : ""}>${rich(p)}</p>`).join("");

export const starRow = (n: number) =>
  `<span class="stars">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;

/* ---- confetti --------------------------------------------------------------
   Deterministic pseudo-random dot fields, so every build lays them out
   identically. avoid = [l,t,w,h] in %, a zone (or zones) to keep clear. Same
   generator the prototype ran in the browser, so the dots land where they
   always have. */
const DOT_SIZE = 12;
const DOT_COLORS = ["var(--orange)", "var(--blue)", "var(--pink)", "var(--white)", "var(--black)", "var(--yellow)"];
export function makeDots(count: number, seed: number, avoid?: number[] | number[][]): string {
  let s = (seed * 2654435761) % 2147483647;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const out: string[] = [];
  const zones: number[][] = !avoid ? [] : Array.isArray(avoid[0]) ? (avoid as number[][]) : [avoid as number[]];
  let guard = 0;
  while (out.length < count && guard++ < count * 60) {
    const l = 1 + rnd() * 95, t = 1 + rnd() * 94;
    if (zones.some((z) => l > z[0] && l < z[0] + z[2] && t > z[1] && t < z[1] + z[3])) continue;
    const c = DOT_COLORS[Math.floor(rnd() * DOT_COLORS.length)];
    out.push(`<i style="left:${l.toFixed(1)}%;top:${t.toFixed(1)}%;width:${DOT_SIZE}px;height:${DOT_SIZE}px;background:${c};"></i>`);
  }
  return out.join("");
}
export const DOTS_EDGE = () => makeDots(18, 11, [0, 0, 62, 58]);
export const DOTS_SHOP_NARROW = () => makeDots(14, 11, [0, 0, 80, 46]);
export const DOTS_SHOP_END = () => makeDots(12, 5, [0, 0, 72, 100]);
export const DOTS_PAGE = () => makeDots(46, 3, [[0, 0, 46, 20], [0, 70, 100, 30]]);
