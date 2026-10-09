/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { createElement, render } from 'preact';

import { RuleType, compiler } from '../markdown-to-jsx';

function renderMarkdown(
  markdown: string,
  options: Partial<Parameters<typeof compiler>[1]> = {}
) {
  const container = document.createElement('div');
  render(
    <span>
      {compiler(markdown, {
        createElement: createElement as any,
        disableParsingRawHTML: true,
        ...options,
      })}
    </span>,
    container
  );
  return container.innerHTML;
}

describe('vendored markdown-to-jsx', () => {
  test('renders emphasis, links, code and lists with the injected createElement', () => {
    expect(renderMarkdown('**bold** and _em_')).toBe(
      '<span><span><strong>bold</strong> and <em>em</em></span></span>'
    );
    expect(renderMarkdown('[Algolia](https://www.algolia.com)')).toContain(
      '<a href="https://www.algolia.com">Algolia</a>'
    );
    expect(renderMarkdown('`code`')).toContain('<code>code</code>');
    expect(renderMarkdown('- one\n- two')).toContain(
      '<ul><li>one</li><li>two</li></ul>'
    );
  });

  test('does not parse raw HTML when `disableParsingRawHTML` is set', () => {
    expect(renderMarkdown('<b>hi</b>')).not.toContain('<b>');
  });

  test('exposes the rule types', () => {
    expect(RuleType.paragraph).toBeDefined();
  });

  test('requires a `createElement` option', () => {
    expect(() => compiler('hello', {} as any)).toThrow(
      'the `createElement` option is required'
    );
  });
});
