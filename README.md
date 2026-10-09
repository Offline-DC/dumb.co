# offline-community-website

## Requirements:

- Install node via [node.org](https://nodejs.org/en/download)

## Local development

- npm install
- npm run dev

## Editing content (Pages CMS)

Press, memories, the internship page, the FAQ videos and most site copy are
edited at **https://app.pagescms.org**. No code and no GitHub account needed.
Each save is a commit to `main`, and the normal deploy puts it live in a
couple of minutes.

| In Pages CMS | What it changes | File |
|---|---|---|
| **Press** | the articles on the press screen, their images, the press contact | `src/content/press.json` |
| **Memories** | events and their photos | `src/content/memories.json` |
| **Site copy → Home window** | the window that opens on dumb.co | `src/content/home.json` |
| **Site copy → Shop** | product name, buy button, Stripe checkout link, aid line | `src/content/shop.json` |
| **Site copy → Internship** | `/internship`: intro, roles, how to apply | `src/content/internship.json` |
| **Site copy → FAQ videos** | the SHOW ME HOW tab | `src/content/faq_videos.json` |
| **Site settings** | support email/phone/hours, group-discount text, footer, 404 page | `src/content/settings.json` |

Still edited elsewhere: the FAQ questions (the FAQ Google Sheet), prices and
the plan bullet points (Stripe), and the phone's menu labels, which double as
the screen names in `src/Phone/Screen.tsx`.

The forms are defined in `.pages.yml`. The site reads the files through
`src/content/index.ts`, which falls back to the original text for any field
left empty, and skips a press item or photo whose image is missing instead of
showing it broken.

**One-time setup:** sign in at app.pagescms.org with a GitHub account that has
access to `Offline-DC/dumb.co`, install the Pages CMS GitHub App on the repo
when asked, then add teammates under the repo's **Collaborators**. They are
invited by email and don't need a GitHub account.
