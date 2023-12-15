import vue from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [commonjs(), vue()],
});
