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

  test('ends bare URLs before trailing punctuation', () => {
    expect(
      renderMarkdown('See https://www.algolia.com/doc?q=1. Thanks')
    ).toContain(
      '<a href="https://www.algolia.com/doc?q=1">https://www.algolia.com/doc?q=1</a>. Thanks'
    );
  });

  test.each([
    [
      '详情请访问https://www.algolia.com了解更多。',
      'https://www.algolia.com',
      '了解更多。',
    ],
    [
      '詳しくはhttps://www.algolia.com/jp/をご覧ください。',
      'https://www.algolia.com/jp/',
      'をご覧ください。',
    ],
    [
      '자세한 내용은 https://www.algolia.com에서 확인하세요.',
      'https://www.algolia.com',
      '에서 확인하세요.',
    ],
    [
      '请访问 https://www.algolia.com，然后注册。',
      'https://www.algolia.com',
      '，然后注册。',
    ],
    ['官网：https://www.algolia.com。', 'https://www.algolia.com', '。'],
  ])('ends bare URLs where CJK text starts: %s', (markdown, url, rest) => {
    expect(renderMarkdown(markdown)).toContain(
      `<a href="${url}">${url}</a>${rest}`
    );
  });

  test('does not parse raw HTML', () => {
    const html = renderMarkdown('<b>hi</b>');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;b&gt;hi&lt;/b&gt;');
  });

  test('renders alert blockquotes', () => {
    expect(renderMarkdown('> [!NOTE]\n> hi')).toContain(
      '<blockquote class="markdown-alert-note">'
    );
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
