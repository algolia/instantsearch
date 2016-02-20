/* eslint-env mocha */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import Template from '../Template';

import jsdom from 'jsdom-global';
import sinon from 'sinon';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

let {createRenderer} = TestUtils;

describe('Template', () => {
  let renderer;

  beforeEach(() => {
    renderer = createRenderer();
  });

  describe('without helpers', () => {
    it('supports templates as strings', () => {
      const props = getProps({
        templates: {test: 'it works with {{type}}'},
        data: {type: 'strings'}
      });

      renderer.render(<Template {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it works with strings';
      expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: content}}></div>);
    });

    it('supports templates as functions returning a string', () => {
      const props = getProps({
        templates: {test: templateData => 'it also works with ' + templateData.type},
        data: {type: 'functions'}
      });

      renderer.render(<Template {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it also works with functions';
      expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: content}}></div>);
    });

    it('supports templates as functions returning a React element', () => {
      const props = getProps({
        templates: {test: templateData => <p>it also works with {templateData.type}</p>},
        data: {type: 'functions'}
      });

      renderer.render(<Template {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it also works with functions';
      expect(out).toEqualJSX(<div className={undefined}><p>{content}</p></div>);
    });

    it('can configure compilation options', () => {
      const props = getProps({
        templates: {test: 'it configures compilation <%options%>'},
        data: {options: 'delimiters'},
        useCustomCompileOptions: {test: true},
        templatesConfig: {compileOptions: {delimiters: '<% %>'}}
      });

      renderer.render(<Template {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it configures compilation delimiters';
      expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: content}}></div>);
    });
  });

  describe('using helpers', () => {
    beforeEach(() => {
    });

    it('call the relevant function', () => {
      const props = getProps({
        templates: {test: 'it supports {{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}'},
        data: {feature: 'helpers'},
        templatesConfig: {helpers: {emphasis: (text, render) => '<em>' + render(text) + '</em>'}}
      });

      renderer.render(<Template {...props} />);
      const out = renderer.getRenderOutput();

      const content = 'it supports <em>helpers</em>';
      expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: content}}></div>);
    });

    it('sets the function context (`this`) to the template `data`', done => {
      const data = {feature: 'helpers'};
      const props = getProps({
        templates: {test: 'it supports {{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}'},
        data: data,
        templatesConfig: {
          helpers: {
            emphasis: function() {
              // context will be different when using arrow function (lexical scope used)
              expect(this).toBe(data);
              done();
            }
          }
        }
      });

      renderer.render(<Template {...props} />);
    });
  });

  describe('transform data usage', () => {
    it('supports passing a transformData map function', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        data: {feature: 'replace me'},
        transformData: (originalData) => {
          originalData.feature = 'transformData';
          return originalData;
        }
      });

      renderer.render(<Template {...props} />);

      const out = renderer.getRenderOutput();
      const content = 'it supports transformData';
      const expectedJSX = <div className={undefined} dangerouslySetInnerHTML={{__html: content}}></div>;

      expect(out).toEqualJSX(expectedJSX);
    });

    it('transformData with a function is using a deep cloned version of the data', () => {
      let called = false;
      const data = {a: {}};
      const props = getProps({
        templates: {test: ''},
        data: data,
        transformData: clonedData => {
          called = true;
          expect(clonedData).toNotBe(data);
          expect(clonedData.a).toNotBe(data.a);
          expect(clonedData).toEqual(data);
          return clonedData;
        }
      });

      renderer.render(<Template {...props} />);
      expect(called).toBe(true);
    });

    it('transformData with an object is using a deep cloned version of the data', () => {
      let called = false;
      const data = {a: {}};
      const props = getProps({
        templates: {test: ''},
        data: data,
        transformData: {
          test: clonedData => {
            called = true;
            expect(clonedData).toNotBe(data);
            expect(clonedData.a).toNotBe(data.a);
            expect(clonedData).toEqual(data);
            return clonedData;
          }
        }
      });

      renderer.render(<Template {...props} />);
      expect(called).toBe(true);
    });

    it('throws an error if the transformData is not returning anything', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        data: {feature: 'replace me'},
        transformData: () => { /* missing return value */ }
      });

      expect(() => {
        renderer.render(<Template {...props} />);
      }).toThrow('`transformData` must return a `object`, got `undefined`.');
    });

    it('does not throw an error if the transformData is an object without the templateKey', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        data: {feature: 'replace me'},
        transformData: {
          anotherKey: (d) => { return d; }
        }
      });

      expect(() => {
        renderer.render(<Template {...props} />);
      }).toNotThrow();
    });

    it('throws an error if the transformData returns an unexpected type', () => {
      const props = getProps({
        templates: {test: 'it supports {{feature}}'},
        data: {feature: 'replace me'},
        transformData: () => {
          return true;
        }
      });

      expect(() => {
        renderer.render(<Template {...props} />);
      }).toThrow('`transformData` must return a `object`, got `boolean`.');
    });
  });

  describe('misc feature', () => {
    it('accepts props that are not defined in the proptypes', () => {
      function fn() {}

      const props = getProps({});
      renderer.render(<Template onClick={fn} {...props}/>);

      const out = renderer.getRenderOutput();
      const expectedProps = {
        className: undefined,
        dangerouslySetInnerHTML: {__html: ''},
        onClick: fn
      };
      expect(out).toEqualJSX(<div {...expectedProps}></div>);
    });
  });

  context('shouldComponentUpdate', () => {
    let props;
    let component;
    let container;

    beforeEach(function() {this.jsdom = jsdom();});
    afterEach(function() {this.jsdom();});
    beforeEach(() => {
      container = document.createElement('div');
      props = getProps({
        data: {hello: 'mom'}
      });
      component = ReactDOM.render(<Template {...props} />, container);
      sinon.spy(component, 'render');
    });

    it('does not call render when no change in data', () => {
      ReactDOM.render(<Template {...props} />, container);
      expect(component.render.called).toBe(false);
    });

    it('calls render when data changes', () => {
      props.data = {hello: 'dad'};
      ReactDOM.render(<Template {...props} />, container);
      expect(component.render.called).toBe(true);
    });

    it('calls render when templateKey changes', () => {
      props.templateKey += '-rerender';
      props.templates = {[props.templateKey]: ''};
      ReactDOM.render(<Template {...props} />, container);
      expect(component.render.called).toBe(true);
    });
  });

  function getProps({
    templates = {test: ''},
    data = {},
    templateKey = 'test',
    useCustomCompileOptions = {},
    templatesConfig = {helper: {}, compileOptions: {}},
    transformData = null
  }) {
    return {templates, data, templateKey, useCustomCompileOptions, templatesConfig, transformData};
  }
});
