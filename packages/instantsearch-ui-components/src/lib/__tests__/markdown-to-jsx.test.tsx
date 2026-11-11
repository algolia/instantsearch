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
      '<a href="https://www.algolia.com">https://www.algolia.com</a>了解更多。',
    ],
    [
      '詳しくはhttps://www.algolia.com/jp/をご覧ください。',
      '<a href="https://www.algolia.com/jp/">https://www.algolia.com/jp/</a>をご覧ください。',
    ],
    [
      '자세한 내용은 https://www.algolia.com에서 확인하세요.',
      '<a href="https://www.algolia.com">https://www.algolia.com</a>에서 확인하세요.',
    ],
    [
      '请访问 https://www.algolia.com，然后注册。',
      '<a href="https://www.algolia.com">https://www.algolia.com</a>，然后注册。',
    ],
    [
      '官网：https://www.algolia.com。',
      '<a href="https://www.algolia.com">https://www.algolia.com</a>。',
    ],
  ])('ends bare URLs where CJK text starts: %s', (markdown, expected) => {
    expect(renderMarkdown(markdown)).toContain(expected);
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

  test('closes spans that are still open at the end of the text', () => {
    expect(renderMarkdown('Try **bold')).toContain('<strong>bold</strong>');
    expect(renderMarkdown('Was ~~gone')).toContain('<del>gone</del>');
    expect(renderMarkdown('Run `npm')).toContain('<code>npm</code>');
  });

  test('keeps closed spans that start with a space', () => {
    expect(renderMarkdown('** foo**')).toContain('<strong> foo</strong>');
    expect(renderMarkdown('~~ foo~~')).toContain('<del> foo</del>');
  });

  test('leaves a marker that cannot open a span as text', () => {
    expect(renderMarkdown('2 ** 3 = 8')).toContain('2 ** 3 = 8');
    expect(renderMarkdown('Price is 5*')).toContain('Price is 5*');
  });

  // Every streamed delta is parsed again, so a quadratic scan of the reply
  // would freeze the page on adversarial model output.
  test.each([
    ['spaces after a bold marker', `**${' '.repeat(50000)}x`],
    ['spaces after a strikethrough marker', `~~${' '.repeat(50000)}x`],
    ['spaces before a marker', `${' '.repeat(50000)}x*`],
    ['indented lines', `**${'\n   '.repeat(20000)}x`],
    ['backticks after a bold marker', `**a${'`'.repeat(20000)}`],
    ['an unclosed bold marker', `**${'word '.repeat(20000)}`],
  ])('parses %s in linear-ish time', (_, markdown) => {
    const start = performance.now();
    compiler(markdown, { createElement: createElement as any });

    expect(performance.now() - start).toBeLessThan(500);
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
