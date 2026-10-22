# Week 6 — Priyanshu Joshi’s Portfolio

A fresh React + Vite portfolio, rebuilt from an empty source directory using
[rbp-portfolio.vercel.app](https://rbp-portfolio.vercel.app/) as the visual reference.
Weeks 1–5 are unchanged. The previous Week 6 implementation is no longer used.

## Run locally

From `Week6/portfolio`:

```bash
npm ci
npm run dev
```

Vite prints the local address. To choose an unused port explicitly:

```bash
npm run dev -- --port 5176 --strictPort
```

## Included

- **Home:** Priyanshu’s introduction, his supplied portrait, three repository
  projects, project navigation, and a shared contact footer.
- **Projects:** TaskFlow (Weeks 2–3), Weather Dashboard (Weeks 4–5), and Personal
  Portfolio (Week 6), with technology tags and source-code links. TaskFlow and
  Weather Dashboard also link to the live frontends documented in this repository.
- **About:** résumé-based biography, independent project experience, education
  with grades and coursework, What I do, a draggable tool stack, grouped technical
  skills, soft skills, certifications, and achievements. Decorative flip cards
  retain the reference layout without claiming stock photography is personal.
- Floating navigation, persistent dark/light themes, responsive layouts, hover
  treatments, scroll reveals, a recreated animated grayscale background, and
  reduced-motion support.
- Keyboard focus styles, a skip link, real route URLs, a not-found screen,
  clipboard error handling, and local image fallbacks.

## Profile and project content

Edit **`portfolio/src/data/portfolio.js`**. This is the single content file:

| Export | Content |
| --- | --- |
| `profile` | Name, headline, introduction, location, phone, portrait, email, LinkedIn, GitHub |
| `projects` | Titles, summaries, local artwork, roles, week labels, technology tags, live and source URLs |
| `about` | Biography, experience, education, skills, tool stack, certifications, achievements, decorative cards |

Put your images in `portfolio/public/images/` and use paths such as
`/images/my-portrait.webp` in the content file. Each project's `url` is its live
frontend and `repositoryUrl` is its source-code location. Leave `url` empty when
there is no confirmed deployment; the portfolio itself currently has source only.

The supplied résumé is the source for the public profile, contact details, About
sections, grades, skills, and awards. The original PDF is not copied into the
public site. No employment dates, employers, certificate URLs, or deployment
URLs have been invented. Contact reveals the supplied email, offers a mailto
link, and can copy it; About also offers a phone link.

**Project selection is deliberately separate from the résumé.** Only the three
projects from this six-week repository are featured. The four-application and
20+ API endpoint figures in Experience describe the résumé’s broader independent
work; they are not counts of the projects featured here. One experience entry is
shown without a fake expansion button; the component still supports longer lists.

### Artwork and fonts

The hero uses the portrait image supplied in this chat. It is presented in the
reference’s grayscale, rounded frame with a blur/scale-in entrance effect. All
three project covers are locally stored, original SVG illustrations with
visible “Illustrative project overview” captions, not purported screenshots.
The unrelated reference portrait and Dribbble project images have been removed.
Fonts still load from the reference site, and decorative moodboard photography
loads from Unsplash. Those resources require network access. Image failures use
`public/images/placeholder.svg`; fonts have system fallbacks.

You can replace the portrait and concept covers with newer assets later. Use only
assets you have permission to publish. The site
is a new implementation of the reference's layout and visual style, not its
original Next.js source. Its animation implementation is an approximation, not
a verified pixel-for-pixel copy.

## Verification

```bash
npm test
npm run build
npm audit --omit=dev
```

Verified after personalization: **21 interaction tests passed** and the production
build passed. The dependency set is unchanged; the earlier rebuild’s production
audit reported 0 vulnerabilities. Run the audit command above for a fresh report.

Browser-level checks use Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

The tests start a separate production preview on port `4186` and cover all three
routes, navigation, theme persistence, configured contact links, résumé sections,
project selection/links, About controls, image loading/fallbacks, and horizontal
overflow at **1280, 768, 390, and 310 px**.
All **8 browser tests passed** using the installed Microsoft Edge browser:

```bash
PLAYWRIGHT_CHANNEL=msedge npm run test:e2e
```

The command above uses Bash environment-variable syntax. In PowerShell use
`$env:PLAYWRIGHT_CHANNEL = 'msedge'` before `npm run test:e2e`.
Screenshots and failure traces are written to ignored `portfolio/test-results/`.
There is no separate lint or TypeScript check configured for this JavaScript app.

## Deployment

For Vercel, choose **`Week6/portfolio`** as the project root. Build command:
`npm run build`; output directory: `dist`. `vercel.json` supplies the SPA fallback
so direct visits and refreshes at `/projects` and `/about` work.

For another static host, serve `dist` and configure unmatched page routes to
return `index.html`. Deploy at the domain root. No backend, API keys, account
credentials, or environment variables are needed. No deployment has been made.
