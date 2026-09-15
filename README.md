---

<p align="center">
    <img width="1080" height="720" src="/src/assets/art/thumbnail.jpg">
</p>

<h1 align="center">
    <a href="https://milotek.dev">milotek.dev</a>
</h1>

<p align="center">
    godawful """professional""" website
</p>

---



## Running it

```bash
npm install
cp .env.example .env    # fill in Last.fm if you want the listening card
npm run dev
npm run build
npm run check
```

The build passes `--force` because the vault sync regenerates the blog folder wholesale and Astro's content cache would otherwise keep stale entries.

## Where things live

```
src/config.ts              identity, socials, splash lines, friends' buttons
src/content/projects/*.md  one file per project, frontmatter + write-up
src/data/art.ts            the art page
src/assets/                images, optimised at build time
src/content/blog/          written by the vault sync, do not edit by hand
public/88x31.png           the button
```

## Blog

Posts come from `Personal/Blogs/` in the private ObsidianVault repo.
Its `sync-blog.yml` workflow runs on every push that touches that folder, rewrites `src/content/blog/` here and pushes the result to `main`, which triggers a deploy.
It authenticates with the `MILOTEK_DEV_TOKEN` secret in the vault repo, which needs contents write access to this repo.

A post is published when its frontmatter has a date:

```yaml
---
published: 2026-09-06
summary: One line for the index and the feed.
---
```

Anything without `published` is a draft and never leaves the vault.

Obsidian embeds (`![[file.png|300]]`), wikilinks and callouts are rewritten by the sync.
Attachments are found anywhere in the vault by filename.

## Deploying under a subpath

The base path is not hardcoded anywhere.

```bash
SITE_URL=https://example.com SITE_BASE=/milo npm run build
```

Every internal link goes through `url()` in `src/lib/url.ts`, so nothing breaks when the path changes.
The GitHub Actions workflow reads `SITE_URL` and `SITE_BASE` from repository variables.
