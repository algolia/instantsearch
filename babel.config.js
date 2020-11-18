/* eslint-disable import/no-commonjs */

const wrapWarningWithDevCheck = require('./scripts/babel/wrap-warning-with-dev-check');

const isCJS = process.env.BABEL_ENV === 'cjs';
const isES = process.env.BABEL_ENV === 'es';
const isUMD = process.env.BABEL_ENV === 'umd';

const clean = x => x.filter(Boolean);

module.exports = api => {
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
    '@babel/plugin-transform-react-constant-elements',
    [
      'babel-plugin-transform-react-remove-prop-types',
      {
        mode: 'remove',
        removeImport: true,
      },
    ],
    'babel-plugin-transform-react-pure-class-to-function',
    wrapWarningWithDevCheck,
    (isCJS || isES) && [
      'inline-replace-variables',
      {
        __DEV__: {
          type: 'node',
          replacement: "process.env.NODE_ENV === 'development'",
        },
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
  };
};
