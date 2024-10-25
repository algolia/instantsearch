/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { mount, shallow } from '@instantsearch/testutils/enzyme';
import { render } from '@testing-library/preact';
import { h } from 'preact';

import { warnCache } from '../../../lib/utils';
import Template from '../Template';

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
    warnCache.current = {};
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

  it('forward rootProps to the first node', () => {
    function onClick() {}

    const props = getProps({
      rootProps: { className: 'className', onClick },
    });
    const wrapper = mount(<Template {...props} />);

    expect(wrapper).toMatchSnapshot();
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
