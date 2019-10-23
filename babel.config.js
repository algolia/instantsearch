/* eslint-disable import/no-commonjs */

const wrapWarningWithDevCheck = require('./scripts/babel/wrap-warning-with-dev-check');

const isCJS = process.env.BABEL_ENV === 'cjs';
const isES = process.env.BABEL_ENV === 'es';

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
    'babel-plugin-transform-react-remove-prop-types',
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
