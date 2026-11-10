/* eslint-disable no-console */

import assert from 'assert';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';

['es', 'cjs'].forEach((format) => {
  const { sideEffects } = JSON.parse(
    readFileSync(
      new URL(`../../../vue2/${format}/package.json`, import.meta.url),
      'utf8'
    )
  );
  assert.strictEqual(
    sideEffects,
    false,
    `vue2/${format}/package.json marks the build as having side effects`
  );
});

const entry = fileURLToPath(new URL('./entry.js', import.meta.url));

const bundle = (code) =>
  rollup({
    input: entry,
    external: (id) =>
      !id.startsWith('.') &&
      !id.startsWith('/') &&
      !id.startsWith('vue-instantsearch'),
    plugins: [
      {
        name: 'entry',
        resolveId: (id) => (id === entry ? id : null),
        load: (id) => (id === entry ? code : null),
      },
      nodeResolve(),
    ],
    onwarn() {},
  })
    .then((build) => build.generate({ format: 'es' }))
    .then(({ output: [chunk] }) => ({
      code: chunk.code,
      modules: Object.keys(chunk.modules).filter(
        (id) => chunk.modules[id].renderedLength > 0
      ),
    }));

const unused = await bundle("import 'vue-instantsearch/vue2/es';");
assert.strictEqual(unused.code.trim(), '', 'an unused import adds code');

const searchBox = await bundle(
  "export { AisSearchBox } from 'vue-instantsearch/vue2/es';"
);
assert.ok(
  searchBox.modules.some((id) => id.includes('/components/SearchBox.'))
);
assert.deepStrictEqual(
  ['Autocomplete', 'Chat', 'RefinementList'].filter((name) =>
    searchBox.modules.some((id) => id.includes(`/components/${name}.`))
  ),
  [],
  'importing AisSearchBox bundles other widgets'
);

console.log('vue-instantsearch/vue2 is tree-shakable');
