# SpookCoffee — Root Website

**Website:** https://spookcoffee.github.io/

This repository holds the **root landing page** for the SpookCoffee GitHub Pages account. It directs visitors to the Contact-ID contact card and, in the future, the Portfolio website.

## Current features

- Original **Graphite + Wine** dark design (kept from the uploaded repository)
- A non-clickable **Portfolio — Coming Soon** button
- A working **Contact-ID** button linking to https://spookcoffee.github.io/Contact-ID/
- **Contact-ID version shown: `v0.5.2 Beta`**, copied from the uploaded `index.html`
- Root website version in footer: **Beta v1**
- Inline vector (SVG) briefcase and contact-card icons; no external fonts or icon libraries

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The complete homepage: HTML structure, CSS styling, icons, and links |
| `.nojekyll` | Optional empty file that disables Jekyll processing on GitHub Pages |
| `README.md` | These notes; it does not control the website appearance |

There is no JavaScript, build system, dependency installation, or database. Object-oriented code isn't necessary for this small static landing page.

## Run locally in VS Code

1. Clone or open your existing `SpookCoffee.github.io` repository in VS Code.
2. Place `index.html`, `.nojekyll`, and `README.md` in the repository root (not inside another folder).
3. Open `index.html` in your browser, or use a VS Code preview extension. No build command is needed.
4. Once checked, commit and push changes to the branch that GitHub Pages deploys (usually `main`).

```powershell
git status
git add index.html .nojekyll README.md
git commit -m "Update homepage button icons"
git push origin main
```

Only use `git push origin main` **if you are currently working on `main`**. Check with `git branch --show-current` first. If you're on another branch, push that branch instead and merge it after review.

## Update later

- **Contact-ID version:** In `index.html`, find `<span class="version">v0.5.2 Beta</span>` and update it when you release another Contact-ID version.
- **Root version:** Find `<strong>Beta v1</strong>` near the bottom of `index.html`.
- **Portfolio launch:** Replace the non-clickable `<div class="link portfolio">...</div>` with an `<a href="https://spookcoffee.github.io/Portfolio/" class="link portfolio">...</a>` after the Portfolio site is published; also remove the `Coming Soon` text and change the cursor style appropriately.
- **Styling:** Color variables are at the top of the `<style>` section in `index.html`.

## Scope of this update

This update **only replaces the two small square placeholder button icons with SVG icons**. It keeps the existing design, links, version numbers, spacing, colors, and text. A more elaborate device-specific layout can be added in a future release.
