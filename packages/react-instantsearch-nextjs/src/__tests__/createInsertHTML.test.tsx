/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import React from 'react';

import { createInsertHTML } from '../createInsertHTML';

import type { InitialResults } from 'instantsearch.js';

const results = {
  indexName: { state: {}, results: [{ hits: [] }] },
} as unknown as InitialResults;

/** Returns the `__html` of every injected `<script>` element, in order. */
function scriptHtml(element: React.ReactElement<any>): string[] {
  if (element.type === 'script') {
    return [element.props.dangerouslySetInnerHTML.__html];
  }
  // Fragment: read each script child's payload.
  const children = React.Children.toArray(
    element.props.children
  ) as Array<React.ReactElement<any>>;
  return children.map((child) => child.props.dangerouslySetInnerHTML.__html);
}

describe('createInsertHTML', () => {
  test('injects only the results script when no chat states are provided', () => {
    const element = createInsertHTML({
      options: { inserted: false },
      results,
    })();

    expect(element.type).toBe('script');
    const [html] = scriptHtml(element);
    expect(html).toContain('InstantSearchInitialResults');
    expect(html).not.toContain('InstantSearchInitialChatStates');
  });

  test('injects nothing once the state has already been inserted', () => {
    const element = createInsertHTML({
      options: { inserted: true },
      results,
    })();

    // An empty fragment: no script children.
    expect(element.type).toBe(React.Fragment);
    expect(scriptHtml(element)).toEqual([]);
  });

  test('injects a second script with the chat states when provided', () => {
    const element = createInsertHTML({
      options: { inserted: false },
      results,
      chatStates: { 'on-page-suggestions': { suggestions: ['A', 'B'] } },
    })();

    expect(element.type).toBe(React.Fragment);
    const [resultsHtml, chatHtml] = scriptHtml(element);

    expect(resultsHtml).toContain('InstantSearchInitialResults');
    expect(chatHtml).toContain('InstantSearchInitialChatStates');
    expect(chatHtml).toContain('suggestions');
    expect(chatHtml).toContain('"A"');
  });

  test('escapes the chat-states payload so it cannot break out of the script tag', () => {
    // A malicious value that would close the <script> tag if injected raw.
    const element = createInsertHTML({
      options: { inserted: false },
      results,
      chatStates: { evil: '</script><script>alert(1)</script>' },
    })();

    const [, chatHtml] = scriptHtml(element);

    // The `<` / `>` are escaped to their unicode form...
    expect(chatHtml).toContain('\\u003c/script\\u003e');
    // ...so no raw closing tag survives in the serialized payload.
    expect(chatHtml).not.toContain('</script>');
    expect(chatHtml).not.toContain('<script>');
  });

  test('applies the provided nonce to both injected scripts', () => {
    const element = createInsertHTML({
      options: { inserted: false },
      results,
      chatStates: { 'on-page-suggestions': {} },
      nonce: 'csp-nonce',
    })();

    const children = React.Children.toArray(
      (element.props as { children?: React.ReactNode }).children
    ) as React.ReactElement[];

    expect(children).toHaveLength(2);
    children.forEach((child) => {
      expect((child.props as { nonce?: string }).nonce).toBe('csp-nonce');
    });
  });
});
