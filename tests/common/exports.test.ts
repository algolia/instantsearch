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

import * as jsExports from 'instantsearch.js';
import * as reactExports from 'react-instantsearch';

// Loaded with `require` on purpose (same rationale as
// `tests/common/widgets/chat/utils.ts`): importing `vue-instantsearch` would
// pull Vue's type declarations into this compilation, and Vue 2's augment the
// global `JSX` namespace, breaking React JSX across the shared tests.
function getVueExports(): Record<string, unknown> {
  return require('../../packages/vue-instantsearch/src/instantsearch.js');
}

/** Module keys, minus the interop markers a transpiled module can add. */
function exportNames(moduleExports: object): string[] {
  return Object.keys(moduleExports).filter(
    (name) => name !== 'default' && name !== '__esModule'
  );
}

/**
 * The JS root entry is a flat set of named exports (the `instantsearch` object
 * carrying `widgets`/`templates` namespaces is the UMD build, which users can't
 * import), so the JS surface is the root module's own keys. The root is also the
 * only importable entry: `instantsearch.js/es/…` is off-limits (oxlint), and the
 * built ESM output can't be loaded from these tests anyway.
 */
function getJsExportNames(): string[] {
  return exportNames(jsExports);
}

/** React exports hooks (`useSearchBox`, …) that only exist in its headless layer. */
function getReactExportNames(): string[] {
  return exportNames(reactExports).filter((name) => !name.startsWith('use'));
}

/**
 * Vue's entry is `export * from 'instantsearch-core'` plus its `Ais*` widgets, so
 * it carries the same shared API as the other roots. Only the mixin/server
 * helpers it exists to provide are framework glue rather than shared surface.
 */
const VUE_FRAMEWORK_GLUE = [
  'createSuitMixin',
  'createWidgetMixin',
  'createServerRootMixin',
];

function getVueExportNames(): string[] {
  return exportNames(getVueExports()).filter(
    (name) => !VUE_FRAMEWORK_GLUE.includes(name)
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

  // JS's template helper for highlighting (`highlight` and the `html` tagged
  // template), which no other flavor exports under that name.
  highlight: ['javascript'],
  // Both closed by #7425 — Vue `ReverseHighlight`, React and Vue
  // `ReverseSnippet`. Drop these two lines once that lands.
  reversehighlight: ['javascript', 'vue'],
  reversesnippet: ['react', 'vue'],

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

  // The chat tool-type constants: React re-exports their values from its root,
  // while JS and Vue only carry the types (JS declares them on its chat widget
  // module, whose path isn't importable, and Vue takes them from
  // `instantsearch-core/internal`) — so nothing runtime shows up there.
  // React also exports its `createDefaultTools` factory from the root — in
  // the other flavors the default tool sets are wired inside the chat widget.
  searchindextooltype: ['javascript', 'vue'],
  recommendtooltype: ['javascript', 'vue'],
  memorizetooltype: ['javascript', 'vue'],
  memorysearchtooltype: ['javascript', 'vue'],
  pondertooltype: ['javascript', 'vue'],
  compareproductstooltype: ['javascript', 'vue'],
  groupedresultstooltype: ['javascript', 'vue'],
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
