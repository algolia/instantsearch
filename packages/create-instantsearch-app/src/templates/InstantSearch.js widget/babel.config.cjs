/* eslint-disable import/no-commonjs */
module.exports = (api) => {
  const isCJS = process.env.BABEL_ENV === 'cjs';
  const isESM = process.env.BABEL_ENV === 'esm';
  const isTest = process.env.NODE_ENV === 'test';
  const removeEmpty = (x) => x.filter(Boolean);

  /*
   * Cache babel result according to the current environment
   * https://babeljs.io/docs/en/config-files#apicache
   */
  api.cache(() => `${process.env.NODE_ENV}-${process.env.BABEL_ENV}`);

  return {
    presets: [
      /*
       * Apply transforms for TypeScript
       * https://babeljs.io/docs/en/babel-preset-typescript
       */
      '@babel/preset-typescript',
      /*
       * Apply transforms depending of the target environement
       * https://babeljs.io/docs/en/babel-preset-env
       */
      [
        '@babel/preset-env',
        {
          targets: Object.assign(
            {},
            /*
             * For tests only target the current Node.js version
             * Otherwise it uses the values from the `browserslist` entry in `package.json`
             * https://babeljs.io/docs/en/babel-preset-env#targetsnode
             */
            isTest && {
              node: 'current',
            }
          ),
          /*
           * Transform the modules type for the CommonJS build
           * Otherwise keep the ECMAScript modules syntax
           * https://babeljs.io/docs/en/babel-preset-env#modules
           */
          modules: isCJS ? 'commonjs' : false,
        },
      ],
    ],
    plugins: removeEmpty(
      /*
       * Add extensions to import and export declarations
       * ECMAScript modules syntax require extensions when using the `import` keyword to resolve relative or absolute specifiers
       * https://github.com/karlprieb/babel-plugin-add-import-extension
       * https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_mandatory_file_extensions
       */
      [isESM && 'add-import-extension']
    ),
  };
};
