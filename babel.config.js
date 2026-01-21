module.exports = (api) => {
  const clean = (x) => x.filter(Boolean);

  const env = api.env().split(',');

  const isTest = env.includes('test');
  const isCJS = env.includes('cjs');
  const isES = env.includes('es');
  const isUMD = env.includes('umd');
  const isRollup = env.includes('rollup');
  const isParcel = env.includes('parcel');

  const disableHoisting = env.includes('disableHoisting');

  const modules = isTest || isCJS ? 'commonjs' : false;
  const targets = {};

  if (isTest) {
    targets.node = true;
  } else {
    targets.browsers = ['last 2 versions', 'ie >= 9'];
  }

  const testPlugins = [
    '@babel/plugin-proposal-class-properties',
    './scripts/babel/wrap-warning-with-dev-check',
  ];

  const buildPlugins = clean([
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object',
    (isCJS || isES || isUMD || isRollup) &&
      !disableHoisting &&
      '@babel/plugin-transform-react-constant-elements',
    'babel-plugin-transform-react-pure-class-to-function',
    './scripts/babel/wrap-warning-with-dev-check',
    isRollup && 'babel-plugin-transform-react-remove-prop-types',
    (isCJS || isES || isParcel) && [
      'inline-replace-variables',
      {
        __DEV__: {
          type: 'node',
          replacement: "process.env.NODE_ENV === 'development'",
        },
      },
    ],
    isES && [
      './scripts/babel/extension-resolver',
      {
        // For verification, see test/module/packages-are-es-modules.mjs
        modulesToResolve: [
          // InstantSearch.js/es is an ES Module, so needs complete paths,
          'instantsearch.js',
          // React-DOM also fails if the paths are incomplete
          'react-dom',
          // `use-sync-external-store` also fails if the paths are incomplete
          'use-sync-external-store',
          // `next` imports as peer dependencies fail if paths are incomplete
          'next',
        ],
      },
    ],
    // this plugin is used to test if we need polyfills, not to actually insert them
    // only UMD, since cjs & esm have false positives due to imports
    isUMD && [
      'polyfill-es-shims',
      {
        method: 'usage-global',
        targets: {
          ie: 11,
        },
        shouldInjectPolyfill(name, defaultShouldInject) {
          const exclude = [
            // false positives (we access these from objects only)
            'Array.prototype.item',
            'String.prototype.item',
            'Array.prototype.values',
            'Function.prototype.name',

            // we require polyfills for this already
            'Array.prototype.includes',

            // Used only in newer widgets, which expect modern browsers
            'Object.fromEntries',
            'Object.entries',
            'Array.prototype.find',
            'String.prototype.startsWith',
            'Promise.prototype.finally',
            'Array.prototype.entries',
            'Array.prototype.findIndex',

            // false positive (babel doesn't know types)
            // this is actually only called on arrays
            'String.prototype.includes',

            // Used by newer widgets, we don't care about IE11 support
            'Promise.prototype.finally',

            // false positive (spread)
            'Object.getOwnPropertyDescriptors',
          ];
          if (defaultShouldInject && !exclude.includes(name)) {
            throw new Error(
              `Usage of a builtin which isn't allowed to be polyfilled: ${name}`
            );
          }
          return false;
        },
      },
    ],
  ]);

  return {
    presets: !isParcel
      ? [
          '@babel/preset-typescript',
          '@babel/preset-react',
          [
            '@babel/preset-env',
            {
              modules,
              targets,
            },
          ],
        ]
      : [],
    plugins: isTest ? testPlugins : buildPlugins,
    overrides: [
      {
        test: 'packages/react-*',
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: false,
              helpers: true,
              regenerator: false,
              useESModules: isES || isRollup,
            },
          ],
        ],
      },
      {
        test: 'packages/instantsearch-ui-components',
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: false,
              helpers: true,
              regenerator: false,
            },
          ],
        ],
      },
    ],
    // jsx is transpiled, so the comment should no longer be present in the final files
    shouldPrintComment: (value) => !value.startsWith('* @jsx'),
  };
};
