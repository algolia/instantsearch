import { defineConfig } from 'vitest/config';

// Force colors off to ensure snapshot consistency across environments
// (chalk detects color from TTY, which varies between direct and lerna runs)
process.env.FORCE_COLOR = '0';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{js,ts}', 'e2e/**/*.test.{js,ts}'],
    exclude: ['**/node_modules/**', 'src/templates/**'],
    snapshotSerializers: [
      '@instantsearch/testutils/ansiSnapshotSerializer.cjs',
    ],
  },
});
