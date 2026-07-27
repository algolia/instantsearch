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

// The only bindings `InstantSearch` may pull out of `lib/chat`. The last one is
// not imported here, but the four helpers call it, so rollup keeps its
// declaration and counts it as rendered; it belongs on the list rather than in
// the failure.
const REVISION_HELPERS = [
  'getChatMessagesRevision',
  'releaseChatMessagesRevision',
  'retainChatMessagesRevision',
  'trackChatMessagesRevision',
  'getChatMessagesSnapshotStore',
];

// A growth cap on `messagesRevision` itself, which holds only the revision
// counter and the registry. The clone machinery is not exported, so it would
// not trip the allow-list above; it would land here as bytes, and it is several
// thousand of them. The headroom is generous because rollup keeps source
// comments in this figure while every minifier drops them.
const CHAT_GRAPH_BUDGET = 5000;

try {
  const { output } = await bundle.generate({ format: 'esm' });
  const modules = Object.entries(output[0].modules);

  // `AbstractChat` and the transport live in `lib/ai-lite`. Nothing there is
  // reachable from a revision helper, so nothing there may render. Assert on
  // rendered modules rather than a generated identifier, which a rename or
  // minification would silently hide.
  const retained = modules
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

  // The revision helpers have their own module, so the Chat module itself has
  // no reason to be in the graph at all. This is a boundary rather than a
  // budget: a helper that reaches back into `chat.js` shows up as bytes here.
  const chatRuntimeBytes = modules
    .filter(([id]) => /[\\/]lib[\\/]chat[\\/]chat\.js$/.test(id))
    .reduce((total, [, module]) => total + module.renderedLength, 0);

  assert.equal(
    chatRuntimeBytes,
    0,
    `an InstantSearch only consumer rendered ${chatRuntimeBytes} bytes of the Chat module, which it no longer has any reason to reach`
  );

  // `Chat`, `ChatState` and `CACHE_KEY` are exports. If one of them survives
  // into this graph, rollup renders it and it lands here by name.
  const chatModules = modules.filter(([id]) =>
    /[\\/]lib[\\/]chat[\\/]/.test(id)
  );
  const unexpectedExports = chatModules.flatMap(([id, module]) =>
    module.renderedExports
      .filter((name) => !REVISION_HELPERS.includes(name))
      .map((name) => `${name} (${id})`)
  );

  assert.deepEqual(
    unexpectedExports,
    [],
    `an InstantSearch only bundle rendered Chat exports beyond the revision helpers:\n${unexpectedExports.join(
      '\n'
    )}`
  );

  const chatBytes = chatModules.reduce(
    (total, [, module]) => total + module.renderedLength,
    0
  );

  assert.ok(
    chatBytes <= CHAT_GRAPH_BUDGET,
    `an InstantSearch only consumer retains ${chatBytes} bytes of lib/chat, over the ${CHAT_GRAPH_BUDGET} byte budget. The revision helpers most likely reached the message clone.`
  );

  console.log(
    `InstantSearch keeps the Chat runtime out (${chatBytes} bytes of lib/chat, only the revision helpers rendered)`
  );
} finally {
  await bundle.close();
}
