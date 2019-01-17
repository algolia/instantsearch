import React from 'react';
import ReactDOM from 'react-dom';
import Template from '../Template';
import { mount } from 'enzyme';

describe('Template', () => {
  it('can configure compilation options', () => {
    const props = getProps({
      templates: { test: 'it configures compilation <%options%>' },
      data: { options: 'delimiters' },
      useCustomCompileOptions: { test: true },
      templatesConfig: { compileOptions: { delimiters: '<% %>' } },
    });
    const tree = mount(<Template {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('can configure custom rootTagName', () => {
    const props = getProps({ rootTagName: 'span' });
    const tree = mount(<Template {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('forward rootProps to the first node', () => {
    function fn() {}

    const props = getProps({
      rootProps: { className: 'hey', onClick: fn },
    });
    const tree = mount(<Template {...props} />);

    expect(tree).toMatchSnapshot();
  });

  describe('shouldComponentUpdate', () => {
    let props;
    let component;
    let container;

    beforeEach(() => {
      container = document.createElement('div');
      props = getProps({
        data: { hello: 'mom' },
        rootProps: { className: 'myCssClass' },
      });
      component = ReactDOM.render(<Template {...props} />, container);
      jest.spyOn(component, 'render');
    });

    it('does not call render when no change in data', () => {
      ReactDOM.render(<Template {...props} />, container);
      expect(component.render).not.toHaveBeenCalled();
    });

    it('calls render when data changes', () => {
      props.data = { hello: 'dad' };
      ReactDOM.render(<Template {...props} />, container);
      expect(component.render).toHaveBeenCalled();
    });

    it('calls render when templateKey changes', () => {
      props.templateKey += '-rerender';
      props.templates = { [props.templateKey]: '' };
      ReactDOM.render(<Template {...props} />, container);
      expect(component.render).toHaveBeenCalled();
    });

    it('calls render when rootProps changes', () => {
      props.rootProps = { className: 'myCssClass mySecondCssClass' };
      ReactDOM.render(<Template {...props} />, container);
      expect(component.render).toHaveBeenCalled();
    });

    it('does not call render when rootProps remain unchanged', () => {
      props.rootProps = { className: 'myCssClass' };
      ReactDOM.render(<Template {...props} />, container);
      expect(component.render).not.toHaveBeenCalled();
    });
  });

  function getProps({
    templates = { test: '' },
    data = {},
    templateKey = 'test',
    rootProps = {},
    useCustomCompileOptions = {},
    templatesConfig = { helper: {}, compileOptions: {} },
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
});
