/* eslint-env mocha */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import TemplateWithTransformData, {PureTemplate} from '../Template';
import sinon from 'sinon';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

const {createRenderer} = TestUtils;

describe('Template', () => {
  let renderer;

  beforeEach(() => {
    renderer = createRenderer();
  });

  describe('without helpers', () => {
    it('supports templates as strings', () => {
      const props = getProps({
        templates: {test: 'it works with {{type}}'},
        data: {type: 'strings'},
      });

      renderer.render(<PureTemplate {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it works with strings';
      expect(out).toEqualJSX(<div dangerouslySetInnerHTML={{__html: content}}></div>);
    });

    it('supports templates as functions returning a string', () => {
      const props = getProps({
        templates: {test: templateData => `it also works with ${templateData.type}`},
        data: {type: 'functions'},
      });

      renderer.render(<PureTemplate {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it also works with functions';
      expect(out).toEqualJSX(<div dangerouslySetInnerHTML={{__html: content}}></div>);
    });

    it('supports templates as functions returning a React element', () => {
      const props = getProps({
        templates: {test: templateData => <p>it also works with {templateData.type}</p>},
        data: {type: 'functions'},
      });

      renderer.render(<PureTemplate {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it also works with functions';
      expect(out).toEqualJSX(<div><p>{content}</p></div>);
    });

    it('can configure compilation options', () => {
      const props = getProps({
        templates: {test: 'it configures compilation <%options%>'},
        data: {options: 'delimiters'},
        useCustomCompileOptions: {test: true},
        templatesConfig: {compileOptions: {delimiters: '<% %>'}},
      });

      renderer.render(<PureTemplate {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it configures compilation delimiters';
      expect(out).toEqualJSX(<div dangerouslySetInnerHTML={{__html: content}}></div>);
    });
  });

  describe('using helpers', () => {
    it('call the relevant function', () => {
      const props = getProps({
        templates: {test: 'it supports {{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}'},
        data: {feature: 'helpers'},
        templatesConfig: {helpers: {emphasis: (text, render) => `<em>${render(text)}</em>`}},
      });

      renderer.render(<PureTemplate {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it supports <em>helpers</em>';
      expect(out).toEqualJSX(<div dangerouslySetInnerHTML={{__html: content}}></div>);
    });

    it('sets the function context (`this`) to the template `data`', done => {
      const data = {feature: 'helpers'};
      const props = getProps({
        templates: {test: 'it supports {{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}'},
        data,
        templatesConfig: {
          helpers: {
            emphasis() {
              // context will be different when using arrow function (lexical scope used)
              expect(this).toBe(data);
              done();
            },
          },
        },
      });

      renderer.render(<PureTemplate {...props} />);
    });
  });

  describe('transform data usage', () => {
    it('supports passing a transformData map function', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        data: {feature: 'replace me'},
        transformData: originalData => {
          originalData.feature = 'transformData';
          return originalData;
        },
      });

      renderer.render(<TemplateWithTransformData {...props} />);

      const out = renderer.getRenderOutput();
      const expectedJSX = <PureTemplate {...props} data={{feature: 'transformData'}} />;

      expect(out).toEqualJSX(expectedJSX);
    });

    it('defaults data to an empty {} object', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        transformData: originalData => {
          originalData.test = 'transformData';
          return originalData;
        },
      });

      renderer.render(<TemplateWithTransformData {...props} />);

      const out = renderer.getRenderOutput();
      const expectedJSX = <PureTemplate {...props} data={{test: 'transformData'}} />;

      expect(out).toEqualJSX(expectedJSX);
    });

    it('transformData with a function is using a deep cloned version of the data', () => {
      let called = false;
      const data = {a: {}};
      const props = getProps({
        templates: {test: ''},
        data,
        transformData: clonedData => {
          called = true;
          expect(clonedData).toNotBe(data);
          expect(clonedData.a).toNotBe(data.a);
          expect(clonedData).toEqual(data);
          return clonedData;
        },
      });

      renderer.render(<TemplateWithTransformData {...props} />);
      expect(called).toBe(true);
    });

    it('transformData with an object is using a deep cloned version of the data', () => {
      let called = false;
      const data = {a: {}};
      const props = getProps({
        templates: {test: ''},
        data,
        transformData: {
          test: clonedData => {
            called = true;
            expect(clonedData).toNotBe(data);
            expect(clonedData.a).toNotBe(data.a);
            expect(clonedData).toEqual(data);
            return clonedData;
          },
        },
      });

      renderer.render(<TemplateWithTransformData {...props} />);
      expect(called).toBe(true);
    });

    it('throws an error if the transformData is not returning anything', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        data: {feature: 'replace me'},
        transformData: () => { /* missing return value */ },
      });

      expect(() => {
        renderer.render(<TemplateWithTransformData {...props} />);
      }).toThrow('`transformData` must return a `object`, got `undefined`.');
    });

    it('does not throw an error if the transformData is an object without the templateKey', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        data: {feature: 'replace me'},
        transformData: {
          anotherKey: d => d,
        },
      });

      expect(() => {
        renderer.render(<TemplateWithTransformData {...props} />);
      }).toNotThrow();
    });

    it('throws an error if the transformData returns an unexpected type', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        data: {feature: 'replace me'},
        transformData: () => true,
      });

      expect(() => {
        renderer.render(<TemplateWithTransformData {...props} />);
      }).toThrow('`transformData` must return a `object`, got `boolean`.');
    });
  });

  it('forward rootProps to the first node', () => {
    function fn() {}

    const props = getProps({});
    renderer.render(<PureTemplate rootProps={{className: 'hey', onClick: fn}} {...props}/>);

    const out = renderer.getRenderOutput();
    const expectedProps = {
      className: 'hey',
      dangerouslySetInnerHTML: {__html: ''},
      onClick: fn,
    };
    expect(out).toEqualJSX(<div {...expectedProps}></div>);
  });

  context('shouldComponentUpdate', () => {
    let props;
    let component;
    let container;

    beforeEach(() => {
      container = document.createElement('div');
      props = getProps({
        data: {hello: 'mom'},
      });
      component = ReactDOM.render(<PureTemplate {...props} />, container);
      sinon.spy(component, 'render');
    });

    it('does not call render when no change in data', () => {
      ReactDOM.render(<PureTemplate {...props} />, container);
      expect(component.render.called).toBe(false);
    });

    it('calls render when data changes', () => {
      props.data = {hello: 'dad'};
      ReactDOM.render(<PureTemplate {...props} />, container);
      expect(component.render.called).toBe(true);
    });

    it('calls render when templateKey changes', () => {
      props.templateKey += '-rerender';
      props.templates = {[props.templateKey]: ''};
      ReactDOM.render(<PureTemplate {...props} />, container);
      expect(component.render.called).toBe(true);
    });
  });

  function getProps({
    templates = {test: ''},
    data = {},
    templateKey = 'test',
    useCustomCompileOptions = {},
    templatesConfig = {helper: {}, compileOptions: {}},
    transformData = null,
  }) {
    return {templates, data, templateKey, useCustomCompileOptions, templatesConfig, transformData};
  }
});
