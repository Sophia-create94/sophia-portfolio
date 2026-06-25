# Sophia Müller — Portfolio

> The personal portfolio of **Sophia Müller, Product Designer integrating AI across the full UX process** — selected work, AI experiments, and the thinking behind them. Clean, fast, and hand-built.

**Live → [sophia-ux.com](https://sophia-ux.com/)**

A restrained, editorial portfolio built the old-fashioned way: hand-written HTML, CSS, and vanilla JavaScript — no framework, no build step. It loads instantly and stays easy to edit by hand.

---

## ✨ Highlights

- **Selected work** — a case study per project: what I designed, what worked, what didn't, and what I learned.
- **Experiments** — a playground of small, fast AI builds (like _A day on the J train_).
- **Device-framed demos** — looping phone and desktop mockups showing each project in motion.
- **Editorial design system** — a dark, coral-accented palette with light full-bleed bands, all in plain CSS.
- **Fast & accessible** — fully responsive, `prefers-reduced-motion` aware, and dependency-free (just two web fonts).

## 🧭 Pages

| Route | Page |
|-------|------|
| `/` | **Home** — hero, selected work, experiments, about |
| `/about` | **About** — background, how I work, and where I stand on AI |
| `/work/focus-forest` | **Focus Forest** — case study |
| `/work/ada` | **Ada** — case study |

## 🛠 Tech stack

- Hand-written **HTML · CSS · vanilla JavaScript** — no framework, no build step
- Fonts: **Urbanist** (headings) + **Open Sans** (body) via Google Fonts
- Deployed on **[Vercel](https://vercel.com/)** — auto-deploy from `main`, clean URLs via `vercel.json`

## 🚀 Run it locally

No install, nothing to compile. Either open the file directly:

```bash
open index.html
```

…or serve it (recommended, for clean inter-page links and correct asset loading):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 📁 Project structure

```
index.html      # homepage — header, hero, selected work, experiments, about, footer
about.html      # about page
styles.css      # all styles (homepage + shared case-study classes)
main.js         # all behavior (verb cycle, scroll motion, reveals, back-to-top)
vercel.json     # static deploy config (clean URLs)
assets/         # demo videos, posters, portraits, favicons
work/           # one HTML page per case study (copy _template.html to start a new one)
```

## Deployment

Hosted on Vercel.

---

_Designed and built by Sophia Müller — 2026, with AI-assisted development._
