# CLAUDE.md

This file gives Claude Code (and other AI assistants) the context needed to work in this repo.

## Project overview

This is **Dala**, a single-page marketing/landing site: "Your workplace has the answer. Just ask
Dala for it." It's a React + Vite SPA — no router, no backend, no API calls (despite `axios`
being a dependency, nothing currently uses it). The whole site is one scrolling page assembled
from a handful of section components in `src/App.jsx`.

## Stack

- **React 19** + **Vite 8** (`@vitejs/plugin-react`)
- Plain CSS per component (no Tailwind, no CSS-in-JS, no CSS modules — just `import "./X.css"`)
- **ESLint 10** flat config (`eslint.config.js`) with `eslint-plugin-react-hooks` and
  `eslint-plugin-react-refresh`
- No test framework is configured in this repo

## Commands

```bash
npm install       # install deps
npm run dev       # start Vite dev server (0.0.0.0:5173, see vite.config.js)
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint      # run ESLint over the repo
```

There are no test scripts — verification is lint + manually checking the page in a browser
(`npm run dev`).

## Structure

```
index.html              # entry HTML; loads Inter from Google Fonts, sets <title>/meta description
src/
  main.jsx              # React root, wraps <App /> in <StrictMode>
  App.jsx                # composes the page: Navbar, Hero, two Sections, Team, Footer
  App.css / index.css    # index.css holds global resets + CSS custom properties (design tokens)
  components/
    Navbar.jsx/.css       # sticky nav, scroll-based `navbar--scrolled` state
    Hero.jsx/.css         # top hero with headline + ParticleField visual
    Section.jsx/.css      # generic reusable "label / title / body / visual" content block
    Team.jsx/.css         # paginated team grid (client-side pagination via PAGE_SIZE)
    Footer.jsx/.css       # closing CTA + footer links
    ParticleField.jsx/.css # <canvas>-based animated triangle-particle background effect
  data/
    team.js               # static team member data + PAGE_SIZE constant
public/
  favicon.svg, icons.svg
```

## Conventions

- **One component = one `.jsx` + one same-named `.css` file**, imported directly in the component
  (`import "./ComponentName.css"`). Keep this pairing when adding components.
- **BEM-ish class names** scoped by component, e.g. `hero`, `hero__text`, `hero__title`,
  `navbar--scrolled`. Follow `block__element` / `block--modifier` when adding markup.
- **Design tokens live in `src/index.css`** as CSS custom properties on `:root` — colors
  (`--color-electric-iris`, etc.), type scale (`--text-*`), spacing (`--spacing-*`), radii
  (`--radius-*`). Reuse existing tokens instead of hardcoding new colors/sizes; add a new token
  to `index.css` if a genuinely new value is needed.
- **Visual identity**: pure black canvas (`--color-void`), single Electric Iris accent
  (`#8052ff`), weight-400 headlines (never bold `h1`–`h6`, see global reset in `index.css`),
  ultra-light body copy, Inter font loaded via Google Fonts in `index.html`.
- **Section content is data-driven via props**, not hardcoded per instance — see how `App.jsx`
  passes `label`/`title`/`body`/`reverse` into the generic `<Section>` component rather than
  creating one-off section components.
- **Static content lives in `src/data/`** (e.g. `team.js`) rather than inline in components when
  it's a list of records.
- Double-quoted strings, no semicolon inconsistency to worry about — match the existing file's
  style (most files use double quotes and semicolons; `main.jsx` is the one exception using
  single quotes/no semicolons since it's the Vite template default — don't "fix" that
  inconsistency unless asked).
- Anchor-link navigation (`#top`, `#manifesto`, `#team`, `#request-access`) drives in-page
  scrolling — when adding/renaming a section, keep the `id` in sync with any `Navbar`/`Footer`
  links pointing at it.
- Respect `prefers-reduced-motion`: `ParticleField` checks
  `window.matchMedia("(prefers-reduced-motion: reduce)")` and renders a static frame instead of
  animating; `index.css` also globally collapses animation/transition durations. Keep this in
  mind for any new animation.

## Working in this repo

- This is a marketing site, not an app with business logic — most changes are visual/content
  (copy, layout, styling, new sections) rather than data/state changes.
- After any UI change, run `npm run dev` and check the page in a browser; there's no automated
  test suite to lean on.
- Run `npm run lint` before considering a change done.
- Keep the "reuse `<Section>`" pattern in mind before adding a new bespoke section component —
  most new content sections should fit the existing `label/title/body/reverse` shape.
