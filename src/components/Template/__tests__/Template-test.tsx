/** @jsx h */

import { h } from 'preact';
import Template from '../Template';
import { mount, shallow } from 'enzyme';
import { ReactElementLike } from 'prop-types';

function getProps({
  templates = { test: '' },
  data = {},
  templateKey = 'test',
  rootProps = {},
  useCustomCompileOptions = {},
  templatesConfig = { helpers: {}, compileOptions: {} },
  ...props
}) {
  return {
    ...props,
    templates,
    data,
    templateKey,
    rootProps,
    useCustomCompileOptions,
    templatesConfig,
  };
}

describe('Template', () => {
  it('can configure compilation options', () => {
    const props = getProps({
      templates: { test: 'it configures compilation <%options%>' },
      data: { options: 'delimiters' },
      useCustomCompileOptions: { test: true },
      templatesConfig: { helpers: {}, compileOptions: { delimiters: '<% %>' } },
    });
    const wrapper = mount((<Template {...props} />) as ReactElementLike);

    expect(wrapper).toMatchSnapshot();
  });

  it('can configure custom rootTagName', () => {
    const props = getProps({ rootTagName: 'span' });
    const wrapper = mount((<Template {...props} />) as ReactElementLike);

    expect(wrapper).toMatchSnapshot();
  });

  it('forward rootProps to the first node', () => {
    function onClick() {}

    const props = getProps({
      rootProps: { className: 'className', onClick },
    });
    const wrapper = mount((<Template {...props} />) as ReactElementLike);

    expect(wrapper).toMatchSnapshot();
  });

  describe('shouldComponentUpdate', () => {
    it('does not call render when no change in data', () => {
      const props = getProps({
        data: {
          items: [],
        },
      });
      const wrapper = shallow((<Template {...props} />) as ReactElementLike);
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
      const wrapper = shallow((<Template {...props} />) as ReactElementLike);
      const onRender = jest.spyOn(wrapper.instance(), 'render');

      wrapper.setProps({ data: { items: [1] } });

      expect(onRender).toHaveBeenCalledTimes(1);
    });

    it('calls render when templateKey changes', () => {
      const props = getProps({});
      const wrapper = shallow((<Template {...props} />) as ReactElementLike);
      const onRender = jest.spyOn(wrapper.instance(), 'render');

      wrapper.setProps({
        templateKey: 'newTemplateKey',
        templates: {
          newTemplateKey: '',
        },
      });

      expect(onRender).toHaveBeenCalledTimes(1);
    });

    it('calls render when rootProps changes', () => {
      const props = getProps({});
      const wrapper = shallow((<Template {...props} />) as ReactElementLike);
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
      const wrapper = shallow((<Template {...props} />) as ReactElementLike);
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
