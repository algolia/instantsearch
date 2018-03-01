import React from 'react';
import ReactDOM from 'react-dom';
import TemplateWithTransformData, { PureTemplate } from '../Template';
import sinon from 'sinon';
import renderer from 'react-test-renderer';

describe('Template', () => {
  it('throws an error when templates as functions returning a React element', () => {
    const props = getProps({
      templates: {
        test: templateData => <p>it doesnt works with {templateData.type}</p>,
      }, // eslint-disable-line react/display-name
      data: { type: 'functions' },
    });
    expect(() => renderer.create(<PureTemplate {...props} />)).toThrow();
  });

  it('can configure compilation options', () => {
    const props = getProps({
      templates: { test: 'it configures compilation <%options%>' },
      data: { options: 'delimiters' },
      useCustomCompileOptions: { test: true },
      templatesConfig: { compileOptions: { delimiters: '<% %>' } },
    });
    const tree = renderer.create(<PureTemplate {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('can configure custom rootTagName', () => {
    const props = getProps({ rootTagName: 'span' });
    const tree = renderer.create(<PureTemplate {...props} />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('forward rootProps to the first node', () => {
    function fn() {}

    const props = getProps({
      rootProps: { className: 'hey', onClick: fn },
    });
    const tree = renderer.create(<PureTemplate {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('transform data usage', () => {
    it('supports passing a transformData map function', () => {
      const props = getProps({
        templates: { test: 'it supports {{feature}}' },
        data: { feature: 'replace me' },
        transformData: originalData => {
          originalData.feature = 'transformData';
          return originalData;
        },
      });
      const tree = renderer
        .create(<TemplateWithTransformData {...props} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('defaults data to an empty {} object', () => {
      const props = getProps({
        templates: { test: 'it supports {{feature}}' },
        transformData: originalData => {
          originalData.test = 'transformData';
          return originalData;
        },
      });
      const tree = renderer
        .create(<TemplateWithTransformData {...props} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('transformData with a function is using a deep cloned version of the data', () => {
      let called = false;
      const data = { a: {} };
      const props = getProps({
        templates: { test: '' },
        data,
        transformData: clonedData => {
          called = true;
          expect(clonedData).not.toBe(data);
          expect(clonedData.a).not.toBe(data.a);
          expect(clonedData).toEqual(data);
          return clonedData;
        },
      });

      const tree = renderer
        .create(<TemplateWithTransformData {...props} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
      expect(called).toBe(true);
    });

    it('transformData with an object is using a deep cloned version of the data', () => {
      let called = false;
      const data = { a: {} };
      const props = getProps({
        templates: { test: '' },
        data,
        transformData: {
          test: clonedData => {
            called = true;
            expect(clonedData).not.toBe(data);
            expect(clonedData.a).not.toBe(data.a);
            expect(clonedData).toEqual(data);
            return clonedData;
          },
        },
      });

      const tree = renderer
        .create(<TemplateWithTransformData {...props} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
      expect(called).toBe(true);
    });

    it('throws an error if the transformData is not returning anything', () => {
      const props = getProps({
        templates: { test: 'it supports {{feature}}' },
        data: { feature: 'replace me' },
        transformData: () => {
          /* missing return value */
        },
      });

      expect(() => {
        renderer.create(<TemplateWithTransformData {...props} />);
      }).toThrow('`transformData` must return a `object`, got `undefined`.');
    });

    it('does not throw an error if the transformData is an object without the templateKey', () => {
      const props = getProps({
        templates: { test: 'it supports {{feature}}' },
        data: { feature: 'replace me' },
        transformData: {
          anotherKey: d => d,
        },
      });

      expect(() => {
        renderer.create(<TemplateWithTransformData {...props} />);
      }).not.toThrow();
    });

    it('throws an error if the transformData returns an unexpected type', () => {
      const props = getProps({
        templates: { test: 'it supports {{feature}}' },
        data: { feature: 'replace me' },
        transformData: () => true,
      });

      expect(() => {
        renderer.create(<TemplateWithTransformData {...props} />);
      }).toThrow('`transformData` must return a `object`, got `boolean`.');
    });
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
      component = ReactDOM.render(<PureTemplate {...props} />, container);
      sinon.spy(component, 'render');
    });

    it('does not call render when no change in data', () => {
      ReactDOM.render(<PureTemplate {...props} />, container);
      expect(component.render.called).toBe(false);
    });

    it('calls render when data changes', () => {
      props.data = { hello: 'dad' };
      ReactDOM.render(<PureTemplate {...props} />, container);
      expect(component.render.called).toBe(true);
    });

    it('calls render when templateKey changes', () => {
      props.templateKey += '-rerender';
      props.templates = { [props.templateKey]: '' };
      ReactDOM.render(<PureTemplate {...props} />, container);
      expect(component.render.called).toBe(true);
    });

    it('calls render when rootProps changes', () => {
      props.rootProps = { className: 'myCssClass mySecondCssClass' };
      ReactDOM.render(<PureTemplate {...props} />, container);
      expect(component.render.called).toBe(true);
    });

    it('does not call render when rootProps remain unchanged', () => {
      props.rootProps = { className: 'myCssClass' };
      ReactDOM.render(<PureTemplate {...props} />, container);
      expect(component.render.called).toBe(false);
    });
  });

  function getProps({
    templates = { test: '' },
    data = {},
    templateKey = 'test',
    rootProps = {},
    useCustomCompileOptions = {},
    templatesConfig = { helper: {}, compileOptions: {} },
    transformData = null,
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
      transformData,
    };
  }
});
