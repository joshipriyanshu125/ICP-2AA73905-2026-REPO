# Week 6 — Portfolio

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

- **Home:** two-column introduction and grayscale portrait, four project previews,
  project navigation, and a shared contact footer.
- **Projects:** six previews in a responsive two-column masonry layout.
- **About:** flip-over photo cards, biography, expandable experience, education,
  skill tags, and draggable/keyboard-movable tool chips with a reset control.
- Floating navigation, persistent dark/light themes, responsive layouts, hover
  treatments, scroll reveals, a recreated animated grayscale background, and
  reduced-motion support.
- Keyboard focus styles, a skip link, real route URLs, a not-found screen,
  clipboard error handling, and local image fallbacks.

## Add your information later

Edit **`portfolio/src/data/portfolio.js`**. This is the single content file:

| Export | Content |
| --- | --- |
| `profile` | Name, headline, introduction, portrait, email, social URLs, contact text |
| `projects` | Titles, summaries, artwork, roles, dates, project URLs |
| `about` | Biography, experience, education, skills, tool stack, photo cards |

Put your images in `portfolio/public/images/` and use paths such as
`/images/my-portrait.webp` in the content file. Set each real project's `url`
and change `demo` to `false` to remove its Preview label.

Personal information is intentionally **not filled in**. Experience and education
are visibly provisional. No social profile or email address is invented: until
configured, the relevant controls explain that details are coming soon. Once an
email is added, Contact reveals it, offers a mailto link, and can copy it.

### Reference artwork and fonts

The illustrated portrait and project artwork are temporary design-reference
assets, **not claims about your identity or work**. Fonts currently load from the
reference site; project artwork loads from Dribbble, and moodboard photography
loads from Unsplash. These external resources require network access. Image
failures use `public/images/placeholder.svg`; fonts have system fallbacks.

Replace the demo imagery with your own assets before publishing your personal
portfolio, and use only images/fonts you have permission to publish. The site
is a new implementation of the reference's layout and visual style, not its
original Next.js source. Its animation implementation is an approximation, not
a verified pixel-for-pixel copy.

## Verification

```bash
npm test
npm run build
npm audit --omit=dev
```

Verified on this rebuild: **17 interaction tests passed**, production build passed,
and **0 production dependency vulnerabilities** reported by npm audit.

Browser-level checks use Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

The tests start a separate production preview on port `4186` and cover all three
routes, navigation, theme persistence, contact placeholders, About controls,
image loading/fallbacks, and horizontal overflow at **1280, 768, 390, and 310 px**.
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
