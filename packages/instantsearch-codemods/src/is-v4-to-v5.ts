/* eslint-disable @typescript-eslint/no-explicit-any */
import addWidgetToAddWidgets from './addWidget-to-addWidgets';

import type { API, Collection, FileInfo, Options } from 'jscodeshift';

// `tsx` is a superset of what the other parsers accept (JS, JSX, TS, TSX).
export const parser = 'tsx';

/** Identifiers that are renamed one-to-one, whatever the flavor. */
const IDENTIFIER_RENAMES: Record<string, string> = {
  EXPERIMENTAL_autocomplete: 'autocomplete',
  EXPERIMENTAL_Autocomplete: 'Autocomplete',
  EXPERIMENTAL_dynamicWidgets: 'dynamicWidgets',
  EXPERIMENTAL_DynamicWidgets: 'DynamicWidgets',
  EXPERIMENTAL_use: 'use',
  EXPERIMENTAL_isolated: 'isolated',
  // Vue InstantSearch
  AisExperimentalAutocomplete: 'AisAutocomplete',
  getWidgetState: 'getWidgetUiState',
  hasMapMoveSinceLastRefine: 'hasMapMovedSinceLastRefine',
  // helper methods
  addDisjunctiveRefine: 'addDisjunctiveFacetRefinement',
  removeDisjunctiveRefine: 'removeDisjunctiveFacetRefinement',
  addRefine: 'addFacetRefinement',
  removeRefine: 'removeFacetRefinement',
  addExclude: 'addFacetExclusion',
  removeExclude: 'removeFacetExclusion',
  toggleExclude: 'toggleFacetExclusion',
  toggleRefine: 'toggleFacetRefinement',
};

/** Namespaces of the v4 `instantsearch` default export, now named exports of the root. */
const NAMESPACES = [
  'widgets',
  'connectors',
  'middlewares',
  'routers',
  'stateMappings',
  'templates',
];

/** Properties of the v4 `instantsearch` default export, now named exports of the root. */
const TOP_LEVEL_EXPORTS = ['version', 'createInfiniteHitsSessionStorageCache'];

/** Router and state mapping exports renamed in v5, by namespace. */
const RENAMED_EXPORTS: Record<string, Record<string, string>> = {
  routers: { history: 'historyRouter' },
  stateMappings: {
    simple: 'simpleStateMapping',
    singleIndex: 'singleIndexStateMapping',
  },
};

/** v4 deep import paths (relative to `instantsearch.js/es`) and the name of their default export. */
const DEEP_DEFAULT_EXPORTS: Record<string, string> = {
  '': 'instantsearch',
  'lib/main': 'instantsearch',
  'lib/routers/history': 'historyRouter',
  'lib/stateMappings/simple': 'simpleStateMapping',
  'lib/stateMappings/singleIndex': 'singleIndexStateMapping',
  'lib/infiniteHitsCache/sessionStorage':
    'createInfiniteHitsSessionStorageCache',
};

/** Deep import paths only `instantsearch.js` exports: React and Vue don't depend on it anymore. */
const JS_ONLY_PATHS = /^(widgets|templates|helpers\/components)(\/|$)/;

/** Deep import paths of internal modules, which have no public equivalent to point to. */
const INTERNAL_PATHS =
  /^lib\/(?!(routers|stateMappings|infiniteHitsCache|server|main)(\/|$))/;

/** Exports that no longer exist in v5. */
const REMOVED_EXPORTS =
  /^(places|answers|analytics|filterSuggestions|connectAnswers|connectFilterSuggestions|useFilterSuggestions|FilterSuggestions|EXPERIMENTAL_[cC]onfigureRelatedItems|connectConfigureRelatedItems|DisplayResultsToolType|ChatEmptyProps|getInsightsAnonymousUserToken|highlight|snippet|reverseHighlight|reverseSnippet|insights)$/;

const highlightWorkaround = (name: string, component: string) =>
  `\`${name}\` is removed, use \`components.${component}\` in templates instead (\`components\` is in the second argument of the template function).`;

/**
 * Removed exports whose replacement is specific enough to spell out, rather
 * than pointing at the migration guide. Also matched on `instantsearch.<name>`,
 * which used to be the way to reach them. Lines after the first are printed as
 * plain comment lines, so a workaround can read as a list of options.
 */
const REMOVED_EXPORT_WORKAROUNDS: Record<string, string> = {
  getInsightsAnonymousUserToken: [
    '`getInsightsAnonymousUserToken` is removed. What to do depends on what you did with the token:',
    '- to get the token onto your searches: delete the call, `createInsightsMiddleware` already sends it as the `userToken` search parameter;',
    '- to use the value in your own code (send it to your API, log it, etc.): read it from the insights client, which now owns it: `aa("getUserToken", null, (err, userToken) => { ... })`;',
    '- to get it on the server (SSR), where there is no insights client: read the `_ALGOLIA` cookie (insights only writes it when initialized with `useCookie: true`) and pass it as `userToken` yourself.',
  ].join('\n'),
  highlight: highlightWorkaround('highlight', 'Highlight'),
  snippet: highlightWorkaround('snippet', 'Snippet'),
  reverseHighlight: highlightWorkaround('reverseHighlight', 'ReverseHighlight'),
  reverseSnippet: highlightWorkaround('reverseSnippet', 'ReverseSnippet'),
};

const REMOVED_WIDGETS = ['places', 'answers', 'analytics', 'filterSuggestions'];

/**
 * Connectors that dropped `hasNoResults` in favor of `canRefine`. The Stats
 * template data still has `hasNoResults` (`nbHits === 0`), so it is left alone.
 */
const HAS_NO_RESULTS_CONNECTORS =
  /(HitsPerPage|NumericMenu|RatingMenu|hitsPerPage|numericMenu|ratingMenu)/;

const todo = (text: string) => `TODO(instantsearch v5): ${text}`;

export default function transform(
  file: FileInfo,
  api: API,
  options: Options
): string | undefined {
  const { jscodeshift: j } = api;
  const printOptions = options.printOptions || { quote: 'single' };

  // Only touch files that look like they use InstantSearch.
  if (!/instantsearch|algoliasearch/i.test(file.source)) {
    return undefined;
  }

  // addWidget/removeWidget -> addWidgets/removeWidgets
  const root = j(addWidgetToAddWidgets(file, api, options));

  const addComment = (node: any, text: string) => {
    // Only the first line carries the `TODO` prefix, the rest read as its body.
    const values = text
      .split('\n')
      .map((line, index) => (index === 0 ? ` ${todo(line)}` : ` ${line}`));
    const comments = node.comments || [];
    if (comments.some((c: any) => c.value === values[0])) {
      return;
    }
    node.comments = [
      ...comments,
      ...values.map((value) => j.commentLine(value, true, false)),
    ];
  };

  const enclosingStatement = (path: any) => {
    let current = path;
    while (
      current &&
      !(j.Statement.check(current.node) || j.Declaration.check(current.node))
    ) {
      current = current.parent;
    }
    return current ? current.node : path.node;
  };

  const isInstantSearchSource = (value: unknown) =>
    typeof value === 'string' && /instantsearch/i.test(value);

  const propertyName = (node: any): string | undefined => {
    const key = node.key;
    if (!key || node.computed) return undefined;
    return key.type === 'Identifier' ? key.name : key.value;
  };

  /** Finds object properties (`Property` or `ObjectProperty`, depending on the parser). */
  const findProperties = (collection: Collection<any>, name: string) =>
    [
      ...collection.find(j.ObjectProperty).paths(),
      ...collection.find(j.Property).paths(),
      ...collection.find(j.ObjectMethod).paths(),
    ].filter((path: any) => propertyName(path.node) === name);

  const importSpecifier = (imported: string, local: string) =>
    imported === local
      ? j.importSpecifier(j.identifier(imported))
      : j.importSpecifier(j.identifier(imported), j.identifier(local));

  /** Names are `imported` or `[imported, local]`. */
  const addNamedImport = (
    names: Array<string | [string, string]>,
    source: string
  ) => {
    const existing = root
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.source.value === source && path.node.importKind !== 'type'
      );
    const declared = new Set<string>();
    root.find(j.ImportSpecifier).forEach((path) => {
      declared.add((path.node.local || path.node.imported).name);
    });
    const pairs = names.map((name) =>
      typeof name === 'string' ? [name, name] : name
    );
    const missing = pairs.filter(
      ([, local], index) =>
        !declared.has(local) &&
        pairs.findIndex((pair) => pair[1] === local) === index
    );
    if (missing.length === 0) return;
    const specifiers = missing.map(([imported, local]) =>
      importSpecifier(imported, local)
    );

    if (existing.size() > 0) {
      const node = existing.paths()[0].node;
      node.specifiers = [...(node.specifiers || []), ...specifiers];
      return;
    }
    const declaration = j.importDeclaration(specifiers, j.literal(source));
    const imports = root.find(j.ImportDeclaration);
    if (imports.size() > 0) {
      imports.at(imports.size() - 1).insertAfter(declaration);
    } else {
      root.get().node.program.body.unshift(declaration);
    }
  };

  // ---------------------------------------------------------------------------
  // 0. Vue: the old renderless `AisAutocomplete` is gone. The name now belongs
  // to the former `AisExperimentalAutocomplete`, so this has to run before the
  // rename below, and a plain rename can't be applied to it.
  // ---------------------------------------------------------------------------
  // When a file imports both, renaming would create two `AisAutocomplete`
  // bindings. Keep the local name of the experimental one by aliasing the
  // import instead, so no usage has to be rewritten.
  let keepExperimentalAutocompleteName = false;
  root
    .find(j.ImportDeclaration)
    .filter((path) => /vue-instantsearch/.test(String(path.node.source.value)))
    .forEach((path) => {
      const specifiers: any[] = path.node.specifiers || [];
      const importsOld = specifiers.some(
        (specifier) =>
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.name === 'AisAutocomplete'
      );
      specifiers.forEach((specifier) => {
        if (
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.name === 'AisAutocomplete'
        ) {
          addComment(
            path.node,
            '`AisAutocomplete` (`<ais-autocomplete>`) is now the full autocomplete UI, formerly `AisExperimentalAutocomplete`. The renderless slot wrapper (`refine`, `currentRefinement`, `indices`) was removed: build it with `connectAutocomplete` and `createWidgetMixin` instead. If you meant the new component, there is nothing to change.'
          );
        }
        if (
          importsOld &&
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.name === 'AisExperimentalAutocomplete' &&
          (!specifier.local ||
            specifier.local.name === 'AisExperimentalAutocomplete')
        ) {
          path.node.specifiers![path.node.specifiers!.indexOf(specifier)] =
            j.importSpecifier(
              j.identifier('AisAutocomplete'),
              j.identifier('AisExperimentalAutocomplete')
            );
          keepExperimentalAutocompleteName = true;
        }
      });
    });

  // ---------------------------------------------------------------------------
  // 1. One-to-one renames
  // ---------------------------------------------------------------------------
  const rename = (collection: Collection<any>) =>
    collection
      .filter(
        (path: any) =>
          path.node.name in IDENTIFIER_RENAMES &&
          !(
            keepExperimentalAutocompleteName &&
            path.node.name === 'AisExperimentalAutocomplete'
          )
      )
      .forEach((path: any) => {
        path.node.name = IDENTIFIER_RENAMES[path.node.name];
      });
  rename(root.find(j.Identifier));
  rename(root.find(j.JSXIdentifier));

  // `hasRefinements` is only renamed in connector render state (to
  // `canRefine`). The helper method was removed and has no direct replacement.
  const isHelperCall = (path: any) =>
    path.parent.node.type === 'MemberExpression' &&
    path.parent.node.property === path.node &&
    !path.parent.node.computed &&
    path.parent.parent.node.type === 'CallExpression' &&
    path.parent.parent.node.callee === path.parent.node;
  root.find(j.Identifier, { name: 'hasRefinements' }).forEach((path: any) => {
    if (isHelperCall(path)) {
      addComment(
        enclosingStatement(path),
        '`helper.hasRefinements` was removed, use `helper.state.isFacetRefined`, `isDisjunctiveFacetRefined`, `isHierarchicalFacetRefined`, `isExcludeRefined` or `isNumericRefined` instead.'
      );
    } else {
      path.node.name = 'canRefine';
    }
  });

  // ---------------------------------------------------------------------------
  // 2. hasNoResults -> !canRefine (the meaning is inverted, so no plain rename)
  // ---------------------------------------------------------------------------
  if (HAS_NO_RESULTS_CONNECTORS.test(file.source)) {
    root
      .find(j.MemberExpression, {
        property: { type: 'Identifier', name: 'hasNoResults' },
        computed: false,
      })
      .forEach((path) => {
        const canRefine = j.memberExpression(
          path.node.object,
          j.identifier('canRefine')
        );
        const parent: any = path.parent.node;
        if (parent.type === 'UnaryExpression' && parent.operator === '!') {
          j(path.parent).replaceWith(canRefine);
        } else {
          j(path).replaceWith(j.unaryExpression('!', canRefine));
        }
      });
    findProperties(root.find(j.ObjectPattern), 'hasNoResults').forEach(
      (path) => {
        addComment(
          path.node,
          '`hasNoResults` is replaced by `canRefine`, which has the opposite meaning (`hasNoResults === !canRefine`).'
        );
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 3. hits -> items for useHits / useInfiniteHits
  // ---------------------------------------------------------------------------
  root
    .find(j.VariableDeclarator)
    .filter((path) => {
      const init: any = path.node.init;
      return (
        path.node.id.type === 'ObjectPattern' &&
        init?.type === 'CallExpression' &&
        init.callee.type === 'Identifier' &&
        ['useHits', 'useInfiniteHits'].includes(init.callee.name)
      );
    })
    .forEach((path) => {
      findProperties(j(path.node.id as any), 'hits').forEach((prop: any) => {
        const local = prop.node.value;
        prop.node.key = j.identifier('items');
        prop.node.shorthand = false;
        prop.node.value = local;
      });
    });
  root
    .find(j.MemberExpression, {
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
      },
      property: { type: 'Identifier', name: 'hits' },
      computed: false,
    })
    .filter((path: any) =>
      ['useHits', 'useInfiniteHits'].includes(path.node.object.callee.name)
    )
    .forEach((path) => {
      (path.node.property as any).name = 'items';
    });

  // ---------------------------------------------------------------------------
  // 4. `Hits` type -> `Hit[]`
  // ---------------------------------------------------------------------------
  root
    .find(j.ImportDeclaration)
    .filter((path) => isInstantSearchSource(path.node.source.value))
    .forEach((path) => {
      const specifiers = path.node.specifiers || [];
      const hitsSpecifier = specifiers.find(
        (s: any) =>
          s.type === 'ImportSpecifier' &&
          s.imported.name === 'Hits' &&
          (!s.local || s.local.name === 'Hits')
      );
      if (hitsSpecifier) {
        const hasHit = specifiers.some(
          (s: any) => s.type === 'ImportSpecifier' && s.imported.name === 'Hit'
        );
        path.node.specifiers = hasHit
          ? specifiers.filter((s) => s !== hitsSpecifier)
          : specifiers.map((s) =>
              s === hitsSpecifier ? j.importSpecifier(j.identifier('Hit')) : s
            );
        root
          .find(j.TSTypeReference, { typeName: { name: 'Hits' } })
          .replaceWith(() =>
            j.tsArrayType(j.tsTypeReference(j.identifier('Hit')))
          );
      }
    });

  // ---------------------------------------------------------------------------
  // 5. Deep imports: `instantsearch.js` only exposes its root. React and Vue
  //    don't depend on it anymore, so they import from their own package.
  // ---------------------------------------------------------------------------
  const importSources = root
    .find(j.ImportDeclaration)
    .nodes()
    .map((node) => String(node.source.value));
  const flavorSource =
    importSources.find((s) => s === 'react-instantsearch') ||
    importSources.find((s) => s === 'react-instantsearch-core') ||
    importSources
      .find((s) => /^vue-instantsearch(\/|$)/.test(s))
      // The widgets-only entry only exports the `Ais*` components.
      ?.replace(/\/es\/src\/widgets\.js$/, '/es') ||
    'instantsearch.js';

  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      const value = String(path.node.source.value);
      return (
        /^instantsearch\.js\/(es|cjs)(\/|$)/.test(value) ||
        (value === 'instantsearch.js' && flavorSource !== 'instantsearch.js')
      );
    })
    .forEach((path) => {
      const deepPath = String(path.node.source.value)
        .replace(/^instantsearch\.js(\/(es|cjs))?\/?/, '')
        .replace(/\.js$/, '')
        .replace(/(^|\/)index$/, '');
      const renames = RENAMED_EXPORTS[deepPath.replace(/^lib\//, '')] || {};
      const basename = deepPath.split('/').pop() || '';
      const defaultName =
        DEEP_DEFAULT_EXPORTS[deepPath] ||
        (/^(widgets|connectors|middlewares)\//.test(deepPath)
          ? basename.replace(/-(\w)/g, (_, char) => char.toUpperCase())
          : undefined);
      const specifiers: any[] = path.node.specifiers || [];
      const source =
        JS_ONLY_PATHS.test(deepPath) ||
        (defaultName === 'instantsearch' &&
          specifiers.some((s) => s.type === 'ImportDefaultSpecifier'))
          ? 'instantsearch.js'
          : flavorSource;

      if (
        INTERNAL_PATHS.test(deepPath) ||
        (!defaultName &&
          specifiers.some((s) => s.type === 'ImportDefaultSpecifier'))
      ) {
        addComment(
          path.node,
          `\`instantsearch.js\` only exposes its root now, import this by name from \`${source}\` if it's still exported (internal modules are not).`
        );
        return;
      }
      // `routers.history()` -> `routers.historyRouter()`
      specifiers
        .filter((s) => s.type === 'ImportNamespaceSpecifier')
        .forEach((s) => {
          root
            .find(j.MemberExpression, {
              object: { type: 'Identifier', name: s.local.name },
              computed: false,
            })
            .filter((member: any) => member.node.property.name in renames)
            .forEach((member: any) => {
              member.node.property = j.identifier(
                renames[member.node.property.name]
              );
            });
        });
      path.node.specifiers = specifiers.map((s) => {
        if (s.type === 'ImportDefaultSpecifier') {
          return importSpecifier(defaultName!, s.local.name);
        }
        if (s.type === 'ImportSpecifier' && s.imported.name in renames) {
          return importSpecifier(
            renames[s.imported.name],
            (s.local || s.imported).name
          );
        }
        return s;
      });
      path.node.source = j.literal(source);
    });

  // ---------------------------------------------------------------------------
  // 6. The `instantsearch` default export is a named export without namespaces
  //    (the UMD build keeps them, so the global is left alone).
  // ---------------------------------------------------------------------------
  root
    .find(j.ImportDeclaration, { source: { value: 'instantsearch.js' } })
    .forEach((path) => {
      path.node.specifiers = (path.node.specifiers || []).map((s: any) =>
        s.type === 'ImportDefaultSpecifier'
          ? importSpecifier('instantsearch', s.local.name)
          : s
      );
    });
  const instantsearchLocal = root
    .find(j.ImportSpecifier, { imported: { name: 'instantsearch' } })
    .filter((path: any) => path.parent.node.source.value === 'instantsearch.js')
    .nodes()
    .map((node: any) => (node.local || node.imported).name)[0];

  if (instantsearchLocal) {
    const importsToAdd: Array<string | [string, string]> = [];
    const importedNames = new Set(
      root
        .find(j.ImportSpecifier)
        .filter((path: any) =>
          isInstantSearchSource(path.parent.node.source.value)
        )
        .nodes()
        .map((node: any) => (node.local || node.imported).name)
    );
    const usedNames = new Set(
      root
        .find(j.Identifier)
        .filter((path: any) => {
          const parent = path.parent.node;
          return !(
            (j.MemberExpression.check(parent) &&
              parent.property === path.node &&
              !parent.computed) ||
            ((parent.type === 'Property' || parent.type === 'ObjectProperty') &&
              parent.key === path.node &&
              !parent.shorthand)
          );
        })
        .nodes()
        .map((node) => node.name)
        .filter((name) => !importedNames.has(name))
    );
    const isNamespace = (node: any) =>
      Boolean(node) &&
      node.type === 'MemberExpression' &&
      !node.computed &&
      node.object.type === 'Identifier' &&
      node.object.name === instantsearchLocal &&
      NAMESPACES.includes(node.property.name);
    const exportName = (namespace: string, name: string) =>
      (RENAMED_EXPORTS[namespace] || {})[name] || name;

    // `instantsearch.widgets.searchBox` -> `searchBox`
    root
      .find(j.MemberExpression, { computed: false })
      .filter((path: any) => isNamespace(path.node.object))
      .forEach((path: any) => {
        const name = exportName(
          path.node.object.property.name,
          path.node.property.name
        );
        // Left for the TODO below, to not shadow a local binding.
        if (usedNames.has(name)) return;
        importsToAdd.push(name);
        j(path).replaceWith(j.identifier(name));
      });

    // `const { searchBox } = instantsearch.widgets` -> `import { searchBox }`.
    // Only at the module level: imports can't keep the scope of a function.
    root
      .find(j.VariableDeclarator)
      .filter(
        (path: any) =>
          path.parent.parent.node.type === 'Program' &&
          path.node.id.type === 'ObjectPattern' &&
          isNamespace(path.node.init) &&
          path.node.id.properties.every(
            (prop: any) =>
              (prop.type === 'Property' || prop.type === 'ObjectProperty') &&
              propertyName(prop) &&
              prop.value.type === 'Identifier'
          )
      )
      .forEach((path: any) => {
        path.node.id.properties.forEach((prop: any) =>
          importsToAdd.push([
            exportName(path.node.init.property.name, propertyName(prop)!),
            prop.value.name,
          ])
        );
        j(path).remove();
      });

    // `instantsearch.version` -> `version`
    root
      .find(j.MemberExpression, {
        object: { type: 'Identifier', name: instantsearchLocal },
        computed: false,
      })
      .filter((path: any) =>
        TOP_LEVEL_EXPORTS.includes(path.node.property.name)
      )
      .forEach((path: any) => {
        const name = path.node.property.name;
        if (usedNames.has(name)) {
          addComment(
            enclosingStatement(path),
            `\`${instantsearchLocal}.${name}\` is removed, import \`${name}\` by name from \`instantsearch.js\` (the name is already taken in this file).`
          );
          return;
        }
        importsToAdd.push(name);
        j(path).replaceWith(j.identifier(name));
      });

    root
      .find(j.MemberExpression)
      .filter((path: any) => isNamespace(path.node))
      .forEach((path: any) => {
        addComment(
          enclosingStatement(path),
          `\`${instantsearchLocal}.${path.node.property.name}\` is removed, import its exports by name from \`instantsearch.js\`.`
        );
      });

    addNamedImport(importsToAdd, 'instantsearch.js');
  }

  // Merge the imports that now share a source.
  const mergeableImports: Record<string, any> = {};
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      const specifiers = path.node.specifiers || [];
      return (
        isInstantSearchSource(path.node.source.value) &&
        specifiers.length > 0 &&
        specifiers.every((s) => s.type === 'ImportSpecifier')
      );
    })
    .forEach((path) => {
      const key = `${path.node.importKind} ${path.node.source.value}`;
      const first = mergeableImports[key];
      if (!first) {
        mergeableImports[key] = path.node;
        return;
      }
      first.specifiers = [
        ...first.specifiers,
        ...(path.node.specifiers || []).filter(
          (s: any) =>
            !first.specifiers.some(
              (f: any) =>
                (f.local || f.imported).name === (s.local || s.imported).name
            )
        ),
      ];
      first.comments = [
        ...(first.comments || []),
        ...(path.node.comments || []),
      ];
      j(path).remove();
    });

  root
    .find(j.MemberExpression, {
      object: { type: 'Identifier', name: 'instantsearch' },
      property: { type: 'Identifier', name: 'insights' },
      computed: false,
    })
    .forEach((path) => {
      addComment(
        enclosingStatement(path),
        '`instantsearch.insights` is removed, use `createInsightsMiddleware` and `instantSearchInstance.use(...)`.'
      );
    });
  // …and the helpers that used to hang off it, which no longer have an import
  // to point at either.
  Object.keys(REMOVED_EXPORT_WORKAROUNDS).forEach((name) => {
    root
      .find(j.MemberExpression, {
        object: { type: 'Identifier', name: 'instantsearch' },
        property: { type: 'Identifier', name },
        computed: false,
      })
      .forEach((path) => {
        addComment(enclosingStatement(path), REMOVED_EXPORT_WORKAROUNDS[name]);
      });
  });

  // ---------------------------------------------------------------------------
  // 7. History router: getLocation -> getCurrentURL, location -> currentURL,
  //    and keep the v4 default of `cleanUrlOnDispose`
  // ---------------------------------------------------------------------------
  findProperties(root, 'getLocation').forEach((path: any) => {
    path.node.key.name = 'getCurrentURL';
    addComment(
      path.node,
      '`getCurrentURL` must return a `URL` instead of a `Location` (e.g. `new URL(href)`).'
    );
  });
  // custom routers: createURL({ location }) / parseURL({ location })
  const renameLocationParam = (fn: any) => {
    const param = fn.params && fn.params[0];
    if (!param || param.type !== 'ObjectPattern') return;
    const locationProp = param.properties.find(
      (prop: any) =>
        (prop.type === 'Property' || prop.type === 'ObjectProperty') &&
        propertyName(prop) === 'location'
    );
    if (!locationProp) return;
    const local = locationProp.value;
    const localName =
      local.type === 'AssignmentPattern' ? local.left.name : local.name;
    if (localName !== 'location') {
      // aliased: only the key changes
      locationProp.key = j.identifier('currentURL');
      return;
    }
    j(fn)
      .find(j.Identifier, { name: 'location' })
      .filter((p: any) => {
        const parent = p.parent.node;
        // skip `foo.location`
        return !(
          parent.type === 'MemberExpression' &&
          parent.property === p.node &&
          !parent.computed
        );
      })
      .forEach((p: any) => {
        p.node.name = 'currentURL';
      });
  };
  ['createURL', 'parseURL'].forEach((name) => {
    findProperties(root, name).forEach((path: any) => {
      const fn =
        path.node.type === 'ObjectMethod' ? path.node : path.node.value;
      if (
        fn &&
        [
          'ObjectMethod',
          'FunctionExpression',
          'ArrowFunctionExpression',
        ].includes(fn.type)
      ) {
        renameLocationParam(fn);
      }
    });
  });

  // Local names of the history router, aliased or not.
  const historyRouterLocals = new Set<string>();
  root
    .find(j.ImportDeclaration)
    .filter((path) => isInstantSearchSource(path.node.source.value))
    .forEach((path) => {
      (path.node.specifiers || []).forEach((s: any) => {
        if (
          s.type === 'ImportSpecifier' &&
          ['history', 'historyRouter'].includes(s.imported.name)
        ) {
          historyRouterLocals.add((s.local || s.imported).name);
        }
      });
    });

  const cleanUrlProperty = () => {
    const property = j.objectProperty(
      j.identifier('cleanUrlOnDispose'),
      j.booleanLiteral(true)
    );
    addComment(
      property,
      'the default of `cleanUrlOnDispose` is now `false`. This keeps the v4 behavior; remove it to adopt the new default.'
    );
    return property;
  };

  const isHistoryCall = (callee: any) => {
    if (callee.type === 'Identifier') {
      return historyRouterLocals.has(callee.name);
    }
    return (
      callee.type === 'MemberExpression' &&
      !callee.computed &&
      ['history', 'historyRouter'].includes(callee.property.name) &&
      ((callee.object.type === 'Identifier' &&
        callee.object.name === 'routers') ||
        (callee.object.type === 'MemberExpression' &&
          callee.object.property.name === 'routers'))
    );
  };

  root
    .find(j.CallExpression)
    .filter((path) => isHistoryCall(path.node.callee))
    .forEach((path) => {
      const [first] = path.node.arguments as any[];
      if (!first) {
        path.node.arguments = [j.objectExpression([cleanUrlProperty()])];
      } else if (
        first.type === 'ObjectExpression' &&
        !first.properties.some(
          (prop: any) => propertyName(prop) === 'cleanUrlOnDispose'
        )
      ) {
        first.properties.push(cleanUrlProperty());
      }
    });

  // createInstantSearchRouterNext({ routerOptions })
  root
    .find(j.CallExpression, {
      callee: { type: 'Identifier', name: 'createInstantSearchRouterNext' },
    })
    .forEach((path) => {
      const [first] = path.node.arguments as any[];
      if (!first) {
        path.node.arguments = [
          j.objectExpression([
            j.objectProperty(
              j.identifier('routerOptions'),
              j.objectExpression([cleanUrlProperty()])
            ),
          ]),
        ];
        return;
      }
      if (first.type !== 'ObjectExpression') return;
      const routerOptions = first.properties.find(
        (prop: any) => propertyName(prop) === 'routerOptions'
      );
      if (!routerOptions) {
        first.properties.push(
          j.objectProperty(
            j.identifier('routerOptions'),
            j.objectExpression([cleanUrlProperty()])
          )
        );
      } else if (
        routerOptions.value.type === 'ObjectExpression' &&
        !routerOptions.value.properties.some(
          (prop: any) => propertyName(prop) === 'cleanUrlOnDispose'
        )
      ) {
        routerOptions.value.properties.push(cleanUrlProperty());
      }
    });

  // `routing: true` / `routing` with no router uses the default history router
  const routingMessage =
    'the default history router no longer cleans the URL on dispose. Pass `router: historyRouter({ cleanUrlOnDispose: true })` to keep the v4 behavior.';
  findProperties(root, 'routing').forEach((path: any) => {
    if (path.node.value.type === 'BooleanLiteral' && path.node.value.value) {
      addComment(path.node, routingMessage);
    }
  });
  root
    .find(j.JSXAttribute, { name: { name: 'routing' } })
    .forEach((path: any) => {
      const value = path.node.value;
      // `routing` or `routing={true}`
      if (
        value === null ||
        (value.type === 'JSXExpressionContainer' &&
          value.expression.type === 'BooleanLiteral' &&
          value.expression.value)
      ) {
        addComment(enclosingStatement(path), routingMessage);
      }
    });

  // ---------------------------------------------------------------------------
  // 8. __hitIndex -> __position - 1 in hits / infiniteHits item templates
  //    (`__position` starts at 1, so no plain rename)
  // ---------------------------------------------------------------------------
  root
    .find(j.MemberExpression)
    .filter(
      (path: any) =>
        // In an optional chain, `- 1` would turn a missing hit into `NaN`.
        path.node.type !== 'OptionalMemberExpression' &&
        !path.node.optional &&
        (path.node.computed
          ? j.Literal.check(path.node.property) &&
            path.node.property.value === '__hitIndex'
          : path.node.property.name === '__hitIndex')
    )
    .forEach((path: any) => {
      path.node.property = path.node.computed
        ? j.stringLiteral('__position')
        : j.identifier('__position');
      const parent = path.parent.node;
      if (
        parent.type === 'BinaryExpression' &&
        parent.operator === '+' &&
        parent.left === path.node &&
        j.NumericLiteral.check(parent.right) &&
        parent.right.value === 1
      ) {
        j(path.parent).replaceWith(path.node);
      } else {
        j(path).replaceWith(
          j.binaryExpression('-', path.node, j.numericLiteral(1))
        );
      }
    });
  // What is left can't be rewritten in place (destructuring, keys, types,
  // optional chains).
  [
    ...root.find(j.Identifier, { name: '__hitIndex' }).paths(),
    ...root
      .find(j.Literal)
      .filter((path: any) => path.node.value === '__hitIndex')
      .paths(),
  ].forEach((path) => {
    addComment(
      enclosingStatement(path),
      '`__hitIndex` is removed from the `hits` and `infiniteHits` item templates, use `__position - 1` instead (`__position` is the position across pages, starting at 1).'
    );
  });

  // ---------------------------------------------------------------------------
  // 9. Things that need a human: leave a TODO
  // ---------------------------------------------------------------------------
  // searchFunction -> onStateChange
  findProperties(root, 'searchFunction').forEach((path: any) => {
    addComment(
      path.node,
      '`searchFunction` is removed, use `onStateChange` (it receives `{ uiState, setUiState }` instead of the helper).'
    );
  });
  root
    .find(j.JSXAttribute, { name: { name: 'searchFunction' } })
    .forEach((path: any) => {
      addComment(
        enclosingStatement(path),
        '`searchFunction` is removed, use `onStateChange` (it receives `{ uiState, setUiState }` instead of the helper).'
      );
    });

  // isSearchStalled / searchMetadata
  root
    .find(j.Identifier)
    .filter((path: any) =>
      ['isSearchStalled', '_isSearchStalled', 'searchMetadata'].includes(
        path.node.name
      )
    )
    .forEach((path) => {
      addComment(
        enclosingStatement(path),
        `\`${path.node.name}\` is removed, use \`status === 'stalled'\` (\`useInstantSearch().status\` in React).`
      );
    });

  // escapeHTML / escapeFacetValues
  ['escapeHTML', 'escapeFacetValues'].forEach((name) =>
    findProperties(root, name).forEach((path: any) =>
      addComment(
        path.node,
        `\`${name}\` is removed: highlighted values are not escaped by the connectors anymore, and the \`Highlight\`/\`Snippet\` components escape their own output.`
      )
    )
  );

  // range `start` -> `currentRefinement`
  root
    .find(j.VariableDeclarator)
    .filter((path) => {
      const init: any = path.node.init;
      return (
        path.node.id.type === 'ObjectPattern' &&
        init?.type === 'CallExpression' &&
        init.callee.type === 'Identifier' &&
        init.callee.name === 'useRange'
      );
    })
    .forEach((path) => {
      findProperties(j(path.node.id as any), 'start').forEach((prop: any) =>
        addComment(
          prop.node,
          '`start` is replaced by `currentRefinement`, an object `{ min, max }` (unset values are `undefined` instead of `-Infinity`/`Infinity`), and `refine` takes `{ min, max }`.'
        )
      );
    });

  // removed exports (widgets, connectors, types)
  root
    .find(j.ImportDeclaration)
    .filter((path) => isInstantSearchSource(path.node.source.value))
    .forEach((path) => {
      const removed = (path.node.specifiers || []).filter(
        (s: any) =>
          s.type === 'ImportSpecifier' && REMOVED_EXPORTS.test(s.imported.name)
      );
      const generic = removed.filter(
        (s: any) => !(s.imported.name in REMOVED_EXPORT_WORKAROUNDS)
      );
      if (generic.length > 0) {
        addComment(
          path.node,
          `${generic
            .map((s: any) => `\`${s.imported.name}\``)
            .join(', ')} no longer exist${
            generic.length === 1 ? 's' : ''
          } in v5, see the migration guide.`
        );
      }
      removed
        .filter((s: any) => s.imported.name in REMOVED_EXPORT_WORKAROUNDS)
        .forEach((s: any) =>
          addComment(path.node, REMOVED_EXPORT_WORKAROUNDS[s.imported.name])
        );
    });
  root
    .find(j.MemberExpression, {
      object: { type: 'MemberExpression', property: { name: 'widgets' } },
      computed: false,
    })
    .filter((path: any) => REMOVED_WIDGETS.includes(path.node.property.name))
    .forEach((path: any) => {
      addComment(
        enclosingStatement(path),
        `\`widgets.${path.node.property.name}\` no longer exists in v5, see the migration guide.`
      );
    });

  return root.toSource(printOptions);
}
