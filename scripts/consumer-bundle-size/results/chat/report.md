# InstantSearch consumer bundle measurement with and without Chat

## Measurement meaning

These entries are static retention microbenchmarks. They are not complete or usable applications.

Each value measures the total loaded graph after tree shaking, minification, and inline dynamic imports. It is not an initial route measurement or an asynchronous chunk measurement.

Result state: **provisional**.

## Contract and provenance

| Field | Value |
| --- | --- |
| Library base commit | `f7c7f52aac694f2346c9433e3f43cb8bb18840e3` |
| Harness commit | Not applicable |
| Measurement commit | `f7c7f52aac694f2346c9433e3f43cb8bb18840e3` |
| Measurement tree | `014a104ae80ae7fba57e1ee0f8ac2e8e77456495` |
| Candidate commit | Not applicable |
| Patch hash | `1559b4d1c09612dd2e548ed817ce40a10c967c49f0880fb3cc2577c2eecc1402` |
| Repository clean before measurement | `false` |
| Harness source SHA256 | `f84517995af4b3b200c0872f080b302158084f89f6048f830aa4ff5563ee00e7` |
| Contract SHA256 | `806bd9138668e5ebb80c860bfbf4e1d93709cf04427f5530b13000027a27cac1` |
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

No verified baseline is recorded in this report. Provisional values below must not be used as the clean baseline.

## Provisional impact

| Entry | State | Minified bytes | Minified kB | Gzip bytes | Gzip kB |
| --- | --- | --: | --: | --: | --: |
| `js-basic` | provisional | 167044 | 167.0 | 46530 | 46.5 |
| `js-chat` | provisional | 290388 | 290.4 | 83576 | 83.6 |
| `react-basic` | provisional | 323255 | 323.3 | 94642 | 94.6 |
| `react-chat` | provisional | 430159 | 430.2 | 125962 | 126.0 |

## Fixture and output hashes

Shared search client SHA256: `ea2df869dee913a17767efe4b8a991a66a99faa0ac66774826321764984804b0`.

| Entry | State | Entry SHA256 | Input graph SHA256 | Minified SHA256 | Gzip SHA256 | Attribution SHA256 |
| --- | --- | --- | --- | --- | --- | --- |
| `js-basic` | provisional | `8566c45f1d5be77a3cd1dee27cc737e708cd41bc3f80046d4f248cbd88e59f10` | `130bdb2b1a7f7860b0d40b2f48ca3509aab2cd979066ad5f169595c043b74ee3` | `4d627e95287e9a69853a1bf1c651826ec13c5826f7884b7ba85a15316b1355b4` | `a419faf9a5a2c4899001d1c6eed695ef29d05a0574587e5f1c9be95e4178c9ea` | `75744b7fe346659936700877d79b2fd0aef3ac90789da6c7d9657402424089c5` |
| `js-chat` | provisional | `de92d9b84beb5a2e7c4d53ed54a5d1abe3e6a6d957d25de444e7a67eb8d615dd` | `e237b8b702e1113c4289a8cacafbff7d27937a031a1b292bce196c287c4d2031` | `207d4a936d1e3e6d917a3bf29e5dd7b3720d7ddc77cbea06bc1ac4e44980f425` | `8270e599fb43229b21de13d6588a627cead74fcdd607f197563288a9a7c41d37` | `0f8f98a950816c3294bb1258c45c46e2c47e001fb918149a06aec6fdb927d10f` |
| `react-basic` | provisional | `d7b257321a8a509a79c5d05cf7e4fa23f7562f7f5c32fc2428a89f4850b643dc` | `d729da9c5c56244283e27e4612be7533379b7d88f83a4cc105e03e7120a207dd` | `3313a9beea33eb310f99d2af4af9e868d4a2fc1148db9eb887da69125a5bd11b` | `eab4bafae93d69ed1a64c3b7bd87d41c23c3c3ddb87e9d406b091664a4d65ecd` | `6e0fd5b301d74480aa66e280421584da78aa798173dbf4d1dd2d1fb16d8bc87d` |
| `react-chat` | provisional | `c1454b7415e561082b084fc035e90ab2b045f847c8e937d204d9f122b3e956ff` | `d7d1e23a3a28e8fb35773043f5c0cb8bf022723801094216a85919c429ef44a4` | `e43f0d1bc4eea6f87c27f41440006743ea1d7f9129e5fc093d66085726210902` | `5356200ed3c0d62b0802ec5b07e1deb537dc29859793c2dd110d4b8e8b0d0b4a` | `4ea97f950e2d5e3580f09084ac0aecca2d46747a5cbbb5024f9d931e710cd54e` |

## Retention comparison

| Flavor | State | Chat minus basic minified bytes | Chat minus basic gzip bytes |
| --- | --- | --: | --: |
| js | provisional | 123344 | 37046 |
| react | provisional | 106904 | 31320 |

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

Candidate ranking waits for the verified baseline and complete attribution.

## Candidate experiment

No production candidate is measured or selected in this report.

## Reproduction

```sh
fnm use 20.19.0
test "$(node --version)" = "v20.19.0"
test "$(YARN_IGNORE_PATH=1 yarn --version)" = "1.22.22"
YARN_IGNORE_PATH=1 yarn install --frozen-lockfile
test ! -e packages/instantsearch.js/es
test ! -e packages/react-instantsearch/dist
test ! -e packages/react-instantsearch-core/dist
test ! -e packages/instantsearch-ui-components/dist
test ! -e packages/algoliasearch-helper/dist
YARN_IGNORE_PATH=1 yarn build:ci
node scripts/consumer-bundle-size/measure.mjs --runs 1 --status provisional
```

## Candidate ranking reproduction

The clean verified measurement command always writes `candidates: []`. Candidate selection happens afterward and does not rerun measurement.

After attribution review, provide the three selected candidate records as JSON encoded with base64:

```sh
node scripts/consumer-bundle-size/measure.mjs --rank-candidates --candidate-payload <base64-candidate-array>
```

Focused ranking lifecycle test:

```sh
node scripts/consumer-bundle-size/measure.mjs --test-ranking-workflow
```
