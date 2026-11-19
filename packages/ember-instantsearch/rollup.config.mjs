import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Addon } from '@embroider/addon-dev/rollup';
import { babel } from '@rollup/plugin-babel';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

const rootDirectory = dirname(fileURLToPath(import.meta.url));
const babelConfig = resolve(rootDirectory, './babel.publish.config.cjs');

export default {
  output: addon.output(),

  plugins: [
    /**
     * Each folder is listed, because the `minimatch` 3 that this repo
     * resolves does not walk into folders for a leading `**`.
     */
    addon.publicEntrypoints(['*.js', 'components/*.js'], {
      exclude: ['-private/**', 'types.ts'],
    }),

    addon.dependencies(),

    babel({
      extensions: ['.js', '.ts', '.gjs', '.gts'],
      babelHelpers: 'bundled',
      configFile: babelConfig,
    }),

    addon.gjs(),

    addon.declarations(
      'declarations',
      'ember-tsc --declaration --emitDeclarationOnly --noEmit false --declarationDir declarations -p tsconfig.publish.json'
    ),

    addon.clean(),
  ],
};
