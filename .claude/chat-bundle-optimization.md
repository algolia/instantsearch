# Chat Widget Bundle Optimization

Measured against `examples/js/e-commerce` with the chat widget added. All sizes are gzipped (wire size). Baseline = app without chat.

## Baseline measurements

| Asset                 | Raw     | Gzip    |
| --------------------- | ------- | ------- |
| Initial JS (no chat)  | 282 kB  | 79.2 kB |
| Initial CSS (no chat) | 21.4 kB | 5.0 kB  |

## After adding chat (static import, everything eager)

| Asset       | Raw      | Gzip     | Delta gz |
| ----------- | -------- | -------- | -------- |
| Initial JS  | 376.9 kB | 110.2 kB | +31.0 kB |
| Initial CSS | 48.6 kB  | 8.9 kB   | +4.0 kB  |

---

## App-level guidance (not a library change)

### Dynamic import of the chat widget

**Impact: −31 kB gz from initial JS**

**App change only — no package work needed**

Split the chat widget into a lazy chunk so it doesn't block the initial page render. The chunk loads immediately after the main bundle (or on first interaction, depending on preference), so perceived load time for chat is only marginally delayed. This is the single highest-impact change available and requires no library work — it belongs in integration guides and example apps.

```ts
// Instead of:
import { chat } from 'instantsearch.js/es/widgets';
search.addWidgets([chat({ container: '#chat', agentId: '...' })]);

// Use:
import('instantsearch.js/es/widgets/chat/chat').then(({ default: chat }) => {
  search.addWidgets([chat({ container: '#chat', agentId: '...' })]);
});
```

Measured result:

| Asset           | Gzip                 |
| --------------- | -------------------- |
| Initial JS      | 79.9 kB (≈ baseline) |
| Lazy chat chunk | 30.4 kB              |

**Things to be careful of:**

- `search.addWidgets()` can be called after `search.start()` — this works fine at runtime. Widgets mount and catch up with the current UI state.
- If the chat widget renders a toggle button in the page, there will be a brief moment before it appears. Usually imperceptible since the dynamic import resolves immediately, but worth testing on slow connections. Consider a placeholder in HTML.
- SSR / Next.js: dynamic `import()` inside a `useEffect` is the right pattern. Avoid calling `addWidgets` during server render.
- The chat CSS should still be loaded **statically** — lazy-loading `chat-min.css` is a net loss because it re-bundles the full reset, losing deduplication. See §5 for the right CSS fix.

---

## Items to implement

### 1. Replace `markdown-to-jsx` with a lighter renderer

**Impact: −9.5 kB gz from the lazy chat chunk (30.4 → ~21 kB gz)**

**Effort: medium — change in `instantsearch-ui-components`**

**Breaking: minor (markdown rendering fidelity)**

`markdown-to-jsx` (20 kB unminified, ~9.5 kB gz contribution) is a spec-compliant markdown parser. It's only used in one place: `packages/instantsearch-ui-components/src/components/chat/ChatMessage.tsx` to render AI response text.

AI-generated chat responses in practice only use: bold, italic, inline code, fenced code blocks, ordered/unordered lists, and links. A spec-compliant parser is overkill.

Candidates (smaller alternatives):

- `snarkdown` (~1 kB) — covers bold, italic, code, links, lists, but returns an HTML **string**, not VNodes (see below)
- `marked` (~30 kB) — larger, not a win
- Custom VNode renderer (~1–2 kB) — purpose-built for the patterns AI models actually produce

The replacement must return a virtual DOM node tree (not an HTML string), compatible with both Preact's `h` and React's `createElement`. `snarkdown` and similar string-based renderers would require `dangerouslySetInnerHTML` / `v-html` which opens an XSS vector — AI-generated content would become unescaped HTML in the DOM. A custom renderer that builds VNodes directly avoids this.

The key scoping point: this is **not** a reimplementation of markdown-to-jsx at full spec parity. AI chat responses in practice use at most 7 patterns: bold, italic, inline code, fenced code blocks, unordered lists, ordered lists, and links. A recursive descent parser for that subset is ~100–150 lines plus ~50 lines for VNode construction — well under 2 kB. The failure mode for any unsupported syntax (e.g. tables, footnotes) is that it renders as raw text, not a crash.

```ts
// hypothetical minimal renderer
function renderMarkdown(text: string, createElement: Pragma): VNode {
  // handle bold, italic, code, links, lists
  // return createElement(...) tree
}
```

**Things to be careful of:**

- **Before starting**: audit a sample of real agent responses to confirm the 7 patterns cover what's actually generated. If the AI routinely produces tables or blockquotes, the scope expands.
- The current `markdown-to-jsx` API is `compiler(text, options)` and returns a VNode. The replacement must match this signature or the call site in `ChatMessage.tsx` needs updating.
- This is a **visual breaking change**: unsupported syntax renders as raw text. Test against realistic chat conversations before shipping.
- If users are relying on full markdown fidelity (e.g. tables in AI responses), they'll notice the regression.

---

### 2. Per-framework static builds of `instantsearch-ui-components`

**Impact: −3 kB gz (factory boilerplate) + unlocks further tree-shaking**

**Effort: high — build pipeline change, API change**

**Breaking: yes (import path / API shape)**

The current design injects `createElement` and `Fragment` at runtime:

```ts
import { createChatComponent } from 'instantsearch-ui-components';
import { h, Fragment } from 'preact';

const Chat = createChatComponent({ createElement: h, Fragment });
```

This was chosen so one package serves both Preact (instantsearch.js) and React (react-instantsearch) without duplicating component code. The cost:

1. Every component is wrapped in a factory function that destructures `createElement` from its argument. That wrapper is dead weight in the final bundle.
2. Bundlers cannot statically analyze `createElement` (it's a runtime variable), which blocks `/*#__PURE__*/` annotations and automatic JSX runtime optimizations (see §2a below for detail).
3. The SWC pragma-fix plugin (`createJsxPragmaFixPlugins`) exists solely to work around a collision between the `@jsx createElement` pragma and the destructured `createElement` parameter — this entire workaround disappears with static imports.

**Proposed structure:**

```
packages/instantsearch-ui-components/
  src/                    (framework-neutral source, unchanged)
  rollup.config.mjs       (add two new output targets)
  dist/
    es/                   (current: factory pattern, kept for compat)
    cjs/                  (current: factory pattern, kept for compat)
    react/                (new: static React.createElement imports)
    preact/               (new: static Preact h imports)
```

Each framework build runs the same source through a Rollup plugin that replaces `var createElement = param.createElement` with a static import at the top of each file.

Consumers update their import:

```ts
// instantsearch.js (preact flavor)
import { Chat } from 'instantsearch-ui-components/preact';
// No createChatComponent, no createElement injection

// react-instantsearch
import { Chat } from 'instantsearch-ui-components/react';
```

**Things to be careful of:**

- **Major breaking change** for anyone using `createChatComponent`, `createButtonComponent`, etc. directly. These factory functions disappear or become no-ops. Needs a major version bump or a deprecation period.
- Users with custom frameworks (e.g., custom Preact setup with non-standard compat) who relied on the factory injection pattern will need to adapt.
- The Vue flavor currently does not use `instantsearch-ui-components` at all (Vue components are written as `.vue` SFCs directly). No change needed for Vue, but worth noting as a future opportunity (see §3).
- `react-instantsearch` wraps the UI components in its own connector layer. The `src/ui/Internal*.tsx` files that currently call `create*Component` would need to import from `instantsearch-ui-components/react` instead.
- TypeScript types: the factory functions have complex generic type signatures. Ensure the new static-import components expose equivalent prop types.
- Test with `preact/compat` aliasing scenarios — some apps alias `react` to `preact/compat`. The new `/react` build would work transparently in those setups.
- Ensure that this still works with the esm and cjs builds, and that the new paths work for both React and Preact consumers without causing confusion.

#### 2a. `/*#__PURE__*/` annotations and why the factory pattern blocks them

`/*#__PURE__*/` is a comment convention understood by Terser, esbuild, and Rollup. When placed before a function call, it tells the bundler: "this call has no side effects — if its return value is never used, the entire call can be removed." It is the primary mechanism for dead-code elimination of component definitions.

**Current state (factory pattern):**

The compiled `instantsearch.js` widget file (`es/widgets/chat/chat.js`) contains this at module level:

```js
var Chat = createChatComponent({
  createElement: h,
  Fragment: Fragment,
});
```

This call is **not** `/*#__PURE__*/`. The bundler must assume `createChatComponent(...)` has side effects and keep it, even if `Chat` is never rendered. The function call eagerly creates all sub-components (ChatHeader, ChatMessages, ChatPrompt, etc.), each of which closes over `createElement`. All of that runs at import time.

Inside the components, individual VNode creations do carry the annotation:

```js
return /*#__PURE__*/ createElement("svg", {...});
```

But that only helps if the _result_ of calling the icon function is unused — it doesn't help eliminate the icon function itself or the factory wrapper.

**What per-framework builds unlock:**

With static imports the module-level cost disappears entirely:

```js
// dist/preact/components/chat/Chat.js
import { h, Fragment } from 'preact';

export function Chat(props) {
    return /*#__PURE__*/ h('div', { className: 'ais-Chat' }, ...);
}
```

`Chat` is now a named export function declaration — not the result of a call expression. Bundlers can tree-shake it at the module level without `/*#__PURE__*/` at all, because function declarations are analyzed structurally. And every `h(...)` call inside carries the annotation, so unused sub-trees within a rendered component are also eliminatable.

**Quick win without per-framework builds:**

The `createChatComponent` call in `instantsearch.js/chat.tsx` (line 23 of the compiled output) could be manually annotated today:

```js
var Chat = /*#__PURE__*/ createChatComponent({ createElement: h, Fragment });
```

This would allow bundlers to eliminate the entire chat component creation when the chat widget is never added to an instantsearch instance. It doesn't fix the underlying factory pattern but is a low-effort improvement. The annotation is only valid if `createChatComponent` truly has no side effects (no globals written, no DOM touched) — confirm this is the case before adding it.

#### 2b. `@swc/helpers` overhead from the IE11 compile target

The SWC config in `scripts/build/rollup.plugins.mjs` sets:

```js
env: {
  targets: 'ie >= 11',
}
```

This forces SWC to downcompile modern syntax to ES5, which causes it to replace language features with helper imports:

| Syntax                       | Compiled to                                   |
| ---------------------------- | --------------------------------------------- |
| `{ ...spread }`              | `@swc/helpers/esm/_object_spread`             |
| `{ ...props, key }`          | `@swc/helpers/esm/_object_spread_props`       |
| `const { a, ...rest } = obj` | `@swc/helpers/esm/_object_without_properties` |
| `[...arr]`                   | `@swc/helpers/esm/_to_consumable_array`       |

These helpers appear across every chat component file. They're small individually (~500–900 bytes each) but add up across the whole component tree.

The IE11 target was appropriate for the UMD builds that go to `instantsearch.js/dist/` (the CDN/script-tag builds). It is **not** necessary for the ES module output (`dist/es/`) which is consumed by bundlers that target modern browsers. The ES module output's `env.targets` should be `'supports es6-module'` or similar, which would allow SWC to emit native spread syntax and drop all helper imports.

This is a change to `rollup.base.mjs` — the `createESMConfig` and `createCJSConfig` functions should accept or default to a modern `env.targets`, separate from the `createUMDConfig` which legitimately needs IE11.

Rough saving: difficult to measure precisely without rebuilding, but removing 4–6 helper imports across ~15 chat component files could save several kB from the lazy chunk.

---

### 3. Move icons out of JS (SVG sprite or CSS)

**Impact: −4 kB gz from the lazy chat chunk**

**Effort: medium — requires changing rendering approach for icons**

**Breaking: yes (customization API for icons)**

All 18 icons in `icons.js` end up in the bundle when chat is used. They're all genuinely needed (no unused icons to tree-shake):

- `instantsearch-ui-components` uses 15: SparklesIcon, ArrowUpIcon, StopIcon, MenuIcon, ReloadIcon, LoadingSpinnerIcon, ChevronDownIcon, CheckIcon, CopyIcon, ThumbsUpIcon, ThumbsDownIcon, ChevronUpIcon, CloseIcon, MaximizeIcon, MinimizeIcon
- `instantsearch.js` chat.tsx adds 3 more: ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon (for the carousel header)

Because each icon is a factory function (`SparklesIcon({ createElement })`), bundlers can't apply pure-function analysis across the factory boundary.

**Option A — SVG sprite (recommended)**

Publish a single `chat-icons.svg` alongside the JS package:

```html
<!-- in the page HTML, or injected by the widget init -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="ais-icon-sparkles" viewBox="0 0 20 20">...</symbol>
  <symbol id="ais-icon-close" viewBox="0 0 24 24">...</symbol>
  <!-- ... -->
</svg>
```

Icons in components become:

```tsx
function SparklesIcon() {
  return (
    <svg>
      <use href="#ais-icon-sparkles" />
    </svg>
  );
}
```

0 bytes of icon SVG path data in JS. The sprite file is separately cacheable and browser-gzip-friendly (repetitive structure).

**Option B — CSS `mask-image`**

```css
.ais-icon--sparkles {
  mask-image: url('data:image/svg+xml,...');
  mask-size: contain;
  background: currentColor;
  display: inline-block;
  width: 1em;
  height: 1em;
}
```

Components emit `<span class="ais-icon--sparkles" />`. No SVG in JS at all. SVG data in CSS compresses extremely well with gzip.

**Things to be careful of:**

- **Breaking for icon customization**: the current API lets consumers pass custom icon components (`closeIconComponent`, `titleIconComponent`, etc.) as props. If icons move to CSS/sprites, this prop API either goes away or needs a different shape (e.g., pass a sprite symbol ID string).
- SVG sprite: the sprite file must be present in the page. The widget would need to inject it on init, or document that consumers must include it. Injection via `innerHTML` into `document.body` is safe but adds an init side effect.
- CSS `mask-image`: IE11 doesn't support it (but IE11 support was already dropped — verify this is acceptable).
- High-contrast / forced-color mode in Windows: `mask-image` approach doesn't respect forced-color mode. SVG with `fill: currentColor` does. The sprite approach is safer here.

---

### 4. Replace `stickToBottom` spring physics with simple scroll lock

**Impact: −7 kB gz from the lazy chat chunk**

**Effort: medium — replaces a complex lib with simpler logic**

**Breaking: no (behavior change, not API change)**

`stickToBottom.ts` is a 693-line spring physics engine (ported from StackBlitz) that smoothly animates the chat scroll container as new message content streams in. Compiled it's 21 kB raw / ~7 kB gz.

The behavior it provides: when the user is scrolled to the bottom and new content arrives (streaming AI response), the scroll position animates smoothly to track the growing content. When the user scrolls up, it releases the lock.

A simpler replacement using `ResizeObserver` + `MutationObserver`:

```ts
function createScrollLock(container: HTMLElement) {
  let locked = true;

  const scrollToBottom = () => {
    container.scrollTop = container.scrollHeight;
  };

  const observer = new ResizeObserver(() => {
    if (locked) scrollToBottom();
  });
  observer.observe(container);

  container.addEventListener('scroll', () => {
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 8;
    locked = atBottom;
  });

  return { scrollToBottom, isAtBottom: () => locked };
}
```

~20 lines vs 693. The tradeoff is losing the spring animation — the scroll jumps instantly rather than gliding. This is only visible during streaming responses where content grows fast enough to notice the animation.

**Things to be careful of:**

- The current `useStickToBottom` hook exposes `scrollRef`, `contentRef`, `scrollToBottom`, and `isAtBottom` to `ChatWrapper`. The replacement must expose the same interface.
- Test on mobile (iOS Safari) where `scrollTop` assignment during resize events can be janky. May need `requestAnimationFrame` wrapping.
- The spring behavior is genuinely appreciated in demos and showcases. Consider making this opt-in: ship the simple version by default, allow passing a custom `scrollBehavior` prop for users who want the physics.
- `ResizeObserver` is widely supported (96%+ globally) but if there are older browser targets, confirm availability.

---

### 5. Incremental-only chat CSS (package change)

**Impact: −3 kB gz from initial CSS (for apps that already load reset CSS)**

**Effort: low — `instantsearch.css` packaging change**

**Breaking: no (new file alongside existing)**

`instantsearch.css/components/chat-min.css` (32 kB) bundles the full reset stylesheet alongside the chat-specific styles. This is intentional — makes it self-contained for apps that don't already load the reset.

The problem: apps that load `instantsearch.css/themes/reset.css` (21 kB) first and then also load `chat-min.css` send duplicate reset bytes. The reset is not deduplicated between the two files.

The diff between the baseline CSS and the with-chat CSS is ~27 kB raw / ~4 kB gz — that's the actual chat-specific styles. An incremental variant would publish only those styles without the bundled reset.

Add a new export to `instantsearch.css`:

```
dist/
  components/
    chat.css           (existing: standalone, includes reset)
    chat-min.css       (existing: standalone minified)
    chat-incremental.css      (new: chat styles only, no reset)
    chat-incremental-min.css  (new: chat styles only, minified)
```

The `chat.scss` entry currently starts with `@use '../themes/reset'`. A new `chat-incremental.scss` simply omits that line.

**Things to be careful of:**

- Document clearly that `chat-incremental.css` requires the reset CSS to be loaded first, or styles will be broken. The file name and docs must make this obvious.
- The current `chat.css` behavior is unchanged — existing consumers are unaffected.
- Verify that the button component styles (currently `@use 'button'` inside `chat.scss`) also pull in button reset styles transitively. The incremental version must still include component-level resets that aren't part of the global reset.

---

## Items investigated that had no significant impact

### Zod and `zod-to-json-schema`

Both are listed as dependencies in `instantsearch.js` and `instantsearch-ui-components` `package.json`, but **neither appears in any built output**. Searched across `es/`, `dist/`, and the final Vite bundle chunks — zero occurrences. They are fully tree-shaken. No action needed.

### Lazy-loading the chat CSS

Tested: moving `import 'instantsearch.css/components/chat-min.css'` from the main entry into the dynamic import callback (so CSS loads with the lazy chat chunk).

Result: **net loss**. The main CSS correctly drops back to baseline (21.4 kB), but the lazy CSS chunk is 32.2 kB gz — larger than the 27 kB delta when loaded statically — because `chat-min.css` is a standalone bundle that re-includes the full reset. Deduplication between the two CSS chunks is lost.

The right fix is §5 (incremental CSS), not lazy loading of the current file.

### Additional icon tree-shaking

All 18 icons in `icons.js` are genuinely used when the full chat widget is active (15 in `instantsearch-ui-components`, 3 in `instantsearch.js`). There are no unused icons to eliminate by tree-shaking. The only path to reducing icon weight is §3 (move icons out of JS).

---

## Combined effect if all items are implemented

Starting from the with-chat baseline (110.2 kB gz JS, 8.9 kB gz CSS):

| Item | JS saving | CSS saving |
| --- | --- | --- |
| Dynamic import (app-level) | −31 kB initial → lazy chunk | — |
| §1 Lighter markdown | −9.5 kB gz (from lazy chunk) | — |
| §2 Per-framework builds | −3 kB gz (from lazy chunk) | — |
| §2a `/*#__PURE__*/` quick win | small, unquantified | — |
| §2b Modern `env.targets` for ESM | small, unquantified | — |
| §3 CSS icons | −4 kB gz (from lazy chunk) | — |
| §4 Simpler stickToBottom | −7 kB gz (from lazy chunk) | — |
| §5 Incremental CSS | — | −3 kB gz (initial) |

**Floor estimate:**

- Initial JS: ~80 kB gz (≈ baseline, chat fully lazy — app-level change)
- Initial CSS: ~5 kB gz (≈ baseline, with incremental chat CSS)
- Lazy chat JS: ~6–7 kB gz (down from 30.4 kB)
- Lazy chat CSS: ~1–2 kB gz (chat-incremental, loaded with lazy chunk)

Recommended implementation order: §2b first (low-effort build config change, no API impact), then §2a (single-line annotation, immediately verifiable), then §1, then §4, then §3 and §5 together, then §2 last (most disruptive, needs a migration plan).
