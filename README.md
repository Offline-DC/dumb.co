# offline-community-website

## Requirements:

- Install node via [node.org](https://nodejs.org/en/download)

## Local development

- npm install
- npm run dev

## Editing content (Pages CMS)

The new site's words, press, memories and FAQ are edited at
**https://app.pagescms.org**. No code, and no GitHub account needed for people
you invite. The forms are defined in `.pages.yml`; the content is the JSON in
`src/content/`; `redesign_2026/build/build.py` bakes it into the pages.

| In Pages CMS | What it changes |
|---|---|
| **Press** | press.exe: articles, images, order |
| **Memories** | memories.exe: events and photos |
| **FAQ** | faq.exe: questions, answers, tabs, videos (replaces the Google Sheet) |
| **Site copy** | home, about.exe, shop.exe, community.exe |
| **Site settings** | page title and description for Google and link previews, support email/phone/hours |

### Where an edit goes

Every save in Pages CMS is a commit to **the branch picked at the top of the
CMS**. What that commit does depends on the branch:

| Branch | A save... |
|---|---|
| `dumb.co_redesign_v1` (now, before launch) | rebuilds the preview at offline-dc.github.io/dumb.co-redesign-preview in a minute or two (`.github/workflows/redesign-preview.yml`) |
| `main` (after launch) | rebuilds dumb.co (`.github/workflows/deploy.yml`) |

Until launch, keep the CMS on `dumb.co_redesign_v1`: that is where these
forms and files exist. `main` has neither until the redesign is merged, so
Pages CMS shows nothing to edit there. Edits made on the redesign branch
travel to `main` with the merge; nothing has to be copied over.

### One-time setup

1. Sign in at app.pagescms.org with a GitHub account that has access to
   `Offline-DC/dumb.co`, and install the Pages CMS GitHub App on the repo when
   asked.
2. Open the repo and switch the branch to `dumb.co_redesign_v1`.
3. Invite the team under **Collaborators** (by email).
4. For the preview to rebuild on its own, add the deploy key described at the
   top of `.github/workflows/redesign-preview.yml`.
