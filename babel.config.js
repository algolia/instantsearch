/* eslint-disable import/no-commonjs */

const isES = process.env.BABEL_ENV === 'es';
const isRollup = process.env.BABEL_ENV === 'rollup';
const isProduction = process.env.BABEL_ENV === 'production';

const clean = x => x.filter(Boolean);

module.exports = api => {
  const isTest = api.env('test');
  const targets = {};

  if (!isTest) {
    targets.browsers = ['last 2 versions', 'ie >= 9'];
  } else {
    targets.node = true;
  }

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: !isES && !isRollup ? 'commonjs' : false,
          targets,
        },
      ],
      '@babel/preset-react',
    ],
    plugins: ['@babel/plugin-proposal-class-properties', 'babel-plugin-lodash'],
    overrides: [
      {
        test: 'packages/*',
        presets: ['@babel/preset-typescript'],
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
      {
        test: 'docgen',
        plugins: clean([
          'babel-plugin-inline-json-import',
          !isProduction && 'react-hot-loader/babel',
        ]),
      },
    ],
  };
};
