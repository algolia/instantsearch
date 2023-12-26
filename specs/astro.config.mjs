import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://instantsearchjs.netlify.app/',
  base: '/specs',
  outDir: '../website/specs',
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: [
        '@codesandbox/sandpack-react',
        '@codesandbox/sandpack-themes',
        '@codesandbox/sandpack-client',
      ],
    },
  },
});
