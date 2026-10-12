# Renderer-neutral Markdown compiler feasibility

## Question

Can Chat use a renderer-neutral `markdown-to-jsx` compiler entry to remove React from the JavaScript bundle while preserving Markdown behavior and avoiding meaningful growth in the other consumers?

## Why JavaScript Chat retained React

The existing JavaScript Chat graph retained React through the default `markdown-to-jsx` entry, even though InstantSearch already provides the renderer's `createElement` function. The baseline attribution contained five React records:

| React record                    | Rendered bytes |
| ------------------------------- | -------------: |
| `react/cjs/react.production.js` |         17,911 |
| `react/index.js`                |            195 |
| Three CommonJS interop records  |             86 |
| **Total**                       |     **18,192** |

These values are Rollup rendered-module lengths, not gzip bytes. They prove that React was retained in the graph but do not directly measure the final bundle saving.

The experiment used a standalone compiler entry that shares the existing parser and rendering behavior but requires the caller to provide `createElement`. It has no React runtime import or fallback.

## Provisional bundle comparison

Deltas are candidate minus baseline.

| Consumer | Baseline minified | Candidate minified | Delta | Baseline gzip | Candidate gzip | Delta |
| --- | --: | --: | --: | --: | --: | --: |
| JavaScript basic | 167,044 bytes | 167,044 bytes | 0 bytes | 46,530 bytes | 46,530 bytes | 0 bytes |
| JavaScript Chat | 290,388 bytes | 284,003 bytes | -6,385 bytes | 83,576 bytes | 81,117 bytes | -2,459 bytes |
| React basic | 323,255 bytes | 323,255 bytes | 0 bytes | 94,642 bytes | 94,642 bytes | 0 bytes |
| React Chat | 430,159 bytes | 431,167 bytes | +1,008 bytes | 125,962 bytes | 126,013 bytes | +51 bytes |

React and ReactDOM are absent from the candidate JavaScript Chat graph. The standalone Markdown compiler remains, with 16,456 rendered bytes. Both basic consumers are unchanged; React Chat grows by 51 gzip bytes.

## Validation

- The dependency passed 243 tests and 236 snapshots. The complete root-versus-standalone compiler corpus matched, package resolution passed for ESM, CommonJS, TypeScript's Node resolver and Jest 27, and the standalone runtime had no React edge.
- The full build completed across 12 projects. Type checking, changed-file linting, package export checks, the focused declaration build and source-language checks passed.
- Focused and broader Chat coverage passed: 34 ChatMessage tests, 47 ChatMessages tests, 10 JavaScript Chat tests, 6 React Chat tests and 180 common JavaScript/React Chat tests. The complete connector and shared Chat UI command surfaces added 64 and 122 passing tests respectively.
- All six browser cells passed for JavaScript Chat and React Chat in Chromium, Firefox and WebKit. Markdown rendering, reasoning, streaming updates, unsafe links and raw HTML behaved as expected, with no unexpected console errors, page errors, unhandled rejections or non-loopback requests. React Chat also passed its plain-text rendering check.

## Limitations

- The comparison is one provisional measurement run, not verified three-run evidence.
- The dependency is a local unpublished artifact.
- InstantSearch uses `markdown-to-jsx` 7.7.15, while upstream is on 9.10.1.
- This report does not propose a production InstantSearch change or an upstream package change.

## Conclusion

Local feasibility is proven: a renderer-neutral Markdown compiler entry removes React from JavaScript Chat and produces the measured saving without breaking the completed compatibility surfaces.

Production consideration would require durable ownership and release of the dependency entry, followed by a verified three-run measurement against that durable dependency.
