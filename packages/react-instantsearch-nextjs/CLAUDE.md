# react-instantsearch-nextjs (Next.js App Router)

SSR integration for the **App Router** (RSC + streaming). Peer-deps `next` + `react-instantsearch` — it **composes** react-instantsearch, never reimplements search. This is the non-trivial Next.js package; the subtle part is server-render + hydration.

## Public surface

- `InstantSearchNext` (`src/InstantSearchNext.tsx`) — the entry component, a drop-in for `<InstantSearch>` inside the App Router. It does SSR **for you**, so you don't hand-wire the plain-react-instantsearch `getServerState` + `InstantSearchSSRProvider` dance. Props: `routing` (boolean | object) and an optional `instance`.

## How the SSR machinery fits together

- `InitializePromise.ts` + `TriggerSearch.ts` — run the search **during the server (RSC) render** so results are available before HTML is sent.
- `createInsertHTML.tsx` + `htmlEscape.ts` — serialize that initial server state and **inject it into the streamed HTML** for hydration. `htmlEscape` is a **safety boundary** (escapes the injected payload so it can't break out of the script/HTML context) — don't bypass it when touching the insert path.
- `useInstantSearchRouting.ts`, `useNextHeaders.tsx`, `useDynamicRouteWarning.ts` — routing via `next/navigation` (not `next/router`). Dynamic routes are warned about (`useDynamicRouteWarning`) because they interact poorly with InstantSearch URL sync.

## Working here

```bash
yarn workspace react-instantsearch-nextjs build
yarn jest packages/react-instantsearch-nextjs/src/__tests__/<name>   # unit tests, from repo root
yarn workspace react-instantsearch-nextjs test:e2e                   # Playwright (App Router)
```

- **Hydration is the failure mode.** A change to the initialize/trigger/insert path can produce server/client markup mismatch — verify there's no hydration warning and that the first paint already reflects server results.
- e2e lives in `__tests__/e2e/` (Playwright). Browser back/forward on dynamic App Router routes needs file-level `slowMo` in headless mode — see `.claude/rules/e2e.md`.
- Treat SSR/RSC/hydration work here as **reasoning-heavy** — it's the one corner of the React surface that isn't bounded widget wiring.
