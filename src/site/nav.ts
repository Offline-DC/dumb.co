/**
 * The sections, in nav order: their addresses (dumb.co/<slug>), the label in
 * the sidebar and the phone's menu, and the window title they open under.
 */
export const NAV = [
  { key: "shop", slug: "shop", label: "Shop" },
  { key: "about", slug: "about", label: "About" },
  { key: "community", slug: "community", label: "Community" },
  { key: "press", slug: "press", label: "Press" },
  { key: "memories", slug: "memories", label: "Memories" },
  { key: "faq", slug: "faq", label: "FAQ" },
  { key: "contact", slug: "contact", label: "Contact" },
] as const;

export type SectionKey = (typeof NAV)[number]["key"];

/* all lowercase (Jack, Oct 9: "Community.exe is community.exe") */
export const EXE: Record<SectionKey | "home", string> = {
  home: "flipoff.exe", about: "about.exe", shop: "shop.exe", community: "community.exe",
  press: "press.exe", memories: "memories.exe", faq: "faq.exe", contact: "contact.exe",
};

/* sections that draw their own edge-to-edge blocks */
export const BLEED: SectionKey[] = ["about", "press", "shop", "community", "contact"];
