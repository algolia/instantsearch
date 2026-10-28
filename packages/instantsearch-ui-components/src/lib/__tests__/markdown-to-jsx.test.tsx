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

  test('makes code blocks keyboard-focusable scroll regions', () => {
    const pre = (() => {
      const container = document.createElement('div');
      container.innerHTML = renderMarkdown('```js\nconst a = 1;\n```');
      return container.querySelector('pre')!;
    })();

    expect(pre.getAttribute('tabindex')).toBe('0');
    expect(pre.getAttribute('role')).toBe('region');
    expect(pre.getAttribute('aria-label')).toBe('Code');
  });

  test('wraps tables in a keyboard-focusable scroll region that keeps table semantics', () => {
    const container = document.createElement('div');
    container.innerHTML = renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |');
    const wrapper = container.querySelector('.ais-ChatMessage-tableScroll')!;

    expect(wrapper.getAttribute('tabindex')).toBe('0');
    expect(wrapper.getAttribute('role')).toBe('region');
    expect(wrapper.getAttribute('aria-label')).toBe('Table');
    expect(wrapper.firstElementChild!.tagName).toBe('TABLE');
    expect(wrapper.querySelector('table')!.hasAttribute('role')).toBe(false);
  });

  test('labels code blocks and tables with the given text', () => {
    const container = document.createElement('div');
    container.innerHTML = renderMarkdown(
      '```js\nconst a = 1;\n```\n\n| a | b |\n| - | - |\n| 1 | 2 |',
      { codeBlockLabel: 'Bloc de code', tableLabel: 'Tableau' }
    );

    expect(container.querySelector('pre')!.getAttribute('aria-label')).toBe(
      'Bloc de code'
    );
    expect(
      container
        .querySelector('.ais-ChatMessage-tableScroll')!
        .getAttribute('aria-label')
    ).toBe('Tableau');
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
