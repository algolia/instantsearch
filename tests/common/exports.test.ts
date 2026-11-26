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
 *
 * An entry is only allowed while the difference is real — closing a disparity
 * means deleting its line, which `findStaleDifferences` below enforces.
 */
const INTENTIONAL_DIFFERENCES: Record<string, string[]> = {
  // JS-only imperative widgets (canvas/map and slider need direct DOM control;
  // React and Vue compositions don't have a flavor wrapper yet).
  geosearch: ['react', 'vue'],
  rangeslider: ['react', 'vue'],

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

  // Vue-only component: the `StateResults` render-prop helper.
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

  // `createDefaultTools`: React exports the factory from its root, while the
  // other flavors wire their default tool sets inside the chat widget. (The
  // tool-type constants it returns are not a difference — they are `const`s in
  // `instantsearch-core`, so every flavor's root carries them.)
  createdefaulttools: ['javascript', 'vue'],

  // The version string: JS exposes `instantsearch.version`, React exports
  // `version`; Vue relies on its package version.
  version: ['vue'],
};

/**
 * The allowlist invariant, as a check instead of a comment.
 *
 * The parity test can only ever look at what a flavor is _missing_, so it stays
 * green when a listed difference is closed: the flavor gains the export, the
 * line goes stale without failing, and it then sits there hiding the next time
 * that flavor loses the export again (and it hides it better than nothing would,
 * because a stale line reads like a decision someone made). So an entry is
 * re-checked against the live surfaces: it may only name a flavor that
 * genuinely lacks the name, the name must still be exported by somebody, and
 * the flavor has to be a flavor.
 */
function findStaleDifferences(
  allowlist: Record<string, string[]>,
  surfaces: Record<string, Set<string>>
): string[] {
  const stale: string[] = [];
  const flavors = Object.keys(surfaces);

  Object.entries(allowlist).forEach(([name, allowed]) => {
    const carriers = flavors.filter((flavor) => surfaces[flavor].has(name));

    if (carriers.length === 0) {
      stale.push(`${name}: no flavor exports it any more`);
    }

    allowed.forEach((flavor) => {
      if (!surfaces[flavor]) {
        stale.push(`${name}: '${flavor}' is not a flavor`);
      } else if (surfaces[flavor].has(name)) {
        stale.push(
          `${name}: ${flavor} exports it (like ${carriers.join(
            ', '
          )}), so there is no difference to allowlist`
        );
      }
    });
  });

  return stale;
}

describe('the staleness check itself', () => {
  // Stand-in surfaces, so the guard is pinned down without editing the real
  // allowlist: `panel` is JS-only here, `stateresults` is Vue-only, and nothing
  // exports `experimentalautocomplete`.
  const surfaces = {
    javascript: new Set(['chat', 'panel']),
    react: new Set(['chat']),
    vue: new Set(['chat', 'stateresults']),
  };

  test('accepts a difference that is still real', () => {
    expect(
      findStaleDifferences(
        { stateresults: ['javascript', 'react'], panel: ['react', 'vue'] },
        surfaces
      )
    ).toEqual([]);
  });

  test('fails an entry whose flavor has gained the export', () => {
    expect(
      findStaleDifferences({ panel: ['react', 'javascript'] }, surfaces)
    ).toEqual([
      'panel: javascript exports it (like javascript), so there is no difference to allowlist',
    ]);
  });

  test('fails an entry for a name no flavor exports any more', () => {
    expect(
      findStaleDifferences(
        { experimentalautocomplete: ['javascript', 'react'] },
        surfaces
      )
    ).toEqual(['experimentalautocomplete: no flavor exports it any more']);
  });

  test('fails a flavor name that is not a flavor', () => {
    expect(findStaleDifferences({ chat: ['javscript'] }, surfaces)).toEqual([
      "chat: 'javscript' is not a flavor",
    ]);
  });
});

describe('export parity across flavors', () => {
  // `Record<string, …>` because the allowlist's flavor names are data: the
  // stale-entry check below looks them up and reports an unknown one.
  const surfaces: Record<string, Set<string>> = {
    javascript: new Set(getJsExportNames().map(normalize)),
    react: new Set(getReactExportNames().map(normalize)),
    vue: new Set(getVueExportNames().map(normalize)),
  };

  const flavors = Object.keys(surfaces);

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

  test('every allowlisted difference is still a real difference', () => {
    expect(findStaleDifferences(INTENTIONAL_DIFFERENCES, surfaces)).toEqual([]);
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
