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

const isConnector = (name: string) => /^connect[A-Z]/.test(name);
const hookOf = (connector: string) => `use${connector.slice('connect'.length)}`;

const reactCoreExports = reactInstantSearchCore as Record<string, unknown>;

// A connector that has a matching hook (`connectSearchBox` → `useSearchBox`)
// is not re-exported: React users use the hook.
const coveredByHook = (name: string) =>
  isConnector(name) && typeof reactCoreExports[hookOf(name)] === 'function';

const coreNames = Object.keys(core).filter(
  (name) => !SHADOWED_BY_REACT.includes(name)
);
const droppedConnectors = coreNames.filter(coveredByHook);
const reExportedNames = coreNames.filter((name) => !coveredByHook(name));

const packages = [
  ['react-instantsearch', reactInstantSearch],
  ['react-instantsearch-core', reactInstantSearchCore],
] as const;

describe('instantsearch-core re-exports', () => {
  test('core exposes runtime names to re-export', () => {
    expect(reExportedNames).toEqual(
      expect.arrayContaining([
        'connectRatingMenu',
        'historyRouter',
        'simpleStateMapping',
        'singleIndexStateMapping',
        'createInsightsMiddleware',
      ])
    );
  });

  test('the connectors without a hook are the expected ones', () => {
    // A new connector in core fails here until it gets a React hook (then it is
    // dropped from the re-exports) or is added to this list on purpose.
    expect(coreNames.filter(isConnector).filter((name) => !coveredByHook(name)))
      .toMatchInlineSnapshot(`
      [
        "connectHitsWithInsights",
        "connectInfiniteHitsWithInsights",
        "connectRatingMenu",
        "connectRelevantSort",
        "connectTasks",
        "connectVoiceSearch",
      ]
    `);
  });

  test.each(packages)(
    '%s re-exports every runtime name of core that has no hook',
    (_, pkg) => {
      const missing = reExportedNames.filter((name) => !(name in pkg));

      expect(missing).toEqual([]);
    }
  );

  test.each(packages)(
    '%s re-exports the same values as instantsearch-core',
    (_, pkg) => {
      const different = reExportedNames.filter(
        (name) =>
          (pkg as Record<string, unknown>)[name] !==
          (core as Record<string, unknown>)[name]
      );

      expect(different).toEqual([]);
    }
  );

  test.each(packages)(
    '%s does not re-export the connectors that have a hook',
    (_, pkg) => {
      expect(droppedConnectors.length).toBeGreaterThan(0);

      const exported = droppedConnectors.filter((name) => name in pkg);

      expect(exported).toEqual([]);
    }
  );

  test('every connector of core is covered by a hook or re-exported', () => {
    const unclassified = coreNames
      .filter(isConnector)
      .filter(
        (name) =>
          !coveredByHook(name) &&
          reactCoreExports[name] !== (core as Record<string, unknown>)[name]
      );

    expect(unclassified).toEqual([]);
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
