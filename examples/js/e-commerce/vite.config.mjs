import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

function fixLegacyHtml() {
  return {
    name: 'fix-legacy-html',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(/data-src="assets\//g, 'data-src="./assets/');
      },
    },
  };
}

export default defineConfig({
  plugins: [
    commonjs(),
    legacy({
      targets: ['defaults', 'IE 11'],
    }),
    fixLegacyHtml(),
  ],
  build: {
    commonjsOptions: {
      requireReturnsDefault: 'preferred',
    },
  },
});
