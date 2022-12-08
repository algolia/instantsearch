import { fileURLToPath } from 'url';

import typescript from '@rollup/plugin-typescript';
import apiExtractor from 'rollup-plugin-api-extractor';
import vite from 'vite';

// https://vitejs.dev/config/
export default vite.defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      name: '{{ pascalCaseName }}',
      fileName: 'index',
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['instantsearch.js'],
      output: {
        globals: {
          'instantsearch.js': 'instantsearch',
        },
      },
    },
  },
  plugins: [
    typescript({ tsconfig: 'tsconfig.declaration.json' }),
    apiExtractor.apiExtractor(),
  ],
});
