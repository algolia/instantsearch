/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import Template from '../Template';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Template', () => {
  let renderer;
  let templates;
  let data;
  let templateKey;
  let useCustomCompileOptions;
  let templatesConfig;
  let transformData;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
    templates = {};
    data = {};
    templateKey = null;
    useCustomCompileOptions = {};
    templatesConfig = {helpers: {}, compileOptions: {}};
    transformData = null;
  });

  it('supports templates as strings', () => {
    templates = {test: 'it works with {{type}}'};
    data = {type: 'strings'};
    templateKey = 'test';

    let props = getProps();
    renderer.render(<Template {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: 'it works with strings'}}></div>);
  });

  it('supports templates as functions', () => {
    templates = {test: templateData => 'it also works with ' + templateData.type};
    data = {type: 'functions'};
    templateKey = 'test';

    let props = getProps();
    renderer.render(<Template {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: 'it also works with functions'}}></div>);
  });

  it('can configure compilation options', () => {
    templates = {test: 'it configures compilation <%options%>'};
    data = {options: 'delimiters'};
    templateKey = 'test';
    useCustomCompileOptions.test = true;
    templatesConfig.compileOptions.delimiters = '<% %>';

    let props = getProps();
    renderer.render(<Template {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: 'it configures compilation delimiters'}}></div>);
  });

  describe('using helpers', () => {
    beforeEach(() => {
      templates = {test: 'it supports {{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}'};
      data = {feature: 'helpers'};
      templateKey = 'test';
    });

    it('call the relevant function', () => {
      templatesConfig.helpers.emphasis = (text, render) => {
        return '<em>' + render(text) + '</em>';
      };

      let props = getProps();
      renderer.render(<Template {...props} />);
      let out = renderer.getRenderOutput();

      expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: 'it supports <em>helpers</em>'}}></div>);
    });

    it('sets the function context (`this`) to the template `data`', done => {
      templatesConfig.helpers.emphasis = function() {
        // context will be different when using arrow function (lexical scope used)
        expect(this).toBe(data);
        done();
      };

      let props = getProps();
      renderer.render(<Template {...props} />);
    });
  });

  it('supports passing a transformData map function', () => {
    templates = {test: 'it supports {{feature}}'};
    data = {feature: 'replace me'};
    templateKey = 'test';
    transformData = originalData => {
      originalData.feature = 'transformData';
      return originalData;
    };

    let props = getProps();
    renderer.render(<Template {...props} />);
    let out = renderer.getRenderOutput();

    expect(out).toEqualJSX(<div className={undefined} dangerouslySetInnerHTML={{__html: 'it supports transformData'}}></div>);
  });

  it('transformData with a function is using a deep cloned version of the data', () => {
    templates = {test: ''};
    data = {a: {}};
    templateKey = 'test';
    let called = false;
    transformData = clonedData => {
      called = true;
      expect(clonedData).toNotBe(data);
      expect(clonedData.a).toNotBe(data.a);
      expect(clonedData).toEqual(data);
      return clonedData;
    };

    let props = getProps();
    renderer.render(<Template {...props} />);
    expect(called).toBe(true);
  });

  it('transformData with an object is using a deep cloned version of the data', () => {
    templates = {test: ''};
    data = {a: {}};
    templateKey = 'test';
    let called = false;
    transformData = {
      test: clonedData => {
        called = true;
        expect(clonedData).toNotBe(data);
        expect(clonedData.a).toNotBe(data.a);
        expect(clonedData).toEqual(data);
        return clonedData;
      }
    };

    let props = getProps();
    renderer.render(<Template {...props} />);
    expect(called).toBe(true);
  });

  it('throws an error if the transformData is not returning anything', () => {
    templates = {test: 'it supports {{feature}}'};
    data = {feature: 'replace me'};
    templateKey = 'test';
    transformData = () => {
      // return case if missing
    };

    let props = getProps();
    expect(() => {
      renderer.render(<Template {...props} />);
    }).toThrow('`transformData` must return a `object`, got `undefined`.');
  });

  it('doesn\'t throw an error if the transformData is an object without the templateKey', () => {
    templates = {test: 'it supports {{feature}}'};
    data = {feature: 'replace me'};
    templateKey = 'test';
    transformData = {
      anotherKey: (d) => { return d; }
    };
    let props = getProps();
    expect(() => {
      renderer.render(<Template {...props} />);
    }).toNotThrow();
  });

  it('throws an error if the transformData returns an unexpected type', () => {
    templates = {test: 'it supports {{feature}}'};
    data = {feature: 'replace me'};
    templateKey = 'test';
    transformData = () => {
      return true;
    };

    let props = getProps();
    expect(() => {
      renderer.render(<Template {...props} />);
    }).toThrow('`transformData` must return a `object`, got `boolean`.');
  });

  function getProps() {
    return {templates, data, templateKey, useCustomCompileOptions, templatesConfig, transformData};
  }
});
