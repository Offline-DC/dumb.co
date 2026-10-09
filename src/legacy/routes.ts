/**
 * The older pages that aren't part of the new desktop -- downloads, setup,
 * support, the internship -- still the React components they always were,
 * each built as its own page and run in the browser (src/pages/[...legacy].astro).
 * Adding one: a line here and a <Route> in LegacyApp.tsx.
 *
 * ssr: true renders the page's own component into the HTML at build time
 * (so search engines read it) and wakes it up in the browser; the rest are
 * mounted in the browser only, through LegacyApp's router. (support and
 * setup use react-player, which can't render on the server.)
 * sitemap: false keeps a page out of sitemap.xml (alternate spellings,
 * download hand-offs).
 */
export const LEGACY_ROUTES: { path: string; title: string; description: string; ssr?: boolean; sitemap?: boolean }[] = [
  { path: "support", title: "Support — dumb.co", description: "Get help with your dumbphone 2: setup, activation, billing and troubleshooting. support@dumb.co." },
  { path: "dumbdown", ssr: true, title: "Dumb Down — take the challenge | dumb.co", description: "Dumb down with us: put the smartphone away and pick up a dumbphone 2. How the challenge works and how to join." },
  { path: "setup", title: "Set up your dumbphone 2 — dumb.co", description: "Step-by-step setup for the dumbphone 2, including offline mode and syncing with your smartphone." },
  { path: "internship", ssr: true, title: "Internships at dumb.co", description: "Work on dumb.co: what the internship involves, who we are looking for, and how to apply." },
  { path: "android", title: "Android downloads — dumb.co", description: "Download the dumb down launcher for Android.", sitemap: false },
  { path: "apps", title: "App downloads — dumb.co", description: "Downloads for dumb.co apps.", sitemap: false },
  { path: "desktop", title: "Desktop sign in — dumb.co", description: "Sign in to dumb.co on desktop.", sitemap: false },
  { path: "desktop-signin", title: "Desktop sign in — dumb.co", description: "Sign in to dumb.co on desktop.", sitemap: false },
  { path: "signin", title: "Sign in — dumb.co", description: "Sign in to dumb.co.", sitemap: false },
  { path: "app", title: "dumb.co", description: "Opening the dumb down app.", sitemap: false },
  { path: "mobile", title: "dumb.co", description: "Opening your dumb.co plan.", sitemap: false },
];
