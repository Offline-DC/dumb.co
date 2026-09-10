# How dumb.co is actually hosted

*(read-only reference — nothing in this file deploys anything)*

There's no `github.io` URL to find because a custom domain replaces it. The
whole thing is GitHub Pages.

## The chain, end to end

```
push to main  (github.com/Offline-DC/dumb.co)
     |
     v
GitHub Actions  .github/workflows/deploy.yml
     |   npm install
     |   npm run build            vite -> dist/  (bundles src/, copies public/ verbatim)
     |   cp dist/index.html dist/404.html
     v
peaceiris/actions-gh-pages
     |   force-pushes dist/ to the  gh-pages  branch  (force_orphan: no history)
     |   writes  CNAME = dumb.co  and  .nojekyll  into that branch
     v
GitHub Pages serves the gh-pages branch
     |
     v
dumb.co        AAAA -> 2606:50c0:800{0,1,2,3}::153   (GitHub Pages)
www.dumb.co    CNAME -> offline-dc.github.io
```

So: **yes, the files live in the repo and are deployed by something else — but
that something else is also GitHub.** Nothing is stored anywhere but this repo,
and there is no third-party host, no S3, no Vercel.

Two things follow from that, and they're the answer to "why don't I see a
github.io site url":

- The repo is a *project* site, so its default URL would be
  `offline-dc.github.io/dumb.co/`. Because the workflow sets `cname: dumb.co`,
  GitHub serves it at the apex domain instead and redirects the github.io URL to
  it. That's why the github.io address never shows up anywhere.
- The `CNAME` file is **not in `main`** — the deploy action writes it into
  `gh-pages` on every run. If someone ever removes `cname: dumb.co` from the
  workflow, the custom domain silently unsets itself on the next deploy. Worth
  knowing; it looks like a DNS outage when it happens.

`main` holds the source. `gh-pages` holds the built site and is disposable —
never commit to it by hand, every deploy replaces it wholesale.

## "Is it delivering all the files, exactly?"

Run this before you care about a deploy:

```
cd ~/Desktop/dumb.co_code/dumb.co
npm run build                          # writes dist/ locally. pushes nothing.
python3 redesign_2026/build/check_deploy.py
```

It's read-only and it checks, in order: the workflow (which branch deploys,
whether the custom domain is still set, whether Jekyll is off), the weight
against Pages' limits, whether **every file in `public/` came out the other side
in `dist/` byte for byte**, whether every absolute `src`/`href` in the built
`index.html` resolves to a real file, and whether `robots.txt` / `sitemap.xml`
exist. Anything it flags comes with what to do about it.

How the delivery works, so the checks make sense: Vite copies `public/`
**verbatim** into `dist/` — no hashing, no processing, paths stay identical, so
`/img/dumbco.png` in the code means `public/img/dumbco.png` on disk. Everything
imported from `src/` instead gets bundled and content-hashed into
`dist/assets/`. A file that's in neither place is simply not on the site, which
is the failure mode worth testing for.

## What the checks turn up today

Nothing is broken, but two things are worth a decision:

**`public/` is 358 MB, and every deploy uploads all of it.** GitHub Pages caps a
published site at 1 GB and gives 100 GB of bandwidth a month, soft. Six tracked
files are over 20 MB and three are over 50 MB:

| | |
| --- | --- |
| 71 MB | `public/demo.mp4` |
| 64 MB | `public/msgback.mp4` |
| 58 MB | `public/msg4werd.mp4` |
| 37 MB | `public/how2msg.mp4` |
| 34 MB | `public/dumb-down-debug.apk` |
| 27 MB | `public/google-play-instructions.mp4` |

That's 36% of the site limit spent on six files, git warns above 50 MB and
refuses above 100 MB, and the 64 MB video is about 1,600 plays before the
monthly bandwidth ceiling. The videos belong on Vimeo (the FAQ demos already
are) and the APKs belong on GitHub Releases, which don't count against Pages
at all. That also makes every deploy minutes faster — the 10-minute build
timeout is the other limit in play.

**The `404.html` trick can't carry real routes.** `cp dist/index.html
dist/404.html` makes any path render the app, but GitHub Pages returns it with
an **HTTP 404 status**. Browsers ignore that; crawlers don't. It's fine while
every visitor lands on `/`, and it breaks the moment `dumb.co/shop` is a real
address people share. Fix is in `SEO.md`: prerender the routes with React
Router 7 (already installed) so each one is a real file with a real 200.

## Where the current branch is

`check_deploy.py` also tells you whether the branch you're on is the one that
deploys. Only `main` does. Anything sitting on a feature branch — right now
`add-dumbwireless-referral-link` — is not on the live site no matter how
finished it looks locally.
