/**
 * Every address the site answers, with the metadata that address should carry.
 *
 * This is the one list. scripts/prerender.mjs turns it into a real file per
 * route in dist/ (so GitHub Pages answers 200 instead of 404) plus sitemap.xml,
 * and src/App.tsx is the runtime router for the same paths. Adding a page means
 * adding it in both places.
 *
 *   path         the URL, leading slash, no trailing slash
 *   title        <title> — aim for 50-60 characters
 *   description  meta description — aim for 150-160
 *   sitemap      false to keep it out of sitemap.xml (redirects, alt spellings)
 */
export const SITE = "https://dumb.co";

export const ROUTES = [
  {
    path: "/",
    title: "dumb.co — the $20 dumbphone that syncs with your smartphone",
    description:
      "The dumbphone 2 is a $20 companion phone that syncs with your smartphone — texts, calls, maps, uber — minus the doomscroll. Plans from $15.99/mo.",
  },
  {
    path: "/phone",
    title: "Dumbphone 2 — $20 phone, plans from $15.99/mo | dumb.co",
    description:
      "$20 phone hardware with custom dumbOS and a SIM. Unlimited call and text, maps, signal, uber, hotspot. 4 month minimum plan, auto-renews monthly.",
  },
  {
    path: "/faq",
    title: "Dumbphone 2 FAQ — setup, plans, apps | dumb.co",
    description:
      "How the dumbphone 2 works: activation, syncing with your smartphone, which apps are on it, two-factor auth, plans and billing.",
  },
  {
    path: "/press",
    title: "Press — dumb.co in The Atlantic, WaPo, CNN, Dazed",
    description:
      "Coverage of dumb.co and the dumbphone 2, from The Atlantic, The Washington Post, CNN, The Guardian, Dazed, Axios and more.",
  },
  {
    path: "/support",
    title: "Support — dumb.co",
    description:
      "Get help with your dumbphone 2: setup, activation, billing and troubleshooting. support@dumb.co.",
  },
  {
    path: "/dumbdown",
    title: "Dumb Down — take the challenge | dumb.co",
    description:
      "Dumb down with us: put the smartphone away and pick up a dumbphone 2. How the challenge works and how to join.",
  },
  {
    path: "/setup",
    title: "Set up your dumbphone 2 — dumb.co",
    description:
      "Step-by-step setup for the dumbphone 2, including offline mode and syncing with your smartphone.",
  },
  {
    path: "/internship",
    title: "Internships at dumb.co",
    description:
      "Work on dumb.co: what the internship involves, who we are looking for, and how to apply.",
  },
  { path: "/faqs",    title: "Dumbphone 2 FAQ | dumb.co",        description: "How the dumbphone 2 works.", sitemap: false },
  { path: "/android", title: "Android downloads — dumb.co",      description: "Download the dumb down launcher for Android.", sitemap: false },
  { path: "/apps",    title: "App downloads — dumb.co",          description: "Downloads for dumb.co apps.", sitemap: false },
  { path: "/desktop", title: "Desktop sign in — dumb.co",        description: "Sign in to dumb.co on desktop.", sitemap: false },
  { path: "/signin",  title: "Sign in — dumb.co",                description: "Sign in to dumb.co.", sitemap: false },
];
