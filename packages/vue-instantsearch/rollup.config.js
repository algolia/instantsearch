import vueV2 from 'rollup-plugin-vue2';
import vueV3 from 'rollup-plugin-vue3';
import buble from 'rollup-plugin-buble';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';

if (process.env.VUE_VERSION !== 'vue2' && process.env.VUE_VERSION !== 'vue3') {
  throw new Error(
    'The environment variable VUE_VERSION (`vue2` | `vue3`) is required.'
  );
}

const processEnv = conf => ({
  // parenthesis to avoid syntax errors in places where {} is interpreted as a block
  'process.env': `(${JSON.stringify(conf)})`,
});

const vuePlugin = process.env.VUE_VERSION === 'vue3' ? vueV3 : vueV2;
const outputDir =
  process.env.VUE_VERSION === 'vue3' ? 'dist/vue3' : 'dist/vue2';

const plugins = [
  vuePlugin({ compileTemplate: true, css: false }),
  commonjs(),
  json(),
  buble({
    transforms: {
      dangerousForOf: true,
    },
  }),
  replace(processEnv({ NODE_ENV: 'production' })),
  terser({
    sourcemap: true,
  }),
  filesize(),
];

const external = id =>
  ['algoliasearch-helper', 'instantsearch.js', 'vue', 'mitt'].some(
    dep => id === dep || id.startsWith(`${dep}/`)
  );

export default [
  {
    input: 'src/instantsearch.js',
    external,
    output: [
      {
        sourcemap: true,
        file: `${outputDir}/cjs/index.js`,
        format: 'cjs',
        exports: 'named',
      },
    ],
    plugins: [...plugins],
  },
  {
    input: 'src/instantsearch.js',
    external,
    output: [
      {
        sourcemap: true,
        dir: `${outputDir}/es`,
        format: 'es',
      },
    ],
    preserveModules: true,
    plugins: [...plugins],
  },
  {
    input: 'src/instantsearch.umd.js',
    external: ['vue'],
    output: [
      {
        sourcemap: true,
        file: `${outputDir}/umd/index.js`,
        format: 'umd',
        name: 'VueInstantSearch',
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    ],
    plugins: [
      ...plugins,
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
    ],
  },
];
