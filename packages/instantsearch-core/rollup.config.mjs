import {
  createESMConfig,
  createCJSConfig,
  collectSourceEntries,
} from '../../scripts/build/rollup.base.mjs';
import pkg from './package.json' with { type: 'json' };

const moduleInput = collectSourceEntries();
const isESM = process.env.BUILD_FORMAT === 'esm';
const isCJS = process.env.BUILD_FORMAT === 'cjs';

const configs = [];

if (isESM || (!isESM && !isCJS)) {
  configs.push(
    createESMConfig({
      input: moduleInput,
      pkg,
      outputDir: 'dist/es',
      preserveModules: true,
    })
  );
}

if (isCJS || (!isESM && !isCJS)) {
  configs.push(
    createCJSConfig({
      input: moduleInput,
      pkg,
      outputDir: 'dist/cjs',
      preserveModules: true,
    })
  );
}

export default configs;
