import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

function removeCrossOrigin() {
  return {
    name: 'remove-crossorigin',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(/ crossorigin/g, '');
      },
    },
  };
}

export default defineConfig({
  plugins: [
    commonjs(),
    legacy({
      targets: ['defaults', 'IE 11'],
      renderModernChunks: false,
    }),
    removeCrossOrigin(),
  ],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
