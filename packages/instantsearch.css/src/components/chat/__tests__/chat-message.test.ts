/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { compileString } from 'sass';

const CHAT_DIR = resolve(__dirname, '..');

// Sass cannot reach the filesystem itself under the jsdom environment, so `@use`
// is resolved here with Node's own reader. The URL is built from the environment's
// own `URL` global because Sass rejects one from another realm.
const scssImporter = {
  canonicalize(url: string) {
    const path = resolve(CHAT_DIR, url.replace(/^file:\/\//, ''));
    const candidates = [path, `${path}.scss`, resolve(path, 'index.scss')];
    const found = candidates.find((candidate) => existsSync(candidate));
    return found ? new URL(`file://${found}`) : null;
  },
  load(canonicalUrl: URL) {
    return {
      contents: readFileSync(canonicalUrl.pathname, 'utf8'),
      syntax: 'scss' as const,
    };
  },
};

function compileChatStylesheet(name: string) {
  const path = resolve(CHAT_DIR, name);
  return compileString(readFileSync(path, 'utf8'), {
    importers: [scssImporter],
  }).css;
}

describe('Chat message styles', () => {
  test('spaces adjacent message parts without the built-in reasoning element', () => {
    const style = document.createElement('style');
    style.textContent = compileChatStylesheet('_chat-message.scss');
    document.head.appendChild(style);

    // A custom reasoning renderer replaces `.ais-ChatMessageReasoning`, so the
    // spacing must not depend on that element being in the message.
    const message = document.createElement('div');
    message.className = 'ais-ChatMessage-message';
    message.innerHTML = `
      <div class="custom-reasoning">first thought</div>
      <div class="ais-ChatMessage-tool">tool</div>
    `;
    document.body.appendChild(message);

    const computed = getComputedStyle(message);
    expect(computed.display).toBe('flex');
    expect(computed.flexDirection).toBe('column');
    // The spacing is the one the built-in disclosure already used, not a new value.
    expect(computed.gap).toBe('calc(var(--ais-spacing) * 0.5)');
  });

  test('leaves the inline loader to the container spacing', () => {
    // The inline loader is a direct child of `.ais-ChatMessage-message`, so it is
    // a part row like any other. Flex gap does not collapse with an item's own
    // margin, so a `margin-top` here would add to the container gap instead of
    // replacing it. Asserted against the compiled rule rather than a computed
    // style because jsdom drops `calc()` margins, which would pass either way.
    const css = compileChatStylesheet('_chat-message-loader.scss');
    const inlineRule = css
      .split('}')
      .find((rule) => rule.includes('.ais-ChatMessageLoader--inline'))!;

    expect(inlineRule).toContain('gap:');
    expect(inlineRule).not.toContain('margin-top');
  });

  test('scrolls wide markdown blocks inside the message instead of the list', () => {
    const style = document.createElement('style');
    style.textContent = compileChatStylesheet('_chat-message.scss');
    document.head.appendChild(style);

    // The markdown renderer emits unclassed `pre` and `table` in a bare span.
    // jsdom has no layout, so this pins the rules and not the overflow itself.
    const message = document.createElement('div');
    message.className = 'ais-ChatMessage-message';
    message.innerHTML = `
      <span>
        <pre>a very long line of code</pre>
        <table><tbody><tr><td>cell</td></tr></tbody></table>
        <table class="tool-table"><tbody><tr><td>cell</td></tr></tbody></table>
      </span>
    `;
    document.body.appendChild(message);

    expect(getComputedStyle(message.querySelector('pre')!).overflowX).toBe(
      'auto'
    );
    expect(getComputedStyle(message.querySelector('table')!).overflowX).toBe(
      'auto'
    );
    expect(getComputedStyle(message.querySelector('table')!).display).toBe(
      'block'
    );
    // A short table stays as wide as its content instead of filling the message.
    // jsdom does not compute `max-content`, so this reads the compiled rule.
    expect(style.textContent).toMatch(
      /table:not\(\[class\]\) \{[^}]*width: max-content/
    );
    expect(
      getComputedStyle(message.querySelector('table.tool-table')!).display
    ).not.toBe('block');
  });
});
