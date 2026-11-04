/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { html } from 'htm/preact';
import { warning } from 'instantsearch-core';

import {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../../../helpers/components';
import { renderTemplate } from '../renderTemplate';

import type { TemplateParams } from '../../../types';

describe('renderTemplate', () => {
  afterEach(() => {
    warning.cache = {};
  });

  it('returns string templates as they are', () => {
    expect(
      renderTemplate({
        templateKey: 'test',
        templates: { test: 'it works with strings' },
      })
    ).toBe('it works with strings');
  });

  it('expect to process templates as function', () => {
    const templateKey = 'test';
    const data = { type: 'functions' };
    const templates = {
      test: (d: typeof data) => `it works with ${d.type}`,
    };

    const actual = renderTemplate({
      templateKey,
      templates,
      data,
    });

    const expectation = 'it works with functions';

    expect(actual).toBe(expectation);
  });

  it('renders a template returning a VNode', () => {
    const templates = {
      test: ({ name }: { name: string }, { html: h }: TemplateParams) =>
        h`<strong>${name}</strong>`,
    };

    expect(
      renderTemplate({
        templateKey: 'test',
        templates,
        data: { name: 'world' },
      })
    ).toMatchObject({ type: 'strong', props: { children: 'world' } });
  });

  it('renders a template returning null', () => {
    expect(
      renderTemplate({ templateKey: 'test', templates: { test: () => null } })
    ).toBeNull();
  });

  it('passes `html`, `components` and `sendEvent` to the template', () => {
    const sendEvent = jest.fn();
    const template = jest.fn(() => 'rendered');

    renderTemplate({
      templateKey: 'test',
      templates: { test: template },
      data: { id: 1 },
      sendEvent,
    });

    expect(template).toHaveBeenCalledTimes(1);
    expect(template).toHaveBeenCalledWith(
      { id: 1 },
      expect.objectContaining({
        html,
        sendEvent,
        components: { Highlight, ReverseHighlight, Snippet, ReverseSnippet },
      })
    );
  });

  it('expect to throw when the template is not a function or a string', () => {
    const actual0 = () =>
      renderTemplate({
        templateKey: 'test',
        templates: {},
      });

    const actual1 = () =>
      renderTemplate({
        templateKey: 'test',
        // @ts-expect-error wrong usage
        templates: { test: null },
      });

    const actual2 = () =>
      renderTemplate({
        templateKey: 'test',
        // @ts-expect-error wrong usage
        templates: { test: 10 },
      });

    const expectation0 = `Template must be 'string' or 'function', was 'undefined' (key: test)`;
    const expectation1 = `Template must be 'string' or 'function', was 'object' (key: test)`;
    const expectation2 = `Template must be 'string' or 'function', was 'number' (key: test)`;

    expect(() => actual0()).toThrow(expectation0);
    expect(() => actual1()).toThrow(expectation1);
    expect(() => actual2()).toThrow(expectation2);
  });

  describe('strings that look like markup', () => {
    it('warns with migration instructions for a Hogan.js template', () => {
      expect(() =>
        renderTemplate({
          templateKey: 'item',
          templates: { item: '<div>{{name}}</div>' },
        })
      )
        .toWarnDev(`[InstantSearch.js]: The "item" template is a string that looks like HTML or a Hogan.js template. Strings are rendered as text, so HTML tags, entities and {{ }} placeholders show up as written.

Use a function template with the provided \`html\` function or JSX instead:

  item: (data, { html }) => html\`...\`

See: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#upgrade-templates`);
    });

    it.each([
      ['an HTML tag', '<b>bold</b>'],
      ['a closing tag', 'text</span>'],
      ['a Hogan.js placeholder', 'Hello {{name}}'],
      ['a named entity', 'Next &rsaquo;'],
      ['a numeric entity', 'Next &#8250;'],
    ])('warns for a string template with %s', (_, template) => {
      expect(() =>
        renderTemplate({ templateKey: 'test', templates: { test: template } })
      ).toWarnDev();
    });

    it('warns for a string returned by a function template', () => {
      expect(() =>
        renderTemplate({
          templateKey: 'test',
          templates: { test: () => '<b>bold</b>' },
        })
      ).toWarnDev();
    });

    it.each(['Results', '1 < 2', 'Tom & Jerry', ''])(
      'does not warn for plain text %p',
      (template) => {
        expect(() =>
          renderTemplate({ templateKey: 'test', templates: { test: template } })
        ).not.toWarnDev();
      }
    );
  });
});
