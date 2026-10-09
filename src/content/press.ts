/**
 * Press for the React app, from src/content/press.json -- the same file the
 * redesign builds from and Pages CMS edits, so there is one press list.
 */
import pressJson from "./press.json";

export type PressEntry = {
  id?: string;
  title?: string;
  source?: string;
  link?: string;
  image?: string;
  hidden?: boolean | string;
};

export function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

export function isHidden(value: unknown): boolean {
  return value === true || value === "true";
}

/** "/src/Press/images/bi.jpg" -> "bi.jpg" */
export function fileName(path: unknown): string {
  return typeof path === "string" ? (path.trim().split("/").pop() ?? "") : "";
}

const p = (pressJson ?? {}) as Record<string, unknown>;
export const PRESS = {
  heading: str(p.heading, "Press"),
  contactEmail: str(p.contact_email, "afreka@dumb.co"),
  items: (Array.isArray(p.items) ? p.items : []) as PressEntry[],
};
