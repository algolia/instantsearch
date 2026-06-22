# react-instantsearch-router-nextjs (Next.js Pages Router)

A **thin routing adapter** for the **Pages Router** — not a full SSR layer. It wraps InstantSearch's history router so URL sync plays well with `next/router`. The actual SSR is the standard react-instantsearch `getServerState` + `InstantSearchSSRProvider` pattern in your app, **not** here.

## Public surface

- `createInstantSearchNextRouter({ singletonRouter, serverUrl?, ... })` (`src/index.ts`) — returns a `Router` you pass to `<InstantSearch routing={{ router }}>`. Tagged `$$type: 'ais.nextjs'`.

## What it actually does (and why)

- Builds on `instantsearch.js/es/lib/routers/history`; on the server (`typeof window === 'undefined'`) it returns a simpler router reading from `serverUrl`.
- `push` uses **`shallow: true`** so refinements don't re-run `getServerSideProps`, and strips the locale (`stripLocaleFromUrl`) to avoid Next i18n path errors.
- Hooks `routeChangeComplete` + `beforePopState` to trigger SSR **only** on real page changes (back/forward to a different page), not on every refinement. `beforePopState`/`beforeStart`/`beforeDispose`/`routerOptions` let consumers compose their own logic.
- `stripLocaleFromUrl` (`src/utils/`) handles i18n locale prefixes in the URL.

## Working here

```bash
yarn workspace react-instantsearch-router-nextjs build
yarn workspace react-instantsearch-router-nextjs test:e2e   # Playwright (Pages Router)
```

- Surface is small — most behavior lives in the shared history router (`instantsearch.js`) and react-instantsearch SSR core. Keep this package to the **Next-specific routing glue**.
- The tricky cases are i18n/locale paths and back/forward navigation deciding whether to re-SSR. e2e in `__tests__/e2e/` (Playwright); see `.claude/rules/e2e.md`.
