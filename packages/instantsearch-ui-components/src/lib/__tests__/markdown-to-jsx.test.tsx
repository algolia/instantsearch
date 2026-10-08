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

describe('vendored markdown-to-jsx backtracking', () => {
  // These inputs took seconds in upstream's regexes (cubic in the input
  // length); the budget is far above the time they take now.
  function timeOf(run: () => void) {
    const start = performance.now();
    run();
    return performance.now() - start;
  }

  test('a long run of backticks is parsed in linear-ish time', () => {
    expect(timeOf(() => renderMarkdown('`'.repeat(3000)))).toBeLessThan(500);
  });

  test('unclosed HTML block elements are parsed in linear-ish time', () => {
    const html = { disableParsingRawHTML: false, forceInline: true };

    expect(
      timeOf(() => renderMarkdown('<div>'.repeat(1500) + 'text', html))
    ).toBeLessThan(500);
  });

  test('unterminated HTML tags are parsed in linear-ish time', () => {
    const html = { disableParsingRawHTML: false, forceInline: true };

    expect(
      timeOf(() => renderMarkdown('<a>' + '<b '.repeat(1500), html))
    ).toBeLessThan(500);
  });

  test('inline code spans still match their closing run of backticks', () => {
    expect(renderMarkdown('`a`')).toContain('<code>a</code>');
    expect(renderMarkdown('``a`b``')).toContain('<code>a`b</code>');
    expect(renderMarkdown('text `one` and `two`')).toContain(
      '<code>one</code> and <code>two</code>'
    );
  });

  test('an opening run of backticks longer than the closing run no longer opens a code span with a shorter opener', () => {
    // Used to render a code span containing "`x"; now the extra backtick is
    // plain text and the remaining run of two opens the code span.
    expect(renderMarkdown('```x``')).toBe(
      '<span><span>`<code>x</code></span></span>'
    );
  });

  test('HTML elements are still parsed when HTML parsing is enabled', () => {
    const html = { disableParsingRawHTML: false };

    expect(renderMarkdown('<div>hi</div>', html)).toContain('<div>hi</div>');
    expect(renderMarkdown('before<br/>after', html)).toContain('<br');
    expect(renderMarkdown('<Div>hi</div>', html)).toContain('hi</div>');
    expect(renderMarkdown('<b>one</b> and <i>two</i>', html)).toContain(
      '<b>one</b>'
    );
  });
});
