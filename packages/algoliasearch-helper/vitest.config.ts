import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/spec/**/*.[jt]s?(x)'],
    dangerouslyIgnoreUnhandledErrors: true,
  },
});
