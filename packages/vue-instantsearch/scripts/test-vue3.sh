#!/bin/sh
set -e

yarn remove vue-template-compiler
yarn add vue@3.1.2 @vue/server-renderer@3.1.2 vue-loader@16.1.2 jest@26.6.3 babel-jest@25.2.6 @babel/preset-env@7.14.5 @babel/plugin-transform-runtime@7.14.5 @babel/core@7.14.5 -D -E

echo "export * from './index-vue3';" > src/util/vue-compat/index.js

cat <<EOT > babel.config.js
// eslint-disable-next-line import/no-commonjs
module.exports = {
  plugins: ['@babel/plugin-transform-runtime'],
  presets: ['@babel/preset-env'],
};
EOT
