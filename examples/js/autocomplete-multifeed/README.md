# InstantSearch.js — Autocomplete multifeed

Showcases `EXPERIMENTAL_autocomplete` in **feeds-mode**: one composition
request drives all panel sections instead of one search call per section.

## Backend requirement

This example hits a composition named `comp1774447423386___products` on the
`9HILZG6EJK` Algolia app. It returns three feeds: `products`, `Fashion`, and
`Amazon`. To run this against a different backend, replace `searchClient` and
`compositionID` in `src/app.ts` with your own composition.

## Run

From the repo root:

```sh
yarn workspace example-instantsearch-autocomplete-multifeed dev
```

Open the URL the dev server prints and start typing. DevTools' Network tab
should show **exactly one** composition call per keystroke — regardless of
how many sections the panel renders.
