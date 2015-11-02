/* eslint-env mocha */

import expect from 'expect';
import jsdom from 'mocha-jsdom';
import utils from '../utils';

describe('getContainerNode', () => {
  jsdom({useEach: true});

  it('should be able to get a node from a node', () => {
    let d = document.body;
    expect(utils.getContainerNode(d)).toEqual(d);
  });

  it('should be able to retrieve an element from a css selector', ()=>{
    let d = document.createElement('div');
    d.className = 'test';
    document.body.appendChild(d);

    expect(utils.getContainerNode('.test')).toEqual(d);
  });

  it('should throw for other types of object', function() {
    expect(utils.getContainerNode.bind(utils, undefined)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, null)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, {})).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, 42)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, [])).toThrow(Error);
  });

  it('should throw when not a correct selector', function() {
    expect(utils.getContainerNode.bind(utils, '.not-in-dom')).toThrow(Error);
  });
});

describe('isDomElement', function() {
  jsdom({useEach: true});

  it('should return true for dom element', () => {
    expect(utils.isDomElement(document.body)).toBe(true);
  });

  it('should return false for dom element', () => {
    expect(utils.isDomElement()).toBe(false);
    expect(utils.isDomElement(undefined)).toBe(false);
    expect(utils.isDomElement(null)).toBe(false);
    expect(utils.isDomElement([])).toBe(false);
    expect(utils.isDomElement({})).toBe(false);
    expect(utils.isDomElement('')).toBe(false);
    expect(utils.isDomElement(42)).toBe(false);
  });
});

describe('bemHelper', function() {
  it('should return a function', function() {
    expect(utils.bemHelper('block')).toBeA('function');
  });

  context('returned function', function() {
    let returnedFunction = utils.bemHelper('block');

    it('should create a block class when invoked without parameters', function() {
      let className = returnedFunction();
      expect(className).toBe('block');
    });

    it('should create a block with element class when invoked with one parameter', function() {
      let className = returnedFunction('element');
      expect(className).toBe('block--element');
    });

    it('should create a block with element and modifier class when invoked with 2 parameters', function() {
      let className = returnedFunction('element', 'modifier');
      expect(className).toBe('block--element__modifier');
    });

    it('should create a block with a modifier class when invoked with null for element', function() {
      let className = returnedFunction(null, 'modifier');
      expect(className).toBe('block__modifier');
    });
  });
});

describe('prepareTemplateProps', function() {
  let defaultTemplates = {
    foo: 'toto',
    bar: 'tata'
  };
  let templatesConfig = [];
  let transformData = function() {};

  it(
    'should return the default templates and set useCustomCompileOptions to false when using the defaults',
    function() {
      let defaultsPrepared = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        undefined,
        templatesConfig
      });

      expect(defaultsPrepared.transformData).toBe(transformData);
      expect(defaultsPrepared.useCustomCompileOptions).toEqual({foo: false, bar: false});
      expect(defaultsPrepared.templates).toEqual(defaultTemplates);
      expect(defaultsPrepared.templatesConfig).toBe(templatesConfig);
    }
  );

  it(
    'should return the missing default templates and set useCustomCompileOptions to true when for the customs',
    function() {
      let templates = {foo: 'baz'};
      let defaultsPrepared = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templates,
        templatesConfig
      });

      expect(defaultsPrepared.transformData).toBe(transformData);
      expect(defaultsPrepared.useCustomCompileOptions).toEqual({foo: true, bar: false});
      expect(defaultsPrepared.templates).toEqual({...defaultTemplates, ...templates});
      expect(defaultsPrepared.templatesConfig).toBe(templatesConfig);
    }
  );
});
