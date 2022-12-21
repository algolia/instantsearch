const wrapWarningWithDevCheck = require('./scripts/babel/wrap-warning-with-dev-check');
const extensionResolver = require('./scripts/babel/extension-resolver');

const isCJS = process.env.BABEL_ENV === 'cjs';
const isES = process.env.BABEL_ENV === 'es';
const isUMD = process.env.BABEL_ENV === 'umd';
const isRollup = process.env.BABEL_ENV === 'rollup';
const isWebpack = process.env.BABEL_ENV === 'webpack';

const clean = (x) => x.filter(Boolean);

module.exports = (api) => {
  const isTest = api.env('test');
  const modules = isTest || isCJS ? 'commonjs' : false;
  const targets = {};

  if (isTest) {
    targets.node = true;
  } else {
    targets.browsers = ['last 2 versions', 'ie >= 9'];
  }

  const testPlugins = [
    '@babel/plugin-proposal-class-properties',
    wrapWarningWithDevCheck,
  ];

  const buildPlugins = clean([
    '@babel/plugin-proposal-class-properties',
    !isWebpack && '@babel/plugin-transform-react-constant-elements',
    'babel-plugin-transform-react-pure-class-to-function',
    wrapWarningWithDevCheck,
    isRollup && 'babel-plugin-transform-react-remove-prop-types',
    (isCJS || isES) && [
      'inline-replace-variables',
      {
        __DEV__: {
          type: 'node',
          replacement: "process.env.NODE_ENV === 'development'",
        },
      },
    ],
    isES && [
      extensionResolver,
      {
        // For verification, see test/module/packages-are-es-modules.mjs
        modulesToResolve: [
          // InstantSearch.js/es is an ES Module, so needs complete paths,
          'instantsearch.js',
          // React-DOM also fails if the paths are incomplete
          'react-dom',
          // `use-sync-external-store` also fails if the paths are incomplete
          'use-sync-external-store',
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

            // false positive (babel doesn't know types)
            // this is actually only called on arrays
            'String.prototype.includes',
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
    presets: [
      '@babel/preset-typescript',
      '@babel/preset-react',
      [
        '@babel/preset-env',
        {
          modules,
          targets,
        },
      ],
    ],
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
        test: 'packages/react-instantsearch-dom-maps',
        plugins: clean([
          '@babel/plugin-syntax-dynamic-import',
          !isRollup && 'babel-plugin-dynamic-import-node',
        ]),
      },
    ],
    // jsx is transpiled, so the comment should no longer be present in the final files
    shouldPrintComment: (value) => value !== '* @jsx h ',
  };
};
