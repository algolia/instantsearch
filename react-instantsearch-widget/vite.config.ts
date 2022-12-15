import path from 'path';

import reactRefresh from '@vitejs/plugin-react-refresh';
import vite from 'vite';

// import { defineConfig } from 'vite' -> fails when type:module in package.json
// it seems related to https://github.com/vitejs/vite/issues/1560
// so far this is the workaround.
const { defineConfig } = vite;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: '',
      fileName: 'index',
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', 'react-dom', 'react-instantsearch-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-instantsearch-dom': 'ReactInstantSearchDOM',
        },
      },
    },
  },
});
