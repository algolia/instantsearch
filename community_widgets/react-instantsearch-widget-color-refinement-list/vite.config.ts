import path from 'path';

import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'ColorRefinementList',
      fileName: 'index',
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'react',
        'react-dom',
        'react-instantsearch-dom',
        'react-instantsearch-core',
        'classnames',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-instantsearch-dom': 'ReactInstantSearchDOM',
          'react-instantsearch-core': 'ReactInstantSearchCore',
          classnames: 'classNames',
        },
      },
    },
  },
});
