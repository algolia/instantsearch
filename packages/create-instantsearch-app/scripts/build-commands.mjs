// Builds the TypeScript commands (init, introspect, agents-md) into dist/commands.js,
// which src/cli/index.js loads. Dependencies stay external and install with the package.
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(root, 'dist', 'commands.js');

rmSync(join(root, 'dist'), { recursive: true, force: true });
await build({
  entryPoints: [join(root, 'src', 'commands', 'index.ts')],
  outfile,
  bundle: true,
  packages: 'external',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  logLevel: 'warning',
});
console.log(`built ${outfile}`);
