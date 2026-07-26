/* eslint-disable no-console */
import assert from 'node:assert';

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';

const bundle = await rollup({
  input: 'consumer',
  external: ['react'],
  plugins: [
    {
      name: 'consumer',
      resolveId(source) {
        return source === 'consumer' ? source : null;
      },
      load(id) {
        return id === 'consumer'
          ? "import { InstantSearch } from 'react-instantsearch-core'; console.log(InstantSearch);"
          : null;
      },
    },
    nodeResolve(),
    commonjs(),
  ],
});

try {
  const { output } = await bundle.generate({ format: 'esm' });
  // `InstantSearch` reads the message revision helpers out of the Chat module,
  // so that module is expected in the graph. What must stay out is the Chat
  // runtime behind them. Assert on rendered modules rather than a generated
  // identifier, which a rename or minification would silently hide.
  const retained = Object.entries(output[0].modules)
    .filter(
      ([id, module]) =>
        /[\\/]lib[\\/]ai-lite[\\/]/.test(id) && module.renderedLength > 0
    )
    .map(([id]) => id);

  assert.deepEqual(
    retained,
    [],
    `an InstantSearch only consumer should not retain the Chat runtime, but bundled:\n${retained.join(
      '\n'
    )}`
  );

  // The revision helpers keep a slice of the Chat module in the graph. Budget
  // it, so a future edit that makes them reach into the clone or the Chat
  // classes shows up here instead of silently shipping.
  const CHAT_MODULE_BUDGET = 6000;
  const chatBytes = Object.entries(output[0].modules)
    .filter(([id]) => /[\\/]lib[\\/]chat[\\/]chat\.js$/.test(id))
    .reduce((total, [, module]) => total + module.renderedLength, 0);

  assert.ok(
    chatBytes <= CHAT_MODULE_BUDGET,
    `an InstantSearch only consumer retains ${chatBytes} bytes of the Chat module, over the ${CHAT_MODULE_BUDGET} byte budget`
  );

  console.log(
    `InstantSearch tree shakes the Chat runtime (${chatBytes} bytes of chat.js retained)`
  );
} finally {
  await bundle.close();
}
