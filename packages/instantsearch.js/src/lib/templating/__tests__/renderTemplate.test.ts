/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { html } from 'htm/preact';

import {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../../../helpers/components';
import { renderTemplate } from '../renderTemplate';

import type { TemplateParams } from '../../../types';

describe('renderTemplate', () => {
  it('renders a template returning a string', () => {
    const data = { type: 'functions' };
    const templates = {
      test: (d: typeof data) => `it works with ${d.type}`,
    };

    expect(renderTemplate({ templateKey: 'test', templates, data })).toBe(
      'it works with functions'
    );
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
    const templates = { test: () => null };

    expect(renderTemplate({ templateKey: 'test', templates })).toBeNull();
  });

  it('passes `html`, `components` and `sendEvent` to the template', () => {
    const sendEvent = jest.fn();
    const template = jest.fn(() => 'rendered');
    const templates = { test: template };

    renderTemplate({
      templateKey: 'test',
      templates,
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

  it('throws when the template is missing', () => {
    expect(() =>
      renderTemplate({ templateKey: 'test', templates: {} })
    ).toThrow(`Template must be a function, was 'undefined' (key: test).`);
  });

  it('throws when the template is not a function', () => {
    expect(() =>
      renderTemplate({
        templateKey: 'test',
        // @ts-expect-error wrong usage
        templates: { test: null },
      })
    ).toThrow(`Template must be a function, was 'object' (key: test).`);

    expect(() =>
      renderTemplate({
        templateKey: 'test',
        // @ts-expect-error wrong usage
        templates: { test: 10 },
      })
    ).toThrow(`Template must be a function, was 'number' (key: test).`);
  });

  it('throws with migration instructions when the template is a string', () => {
    expect(() =>
      renderTemplate({
        templateKey: 'item',
        templates: { item: '<div>{{name}}</div>' },
      })
    ).toThrowErrorMatchingInlineSnapshot(`
      "Template must be a function, was 'string' (key: item).

      String-based (Hogan.js) templates are no longer supported. Use a function template with the \`html\` tagged template or JSX instead:

        item: (data, { html }) => html\`...\`

      See: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#upgrade-templates"
    `);
  });
});
