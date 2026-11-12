/**
 * Export-parity test across the three InstantSearch flavors.
 *
 * InstantSearch.js, React InstantSearch and Vue InstantSearch must all expose
 * the same shared widgets (under each flavor's naming convention: `chat`,
 * `Chat`, `AisChat`). This class of divergence has happened before — widgets
 * landed in one flavor and were never ported (the chat layouts, greeting,
 * loader and PromptSuggestions were React/JS-only for releases) — so the
 * whole export surface is compared, not just the chat family.
 *
 * The comparison is intentionally cheap: export *names* only, never
 * implementations or types. Everything missing from a flavor fails the test
 * unless it is in the explicit allowlist of intentional differences below.
 */

import instantsearch from 'instantsearch.js';
import * as jsChat from 'instantsearch.js/es/widgets/chat/chat';
import * as reactExports from 'react-instantsearch';

// Loaded with `require` on purpose (same rationale as
// `tests/common/widgets/chat/utils.ts`): importing `vue-instantsearch` would
// pull Vue's type declarations into this compilation, and Vue 2's augment the
// global `JSX` namespace, breaking React JSX across the shared tests.
function getVueExports(): Record<string, unknown> {
  return require('../../packages/vue-instantsearch/src/instantsearch.js');
}

/**
 * The JS flavor's root entry is a function with namespaces (`widgets`,
 * `templates`, `connectors`, …) rather than flat named exports, so its
 * widget surface is the union of its namespaces plus the named exports of
 * the chat widget module (the JS public surface for chat tooling — the
 * `Tool`/`Tools` types and the chat tool factories live there).
 */
function getJsExportNames(): string[] {
  // The extracted root declarations type only the call signature, so the
  // namespaces are read through a loose shape (the test compares runtime
  // keys, not types).
  const jsEntry = instantsearch as unknown as {
    widgets: Record<string, unknown>;
    templates: Record<string, unknown>;
  };
  return [
    ...Object.keys(jsEntry.widgets),
    ...Object.keys(jsEntry.templates),
    // The entry point itself (`instantsearch()`), plus what it carries.
    'instantsearch',
    'version',
    ...Object.keys(jsChat).filter((name) => name !== 'default'),
  ];
}

/** React exports hooks (`useSearchBox`, …) that only exist in its headless layer. */
function getReactExportNames(): string[] {
  return Object.keys(reactExports).filter((name) => !name.startsWith('use'));
}

/**
 * Vue exports its widgets as `Ais*` components plus a few shared factories
 * (`createComparisonTableTool`); the mixin/server helpers are framework glue.
 */
const VUE_FRAMEWORK_GLUE = [
  'createSuitMixin',
  'createWidgetMixin',
  'createServerRootMixin',
];

function getVueExportNames(): string[] {
  return Object.keys(getVueExports()).filter(
    (name) =>
      (name.startsWith('Ais') || name.startsWith('create')) &&
      !VUE_FRAMEWORK_GLUE.includes(name)
  );
}

/**
 * Normalizes an export name to its widget identity: `chat`, `Chat` and
 * `AisChat` all become `chat`.
 */
function normalize(name: string): string {
  return name.replace(/^Ais/, '').toLowerCase();
}

/**
 * Intentional differences only. Every entry is a widget (normalized) name
 * mapped to the flavors that deliberately do not export it, with the reason.
 * Anything not listed here must be exported by all three flavors.
 */
const INTENTIONAL_DIFFERENCES: Record<string, string[]> = {
  // JS-only imperative widgets (canvas/map and slider need direct DOM control;
  // React and Vue compositions don't have a flavor wrapper yet).
  geosearch: ['react', 'vue'],
  rangeslider: ['react', 'vue'],

  // React's standalone text-highlighting widgets: in JS the highlighting is a
  // template helper (`highlight`/`html` tagged templates) rather than a
  // widget, and Vue ships `Highlight` and `Snippet` but not `ReverseHighlight`
  // (pre-existing gap, same template-helper story applies).
  highlight: ['javascript'],
  reversehighlight: ['javascript', 'vue'],
  snippet: ['javascript'],

  // React exposes these connectors as hooks in react-instantsearch-core
  // instead of composed widgets (Vue and JS ship widgets for them).
  menuselect: ['react'],
  numericmenu: ['react'],
  panel: ['react'],
  ratingmenu: ['react'],
  queryrulecontext: ['react'],
  queryrulecustomdata: ['react'],
  relevantsort: ['react'],
  voicesearch: ['react'],

  // Vue-only components: the experimental (preview-named) Autocomplete and
  // the `StateResults` helper.
  experimentalautocomplete: ['javascript', 'react'],
  stateresults: ['javascript', 'react'],

  // SSR / server plumbing, which lives in a different entry point per flavor:
  // React exports its provider/context/server-state helpers from the root;
  // Vue has the dedicated `AisInstantSearchSsr`; JS does SSR through its
  // `instantsearch.js/es/server` entry rather than the root object.
  instantsearchssrprovider: ['javascript', 'vue'],
  instantsearchservercontext: ['javascript', 'vue'],
  instantsearchssrcontext: ['javascript', 'vue'],
  instantsearchrsccontext: ['javascript', 'vue'],
  getserverstate: ['javascript', 'vue'],
  wrappromisewithstate: ['javascript', 'vue'],
  instantsearchssr: ['javascript', 'react'],

  // React re-exports the chat tool-type constants from its root and JS from
  // its chat widget module; in Vue they come from `instantsearch-core`.
  // React also exports its `createDefaultTools` factory from the root — in
  // the other flavors the default tool sets are wired inside the chat widget.
  searchindextooltype: ['vue'],
  recommendtooltype: ['vue'],
  memorizetooltype: ['javascript', 'vue'],
  memorysearchtooltype: ['javascript', 'vue'],
  pondertooltype: ['javascript', 'vue'],
  compareproductstooltype: ['vue'],
  groupedresultstooltype: ['vue'],
  createdefaulttools: ['javascript', 'vue'],

  // The version string: JS exposes `instantsearch.version`, React exports
  // `version`; Vue relies on its package version.
  version: ['vue'],
};

describe('export parity across flavors', () => {
  const surfaces = {
    javascript: new Set(getJsExportNames().map(normalize)),
    react: new Set(getReactExportNames().map(normalize)),
    vue: new Set(getVueExportNames().map(normalize)),
  };

  const flavors = Object.keys(surfaces) as Array<keyof typeof surfaces>;

  const union = new Set<string>(
    [...surfaces.javascript, ...surfaces.react, ...surfaces.vue].sort()
  );

  test('every flavor exports the same shared widgets (modulo intentional differences)', () => {
    const missing: string[] = [];

    union.forEach((name) => {
      const allowed = INTENTIONAL_DIFFERENCES[name] ?? [];
      flavors.forEach((flavor) => {
        if (!surfaces[flavor].has(name) && !allowed.includes(flavor)) {
          missing.push(`${flavor}: ${name}`);
        }
      });
    });

    expect(missing).toEqual([]);
  });

  test('the chat family is exported by all three flavors', () => {
    // The family this test was written for, called out explicitly so it is
    // not buried in the union: the widgets, the layouts, and the shared tool
    // factory.
    const chatFamily = [
      'chat',
      'chattrigger',
      'chatgreeting',
      'chatmessageloader',
      'chatoverlaylayout',
      'chatinlinelayout',
      'chatsidepanellayout',
      'promptsuggestions',
      'createcomparisontabletool',
    ];

    const missing: string[] = [];
    chatFamily.forEach((name) => {
      flavors.forEach((flavor) => {
        if (!surfaces[flavor].has(name)) {
          missing.push(`${flavor}: ${name}`);
        }
      });
    });

    expect(missing).toEqual([]);
  });
});
