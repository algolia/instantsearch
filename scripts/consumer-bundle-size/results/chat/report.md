# InstantSearch consumer bundle measurement with and without Chat

## Measurement meaning

These entries are static retention microbenchmarks. They are not complete or usable applications.

Each value measures the total loaded graph after tree shaking, minification, and inline dynamic imports. It is not an initial route measurement or an asynchronous chunk measurement.

Result state: **verified**.

## Contract and provenance

| Field | Value |
| --- | --- |
| Library base commit | `f7c7f52aac694f2346c9433e3f43cb8bb18840e3` |
| Harness commit | `df1233ad6915268da35add99f7a556698329c821` |
| Measurement commit | `df1233ad6915268da35add99f7a556698329c821` |
| Measurement tree | `2de436c75dfb6ed74023039b94df51f89328b458` |
| Candidate commit | Not applicable |
| Patch hash | Not applicable |
| Repository clean before measurement | `true` |
| Harness source SHA256 | `36211e7dee4e014b52e1c3caa4668e02eb150fbb0e04d0235730ffb7081767e3` |
| Contract SHA256 | `04c9afea42e3cedcc0e7fcc6889d57cd17da09a1f060085084b8b51a143ebe5d` |
| Resolved input graph SHA256 | `5eaf9f6ac8c120b0384b4febc6ad6bca0b6ae81eda635b5117a3474315440d86` |

### Environment

| Field               | Value                    |
| ------------------- | ------------------------ |
| Node                | `20.19.0`                |
| Yarn                | `1.22.22`                |
| Rollup              | `4.29.1`                 |
| Node Resolve plugin | `16.0.0`                 |
| CommonJS plugin     | `28.0.2`                 |
| JSON plugin         | `6.1.0`                  |
| Replace plugin      | `6.0.2`                  |
| Terser plugin       | `0.4.4`                  |
| Terser engine       | `5.46.0`                 |
| zlib                | `1.3.0.1-motley-82a5fec` |
| Platform            | `darwin`                 |
| Architecture        | `arm64`                  |

Evidence formatter: Prettier `2.8.1`. This report metadata does not add a field to the accepted environment schema.

### Measurement contract

| Field | Value |
| --- | --- |
| Entry names | `["js-basic","js-chat","react-basic","react-chat"]` |
| External modules | `[]` |
| Output format | `es` |
| Source map | `false` |
| Inline dynamic imports | `true` |
| Tree shaking | `true` |
| Environment replacements | `{"__DEV__":false,"process.env.NODE_ENV":"production"}` |
| Plugin order | `["createResolvePlugin","createCommonjsPlugin","json","createReplacePlugin","createProvenancePlugin","createTerserPlugin"]` |
| Terser options | `{"maxWorkers":1,"compress":{"passes":4,"toplevel":true,"pure_getters":true},"mangle":{"toplevel":true}}` |
| Gzip level | `9` |
| yarn.lock SHA256 | `4b28955df49f41124863ed20b0b6d7db07ef0e05a3948e2eca4c2d738a2578ab` |

External modules: `[]`. React and React DOM remain bundled in React entries. The JavaScript entries retain React only when their graph reaches it.

## Verified baseline

| Entry | State | Minified bytes | Minified kB | Gzip bytes | Gzip kB |
| --- | --- | --: | --: | --: | --: |
| `js-basic` | verified | 167044 | 167.0 | 46530 | 46.5 |
| `js-chat` | verified | 290388 | 290.4 | 83576 | 83.6 |
| `react-basic` | verified | 323255 | 323.3 | 94642 | 94.6 |
| `react-chat` | verified | 430159 | 430.2 | 125962 | 126.0 |

## Provisional impact

No provisional values are presented as verified results.

## Fixture and output hashes

Shared search client SHA256: `ea2df869dee913a17767efe4b8a991a66a99faa0ac66774826321764984804b0`.

| Entry | State | Entry SHA256 | Input graph SHA256 | Minified SHA256 | Gzip SHA256 | Attribution SHA256 |
| --- | --- | --- | --- | --- | --- | --- |
| `js-basic` | verified | `8566c45f1d5be77a3cd1dee27cc737e708cd41bc3f80046d4f248cbd88e59f10` | `130bdb2b1a7f7860b0d40b2f48ca3509aab2cd979066ad5f169595c043b74ee3` | `4d627e95287e9a69853a1bf1c651826ec13c5826f7884b7ba85a15316b1355b4` | `a419faf9a5a2c4899001d1c6eed695ef29d05a0574587e5f1c9be95e4178c9ea` | `75744b7fe346659936700877d79b2fd0aef3ac90789da6c7d9657402424089c5` |
| `js-chat` | verified | `de92d9b84beb5a2e7c4d53ed54a5d1abe3e6a6d957d25de444e7a67eb8d615dd` | `e237b8b702e1113c4289a8cacafbff7d27937a031a1b292bce196c287c4d2031` | `207d4a936d1e3e6d917a3bf29e5dd7b3720d7ddc77cbea06bc1ac4e44980f425` | `8270e599fb43229b21de13d6588a627cead74fcdd607f197563288a9a7c41d37` | `0f8f98a950816c3294bb1258c45c46e2c47e001fb918149a06aec6fdb927d10f` |
| `react-basic` | verified | `d7b257321a8a509a79c5d05cf7e4fa23f7562f7f5c32fc2428a89f4850b643dc` | `d729da9c5c56244283e27e4612be7533379b7d88f83a4cc105e03e7120a207dd` | `3313a9beea33eb310f99d2af4af9e868d4a2fc1148db9eb887da69125a5bd11b` | `eab4bafae93d69ed1a64c3b7bd87d41c23c3c3ddb87e9d406b091664a4d65ecd` | `6e0fd5b301d74480aa66e280421584da78aa798173dbf4d1dd2d1fb16d8bc87d` |
| `react-chat` | verified | `c1454b7415e561082b084fc035e90ab2b045f847c8e937d204d9f122b3e956ff` | `d7d1e23a3a28e8fb35773043f5c0cb8bf022723801094216a85919c429ef44a4` | `e43f0d1bc4eea6f87c27f41440006743ea1d7f9129e5fc093d66085726210902` | `5356200ed3c0d62b0802ec5b07e1deb537dc29859793c2dd110d4b8e8b0d0b4a` | `4ea97f950e2d5e3580f09084ac0aecca2d46747a5cbbb5024f9d931e710cd54e` |

## Retention comparison

| Flavor | State | Chat minus basic minified bytes | Chat minus basic gzip bytes |
| --- | --- | --: | --: |
| js | verified | 123344 | 37046 |
| react | verified | 106904 | 31320 |

## Retained module attribution

`renderedLength` is Rollup rendered source length. It is not minified bytes or gzip bytes.

### js-basic

| Module | Rendered length |
| --- | --: |
| `packages/algoliasearch-helper/src/algoliasearch.helper.js` | 68927 |
| `packages/algoliasearch-helper/src/SearchParameters/index.js` | 57766 |
| `packages/algoliasearch-helper/src/SearchResults/index.js` | 37824 |
| `packages/instantsearch.js/es/generated/200b0f0b2b5c90fd1df895e1c894f4216f8888e55132fe79db6dec098ddaa31c.js` | 33381 |
| `packages/instantsearch.js/es/generated/634593b8fd98242540de4a3886216cc9aa688eb7499bc09cdc56f13e03051a15.js` | 28339 |
| `packages/instantsearch.js/es/generated/885fb9a06bda515d5542636aa0c4ca40ce7ca1407054c8aa049e7378584892ed.js` | 22366 |
| `packages/algoliasearch-helper/src/requestBuilder.js` | 17419 |
| `node_modules/hogan.js/lib/compiler.js` | 12898 |
| `packages/instantsearch.js/es/generated/ca4073944d017c53c3a6fce5d0058719d81b1b6ddd1e8ada3fcd86e03adbfd32.js` | 12124 |
| `node_modules/hogan.js/lib/template.js` | 9920 |

React modules retained: none.

Chat or ai-lite modules retained: `packages/instantsearch.js/es/lib/chat/openChat.js`.

The basic SearchBox path retains the shared Chat opening helper because the built SearchBox imports it.

### js-chat

| Module | Rendered length |
| --- | --: |
| `packages/instantsearch.js/es/lib/ai-lite/abstract-chat.js` | 73824 |
| `packages/algoliasearch-helper/src/algoliasearch.helper.js` | 68927 |
| `packages/algoliasearch-helper/src/SearchParameters/index.js` | 57766 |
| `packages/algoliasearch-helper/src/SearchResults/index.js` | 37824 |
| `packages/instantsearch.js/es/generated/200b0f0b2b5c90fd1df895e1c894f4216f8888e55132fe79db6dec098ddaa31c.js` | 33399 |
| `packages/instantsearch.js/es/widgets/chat/chat.js` | 29755 |
| `packages/instantsearch.js/es/generated/634593b8fd98242540de4a3886216cc9aa688eb7499bc09cdc56f13e03051a15.js` | 28341 |
| `packages/instantsearch.js/es/connectors/chat/connectChat.js` | 24788 |
| `packages/instantsearch.js/es/generated/885fb9a06bda515d5542636aa0c4ca40ce7ca1407054c8aa049e7378584892ed.js` | 22372 |
| `packages/instantsearch-ui-components/dist/es/lib/stickToBottom.js` | 20819 |

React modules retained: `node_modules/react/cjs/react.production.js`, `node_modules/react/index.js`.

Chat or ai-lite modules retained: `packages/instantsearch.js/es/lib/ai-lite/abstract-chat.js`, `packages/instantsearch.js/es/widgets/chat/chat.js`, `packages/instantsearch.js/es/connectors/chat/connectChat.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessages.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessage.js`, `packages/instantsearch-ui-components/dist/es/components/chat/icons.js`, `packages/instantsearch.js/es/lib/ai-lite/transport.js`, `packages/instantsearch-ui-components/dist/es/components/chat/tools/DisplayResultsTool.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatPrompt.js`, `packages/instantsearch-ui-components/dist/es/components/chat/tools/CarouselTool.js`, `packages/instantsearch.js/es/lib/chat/chat.js`, `packages/instantsearch-ui-components/dist/es/components/chat/Chat.js`, `packages/instantsearch-ui-components/dist/es/lib/utils/chat.js`, `packages/instantsearch.js/es/lib/ai-lite/stream-parser.js`, `packages/instantsearch.js/es/lib/ai-lite/utils.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessageError.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatHeader.js`, `packages/instantsearch.js/es/widgets/chat/display-results-tool.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessageReasoning.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatOverlayLayout.js`, `packages/instantsearch.js/es/lib/chat/openChat.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessageLoader.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatPromptSuggestions.js`, `packages/instantsearch.js/es/widgets/chat/search-index-tool.js`, `packages/instantsearch.js/es/lib/chat/index.js`.

The JavaScript Chat graph retains React because its reached Markdown renderer has a static React import.

### react-basic

| Module | Rendered length |
| --- | --: |
| `node_modules/react-dom/cjs/react-dom-client.production.js` | 524032 |
| `packages/algoliasearch-helper/src/algoliasearch.helper.js` | 68927 |
| `packages/algoliasearch-helper/src/SearchParameters/index.js` | 57766 |
| `packages/algoliasearch-helper/src/SearchResults/index.js` | 37824 |
| `packages/instantsearch.js/es/widgets/index/index.js` | 33379 |
| `packages/instantsearch.js/es/lib/InstantSearch.js` | 28325 |
| `packages/instantsearch.js/es/middlewares/createInsightsMiddleware.js` | 22356 |
| `node_modules/react/cjs/react.production.js` | 17911 |
| `packages/algoliasearch-helper/src/requestBuilder.js` | 17419 |
| `packages/instantsearch.js/es/lib/routers/history.js` | 12124 |

React modules retained: `node_modules/react-dom/cjs/react-dom-client.production.js`, `node_modules/react/cjs/react.production.js`, `node_modules/react-dom/cjs/react-dom.production.js`, `node_modules/react-dom/index.js`, `node_modules/react-dom/client.js`, `node_modules/react/index.js`.

Chat or ai-lite modules retained: `packages/instantsearch.js/es/lib/chat/openChat.js`.

The basic SearchBox path retains the shared Chat opening helper because the built SearchBox imports it.

### react-chat

| Module | Rendered length |
| --- | --: |
| `node_modules/react-dom/cjs/react-dom-client.production.js` | 524032 |
| `packages/instantsearch.js/es/lib/ai-lite/abstract-chat.js` | 73824 |
| `packages/algoliasearch-helper/src/algoliasearch.helper.js` | 68927 |
| `packages/algoliasearch-helper/src/SearchParameters/index.js` | 57766 |
| `packages/algoliasearch-helper/src/SearchResults/index.js` | 37824 |
| `packages/instantsearch.js/es/widgets/index/index.js` | 33379 |
| `packages/instantsearch.js/es/lib/InstantSearch.js` | 28325 |
| `packages/instantsearch.js/es/connectors/chat/connectChat.js` | 24796 |
| `packages/instantsearch.js/es/middlewares/createInsightsMiddleware.js` | 22356 |
| `packages/instantsearch-ui-components/dist/es/lib/stickToBottom.js` | 20819 |

React modules retained: `node_modules/react-dom/cjs/react-dom-client.production.js`, `node_modules/react/cjs/react.production.js`, `node_modules/react-dom/cjs/react-dom.production.js`, `node_modules/react-dom/index.js`, `node_modules/react-dom/client.js`, `node_modules/react/index.js`.

Chat or ai-lite modules retained: `packages/instantsearch.js/es/lib/ai-lite/abstract-chat.js`, `packages/instantsearch.js/es/connectors/chat/connectChat.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessages.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessage.js`, `packages/react-instantsearch/dist/es/widgets/Chat.js`, `packages/instantsearch-ui-components/dist/es/components/chat/icons.js`, `packages/instantsearch.js/es/lib/ai-lite/transport.js`, `packages/instantsearch-ui-components/dist/es/components/chat/tools/DisplayResultsTool.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatPrompt.js`, `packages/instantsearch-ui-components/dist/es/components/chat/tools/CarouselTool.js`, `packages/instantsearch.js/es/lib/chat/chat.js`, `packages/instantsearch-ui-components/dist/es/components/chat/Chat.js`, `packages/instantsearch-ui-components/dist/es/lib/utils/chat.js`, `packages/instantsearch.js/es/lib/ai-lite/stream-parser.js`, `packages/instantsearch.js/es/lib/ai-lite/utils.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessageError.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatHeader.js`, `packages/react-instantsearch/dist/es/widgets/chat/tools/DisplayResultsTool.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessageReasoning.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatOverlayLayout.js`, `packages/instantsearch.js/es/lib/chat/openChat.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatMessageLoader.js`, `packages/instantsearch-ui-components/dist/es/components/chat/ChatPromptSuggestions.js`, `packages/react-instantsearch/dist/es/widgets/chat/tools/SearchIndexTool.js`, `packages/instantsearch.js/es/lib/chat/index.js`.

## Repeatability boundary

The three verified consumer runs share one clean `YARN_IGNORE_PATH=1 yarn build:ci` output. They require identical minified output, gzip output, hashes, resolved input graphs, and normalized attribution.

Only output from a build that satisfies all five absence preconditions can supply a provisional or verified measurement. This generated evidence does not claim repeatability across independent package builds.

## Evidence lifecycle

1. The harness commit freezes the reviewed harness and provisional artifacts.
2. Verified baseline measurement starts clean at the harness commit. The three run measurement records `repositoryClean: true`, writes verified attribution, and leaves `candidates: []`.
3. The ranking only operation runs after attribution exists. It permits only generated result changes, adds exactly three candidates, and preserves every recorded measurement and clean state field.
4. The user reviews and commits the ranked verified artifacts separately. That commit is the baseline evidence commit.
5. A later candidate measurement supplies both the original harness commit and the baseline evidence commit, then loads the verified baseline and ranked candidates from Git.

### Verified baseline Git states

1. Before measurement: `HEAD` equals the harness commit and `git status --short` has no output.
2. After measurement: the worktree is dirty only under `scripts/consumer-bundle-size/results/chat/`. The recorded `repositoryClean: true` remains the state captured before measurement.
3. Before ranking: the worktree is still dirty only under `scripts/consumer-bundle-size/results/chat/`. Ranking rejects changes anywhere else.
4. After ranking: only `scripts/consumer-bundle-size/results/chat/results.json` and `scripts/consumer-bundle-size/results/chat/report.md` are rewritten by ranking. Measurement provenance and attribution files are unchanged.
5. After the user commits verified evidence: `git status --short` has no output and `HEAD` is the baseline evidence commit.

## Ranked candidates

| Rank | Candidate | Retained bytes | Necessity | Mechanism hypothesis | Expected fixtures | Scope fit | Compatibility risk | Evidence status |
| --: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Chat-scoped stick-to-bottom controller | js-basic: 0, js-chat: 20952, react-basic: 0, react-chat: 21053 | Built-in JavaScript and React Chat require initial positioning, resize handling, streamed-content pinning, user-scroll escape, selection handling, refs, scrollToBottom and isAtBottom, but currently reach the broader generic controller and flavor wrappers. | Introduce a private shared Chat-scoped controller for exactly the built-in Chat behavior and route both Chat widgets through it so the listed generic modules leave both Chat graphs while the public createStickToBottom and React useStickToBottom exports and behavior remain unchanged. | js-chat, react-chat | Shared lane; production boundary is packages/instantsearch-ui-components/src/lib/stickToBottom.ts, packages/instantsearch.js/src/lib/useStickToBottom.ts, packages/instantsearch.js/src/widgets/chat/chat.tsx, packages/react-instantsearch/src/lib/useStickToBottom.ts and packages/react-instantsearch/src/widgets/Chat.tsx; both basic fixtures must remain stable. | High runtime risk because resize observers, animation frames, streaming growth, user escape, text selection, manual return and browser layout timing must remain identical; focused autoscroll tests and Chromium, Firefox and WebKit smoke checks are required. | High retention evidence and medium mechanism confidence: js-chat retains 20819 plus 133 equals 20952 renderedLength and react-chat retains 20819 plus 234 equals 21053, with no basic retention; these are observed module lengths and not predicted savings. |
| 2 | Renderer-neutral Chat Markdown compilation | js-basic: 0, js-chat: 18192, react-basic: 18256, react-chat: 18256 | Markdown parsing and sanitization are required in Chat, but React is retained in js-chat only because the installed markdown-to-jsx root compiler uses React.createElement as a fallback even when InstantSearch supplies createElement. | Unresolved for installed markdown-to-jsx 7.7.15: the bounded acceptable route requires an upstream-owned additive renderer-neutral compiler export that requires createElement, preserves the existing root API and parser behavior, is published by markdown-to-jsx, and is then imported by ChatMessage and ChatMessageReasoning; no such entry currently exists. | js-chat | Proposed JavaScript flavor-specific lane awaiting confirmation; the InstantSearch boundary is packages/instantsearch-ui-components/src/components/chat/ChatMessage.tsx and packages/instantsearch-ui-components/src/components/chat/ChatMessageReasoning.tsx; both basic fixtures remain stable and React remains a platform dependency in react-chat. | Medium-high dependency and behavior risk because work is blocked on an upstream release and must prove parser, sanitizer, incomplete-stream Markdown, VNode, dependency ownership and public API parity. | High import-causality evidence but medium-low experiment readiness: the exact Markdown module is packages/instantsearch-ui-components/node_modules/markdown-to-jsx/dist/index.modern.js at 15373 in js-chat and 15197 in react-chat, while the five listed React modules total 18192 in js-chat; the Markdown module is excluded because equivalent compiler code remains necessary. |
| 3 | Chat response ownership normalization | js-basic: 0, js-chat: 73824, react-basic: 0, react-chat: 73824 | AbstractChat must coordinate message replacement, response ownership, streamed chunks, tool calls, detached results, rehydration, continuation, abort and failure recovery, so most of the retained module is necessary runtime behavior. | Only after an architecture proof, normalize response and tool ownership around stable records at mutation points so duplicate rehydration scans, detached-response remapping and redundant ownership branches disappear inside abstract-chat without changing stream or tool state transitions; no whole-module removal is claimed. | js-chat, react-chat | Shared lane; the exact production boundary is packages/instantsearch.js/src/lib/ai-lite/abstract-chat.ts with focused abstract-chat, stream parser, connectChat, persistence and adversarial race tests; this is unsuitable as the first bounded experiment. | Very high correctness risk because normalization can introduce stale ownership, duplicate tool execution, lost responses, double continuation, memory leaks or race-dependent failures. | Low candidate confidence despite high module-retention confidence: 73824 is whole-module renderedLength in each Chat fixture, not attributable branch size or predicted savings; attribution cannot quantify the proposed branch and an architecture proof is required. |

## Candidate experiment

No production candidate is measured or selected in this report.

## Reproduction

```sh
fnm use 20.19.0
test "$(node --version)" = "v20.19.0"
test "$(YARN_IGNORE_PATH=1 yarn --version)" = "1.22.22"
candidate_payload="$(node scripts/consumer-bundle-size/measure.mjs --print-candidate-payload)"
YARN_IGNORE_PATH=1 yarn install --frozen-lockfile
test ! -e packages/instantsearch.js/es
test ! -e packages/react-instantsearch/dist
test ! -e packages/react-instantsearch-core/dist
test ! -e packages/instantsearch-ui-components/dist
test ! -e packages/algoliasearch-helper/dist
YARN_IGNORE_PATH=1 yarn build:ci
node scripts/consumer-bundle-size/measure.mjs --runs 3 --status verified
node scripts/consumer-bundle-size/measure.mjs --rank-candidates --candidate-payload "$candidate_payload"
```

## Candidate ranking reproduction

The clean verified measurement command always writes `candidates: []`. Candidate selection happens afterward and does not rerun measurement.

The complete reproduction block preserves the ranked records before measurement resets `results.json`, then restores them through the validated payload. For a ranking only replay that does not rerun measurement, the current result file remains valid input:

```sh
node scripts/consumer-bundle-size/measure.mjs --rank-candidates --candidate-file scripts/consumer-bundle-size/results/chat/results.json
```

Focused ranking lifecycle test:

```sh
node scripts/consumer-bundle-size/measure.mjs --test-ranking-workflow
```
