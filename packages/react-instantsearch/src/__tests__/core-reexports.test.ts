/**
 * React users import everything from their flavor package: the user-facing API
 * of `instantsearch-core` (connectors, routers, state mappings, middlewares,
 * types, …) must be reachable from `react-instantsearch` and
 * `react-instantsearch-core`, without installing `instantsearch-core` or
 * `instantsearch.js`.
 */
import * as core from 'instantsearch-core';
import * as reactInstantSearch from 'react-instantsearch';
import * as reactInstantSearchCore from 'react-instantsearch-core';

import type {
  BaseHit,
  Hit,
  IndexRenderState,
  InsightsClient,
  InstantSearchInstance,
  Middleware,
  Range,
  RangeBoundaries,
  RatingMenuConnectorParams,
  RatingMenuWidgetDescription,
  Router,
  UiState,
} from 'react-instantsearch';
import type * as TypesFromReactInstantSearchCore from 'react-instantsearch-core';

// Names that exist on the root of `instantsearch-core` and that React
// deliberately replaces with its own export. Adding a name here needs a reason:
// users get the React version, not core's.
const SHADOWED_BY_REACT: string[] = [];

const coreNames = Object.keys(core).filter(
  (name) => !SHADOWED_BY_REACT.includes(name)
);

describe('instantsearch-core re-exports', () => {
  test('core exposes runtime names to re-export', () => {
    expect(coreNames).toEqual(
      expect.arrayContaining([
        'connectSearchBox',
        'connectRatingMenu',
        'historyRouter',
        'simpleStateMapping',
        'singleIndexStateMapping',
        'createInsightsMiddleware',
      ])
    );
  });

  test.each([
    ['react-instantsearch', reactInstantSearch],
    ['react-instantsearch-core', reactInstantSearchCore],
  ])('%s re-exports every runtime name of instantsearch-core', (_, pkg) => {
    const missing = coreNames.filter((name) => !(name in pkg));

    expect(missing).toEqual([]);
  });

  test.each([
    ['react-instantsearch', reactInstantSearch],
    ['react-instantsearch-core', reactInstantSearchCore],
  ])('%s re-exports the same values as instantsearch-core', (_, pkg) => {
    const different = coreNames.filter(
      (name) =>
        (pkg as Record<string, unknown>)[name] !==
        (core as Record<string, unknown>)[name]
    );

    expect(different).toEqual([]);
  });

  test('React exports win over colliding core names', () => {
    expect(typeof reactInstantSearchCore.InstantSearch).toBe('function');
    expect(reactInstantSearch.InstantSearch).toBe(
      reactInstantSearchCore.InstantSearch
    );
    expect(typeof reactInstantSearch.SortBy).toBe('function');
    expect(reactInstantSearchCore.version).toBe(reactInstantSearch.version);
  });

  test('exposes the flavor-only API next to the core API', () => {
    expect(typeof reactInstantSearch.useSearchBox).toBe('function');
    expect(typeof reactInstantSearch.SearchBox).toBe('function');
    expect(typeof reactInstantSearchCore.useSearchBox).toBe('function');
  });
});

// Type-only checks: these are verified by `tsc` (yarn type-check), not at
// runtime. Every user-facing type must be importable from the flavor package.
// An import that does not resolve fails the type-check.
type UserTypes = [
  BaseHit,
  Hit,
  IndexRenderState,
  InsightsClient,
  InstantSearchInstance,
  Middleware,
  Range,
  RangeBoundaries,
  RatingMenuConnectorParams,
  RatingMenuWidgetDescription,
  Router,
  UiState,
];

type UserTypesFromCore = [
  TypesFromReactInstantSearchCore.BaseHit,
  TypesFromReactInstantSearchCore.Hit,
  TypesFromReactInstantSearchCore.IndexRenderState,
  TypesFromReactInstantSearchCore.InsightsClient,
  TypesFromReactInstantSearchCore.InstantSearchInstance,
  TypesFromReactInstantSearchCore.Middleware,
  TypesFromReactInstantSearchCore.Range,
  TypesFromReactInstantSearchCore.RangeBoundaries,
  TypesFromReactInstantSearchCore.RatingMenuConnectorParams,
  TypesFromReactInstantSearchCore.RatingMenuWidgetDescription,
  TypesFromReactInstantSearchCore.Router,
  TypesFromReactInstantSearchCore.UiState,
];

test('user types are importable from the flavor packages', () => {
  const checked: [UserTypes | undefined, UserTypesFromCore | undefined] = [
    undefined,
    undefined,
  ];

  expect(checked).toHaveLength(2);
});
