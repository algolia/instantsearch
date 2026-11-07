/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */

import { render } from '@testing-library/preact';
import { h } from 'preact';

import { warning } from '../../../lib/utils';
import FunctionTemplate from '../FunctionTemplate';

import type { TemplateParams } from '../../../types';
import type { FunctionTemplateProps } from '../FunctionTemplate';

function getProps({
  templates = { test: '' },
  data = {},
  templateKey = 'test',
  rootProps = {},
  ...props
}: Partial<FunctionTemplateProps>) {
  return {
    ...props,
    templates,
    data,
    templateKey,
    rootProps,
  };
}

describe('FunctionTemplate', () => {
  afterEach(() => {
    warning.cache = {};
  });

  it('renders function templates returning VNodes', () => {
    const props = getProps({
      templates: {
        test: (data: { name: string }, { html }: TemplateParams) =>
          html`<span class="name">${data.name}</span>`,
      },
      data: { name: 'Algolia' },
      rootProps: { className: 'root' },
    });
    const { container } = render(<FunctionTemplate {...props} />);

    expect(container.innerHTML).toBe(
      '<div class="root"><span class="name">Algolia</span></div>'
    );
  });

  it('passes template params without the legacy `bindEvent` function', () => {
    const template = jest.fn(() => null);
    const sendEvent = jest.fn();
    const props = getProps({ templates: { test: template }, sendEvent });
    render(<FunctionTemplate {...props} />);

    expect(template).toHaveBeenCalledWith(
      {},
      {
        html: expect.any(Function),
        sendEvent,
        components: {
          Highlight: expect.any(Function),
          ReverseHighlight: expect.any(Function),
          Snippet: expect.any(Function),
          ReverseSnippet: expect.any(Function),
        },
      }
    );
  });

  it('renders function templates returning strings as HTML', () => {
    const props = getProps({
      templates: { test: (data: { name: string }) => `<b>${data.name}</b>` },
      data: { name: 'Algolia' },
    });
    const { container } = render(<FunctionTemplate {...props} />);

    expect(container.innerHTML).toBe('<div><b>Algolia</b></div>');
  });

  it('renders regular string templates as text', () => {
    const props = getProps({
      templates: { test: 'Hello my friend!' },
      data: { name: 'Algolia' },
    });
    const { container } = render(<FunctionTemplate {...props} />);

    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toBe('Hello my friend!');
  });

  it('renders string templates as text without compiling them', () => {
    const props = getProps({
      templates: { test: '<b>{{name}}</b>' },
      data: { name: 'Algolia' },
    });

    expect(() => render(<FunctionTemplate {...props} />))
      .toWarnDev(`[InstantSearch.js]: String-based templates are not supported in this widget and are rendered as plain text (template: test).

Use function-form templates with either the provided \`html\` function or JSX templates.`);

    const { container } = render(<FunctionTemplate {...props} />);

    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toBe('<b>{{name}}</b>');
  });

  it('renders string templates as text with Fragment as rootTagName', () => {
    const props = getProps({
      templates: { test: '<b>text</b>' },
      rootTagName: 'fragment',
    });
    const { container } = render(<FunctionTemplate {...props} />);

    expect(container.innerHTML).toBe('&lt;b&gt;text&lt;/b&gt;');
  });

  it('renders nothing when the template returns null', () => {
    const props = getProps({ templates: { test: () => null } });
    const { container } = render(<FunctionTemplate {...props} />);

    expect(container.innerHTML).toBe('');
  });
});
