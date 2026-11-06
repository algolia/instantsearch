/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */

import { mount, shallow } from '@instantsearch/testutils/enzyme';
import { render } from '@testing-library/preact';
import { warning } from 'instantsearch-core';
import { h } from 'preact';

import Template from '../Template';

import type { TemplateParams } from '../../../types';
import type { TemplateProps } from '../Template';

function getProps({
  templates = { test: () => '' },
  data = {},
  templateKey = 'test',
  rootProps = {},
  ...props
}: Partial<TemplateProps>) {
  return {
    ...props,
    templates,
    data,
    templateKey,
    rootProps,
  };
}

describe('Template', () => {
  afterEach(() => {
    warning.cache = {};
  });

  it('renders the template inside the root element', () => {
    const props = getProps({
      templates: {
        test: ({ name }: { name: string }, { html }: TemplateParams) =>
          html`<span>Hello ${name}</span>`,
      },
      data: { name: 'world' },
    });
    const wrapper = render(<Template {...props} />);

    expect(wrapper.container).toMatchInlineSnapshot(`
      <div>
        <div>
          <span>
            Hello 
            world
          </span>
        </div>
      </div>
    `);
  });

  it('can configure custom rootTagName', () => {
    const props = getProps({ rootTagName: 'span' });
    const wrapper = mount(<Template {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('can have Fragment as rootTagName with Preact template', () => {
    const props = getProps({
      rootTagName: 'fragment',
      templates: { test: () => <span>test</span> },
    });
    const wrapper = render(<Template {...props} />);

    expect(wrapper.container).toMatchSnapshot();
  });

  it('can have Fragment as rootTagName with a template returning a string', () => {
    const props = getProps({
      rootTagName: 'fragment',
      templates: { test: () => 'test' },
    });
    const wrapper = render(<Template {...props} />);

    expect(wrapper.container).toMatchInlineSnapshot(`
      <div>
        test
      </div>
    `);
  });

  it('renders strings as text, not as HTML', () => {
    const props = getProps({
      templates: { test: ({ name }: { name: string }) => `<b>${name}</b>` },
      data: { name: 'world' },
    });

    expect(() => {
      const wrapper = render(<Template {...props} />);

      expect(wrapper.container.textContent).toBe('<b>world</b>');
      expect(wrapper.container.querySelector('b')).toBeNull();
    })
      .toWarnDev(`[InstantSearch.js]: The "test" template returned a string that starts with "<". Strings are rendered as text, not as HTML.

Return the result of the provided \`html\` function or JSX instead.

See: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#upgrade-templates`);
  });

  it('does not warn for strings that do not look like HTML', () => {
    const props = getProps({
      templates: { test: () => '1 < 2' },
    });

    expect(() => render(<Template {...props} />)).not.toWarnDev();
  });

  it('renders nothing when the template returns null', () => {
    const props = getProps({
      templates: { test: () => null },
    });
    const wrapper = render(
      <div>
        <Template {...props} />
      </div>
    );

    expect(wrapper.container).toMatchInlineSnapshot(`
      <div>
        <div />
      </div>
    `);
  });

  it('correctly unmounts empty', () => {
    const props = getProps({
      rootTagName: 'fragment',
      templates: { test: () => '' },
    });
    const wrapper = render(
      <div>
        <Template {...props} />
      </div>
    );

    expect(wrapper.container).toMatchInlineSnapshot(`
      <div>
        <div />
      </div>
    `);

    wrapper.unmount();

    expect(wrapper.container).toMatchInlineSnapshot(`<div />`);
  });

  it('forward rootProps to the first node', () => {
    function onClick() {}

    const props = getProps({
      rootProps: { className: 'className', onClick },
    });
    const wrapper = mount(<Template {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('throws when the template is a string', () => {
    const props = getProps({
      templates: { test: 'Hello {{name}}' },
      data: { name: 'world' },
    });

    expect(() => render(<Template {...props} />)).toThrow(
      `Template must be a function, was 'string' (key: test).`
    );
  });

  describe('shouldComponentUpdate', () => {
    it('does not call render when no change in data', () => {
      const props = getProps({
        data: {
          items: [],
        },
      });
      const wrapper = shallow(<Template {...props} />);
      const onRender = jest.spyOn(wrapper.instance(), 'render');

      wrapper.setProps({ data: { items: [] } });

      expect(onRender).toHaveBeenCalledTimes(0);
    });

    it('calls render when data changes', () => {
      const props = getProps({
        data: {
          items: [],
        },
      });
      const wrapper = shallow(<Template {...props} />);
      const onRender = jest.spyOn(wrapper.instance(), 'render');

      wrapper.setProps({ data: { items: [1] } });

      expect(onRender).toHaveBeenCalledTimes(1);
    });

    it('calls render when templateKey changes', () => {
      const props = getProps({});
      const wrapper = shallow(<Template {...props} />);
      const onRender = jest.spyOn(wrapper.instance(), 'render');

      wrapper.setProps({
        templateKey: 'newTemplateKey',
        templates: {
          newTemplateKey: () => '',
        },
      });

      expect(onRender).toHaveBeenCalledTimes(1);
    });

    it('calls render when rootProps changes', () => {
      const props = getProps({});
      const wrapper = shallow(<Template {...props} />);
      const onRender = jest.spyOn(wrapper.instance(), 'render');

      wrapper.setProps({
        rootProps: {
          className: 'newClassName',
        },
      });

      expect(onRender).toHaveBeenCalledTimes(1);
    });

    it('does not call render when rootProps remain unchanged', () => {
      const props = getProps({
        rootProps: {
          className: 'initialClassName',
        },
      });
      const wrapper = shallow(<Template {...props} />);
      const onRender = jest.spyOn(wrapper.instance(), 'render');

      wrapper.setProps({
        rootProps: {
          className: 'initialClassName',
        },
      });

      expect(onRender).toHaveBeenCalledTimes(0);
    });
  });
});
