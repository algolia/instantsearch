import { createCJSConfig } from '../../scripts/build/rollup.base.mjs';
import pkg from './package.json' with { type: 'json' };

export default createCJSConfig({
  input: 'src/codeshift.config.js',
  pkg,
  outputDir: 'dist',
});
