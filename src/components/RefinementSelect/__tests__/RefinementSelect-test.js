/* eslint-env mocha */

import React from 'react';
import {shallow} from 'enzyme';
import expect from 'expect';
import sinon from 'sinon';

import RefinementSelect from '../RefinementSelect.js';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('RefinementSelect', () => {
  function shallowRender(extraProps = {}) {
    const props = {
      facetValues: [],
      attributeNameKey: 'name',
      ...extraProps,
    };
    return shallow(React.createElement(RefinementSelect, props));
  }

  it('should apply correctly provided classes', () => {
    // Given
    const props = {cssClasses: {select: 'select', option: 'option'}};

    // When
    const actual = shallowRender(props);

    // Then
    expect(actual.find('select').hasClass('select')).toEqual(true);
    expect(actual.find('option').hasClass('option')).toEqual(true);
  });

  it('should apply `See all` label passed through `templates`', () => {
    // Given
    const props = {templateProps: {templates: {seeAllOption: 'foobar'}}};

    // When
    const actual = shallowRender(props);

    // Then
    expect(actual.find('option').first().text()).toEqual('foobar');
  });

  it('should call `this.props.clearRefinements()` when `all` option is selected', () => {
    // Given
    const props = {clearRefinements: sinon.spy()};

    // When
    const actual = shallowRender(props);
    actual.find('select').simulate('change', {target: {value: 'all'}});

    // Then
    expect(props.clearRefinements.calledOnce).toBe(true);
  });

  it('should call `this.props.toggleRefinement()` when a facet is selected', () => {
    // Given
    const props = {
      toggleRefinement: sinon.spy(),
      facetValues: [
        {name: 'foo', count: 10, isRefined: false},
        {name: 'bar', count: 20, isRefined: false},
      ],
    };

    // When
    const actual = shallowRender(props);
    actual.find('select').simulate('change', {target: {value: props.facetValues[0].name}});

    // Then
    expect(props.toggleRefinement.calledOnce).toBe(true);
    expect(props.toggleRefinement.args[0][0]).toBe(props.facetValues[0].name);
    expect(props.toggleRefinement.args[0][1]).toBe(props.facetValues[0].isRefined);
  });

  it('should set <select> value with refined facet', () => {
    // Given
    const props = {
      facetValues: [
        {name: 'foo', count: 10, isRefined: false},
        {name: 'bar', count: 20, isRefined: true},
      ],
    };

    // When
    const actual = shallowRender(props);

    // Then
    expect(actual.find('select').prop('value')).toEqual('bar');
  });

  it('should set <select> value to `all` if none is refined', () => {
    // Given
    const props = {
      facetValues: [
        {name: 'foo', count: 10, isRefined: false},
        {name: 'bar', count: 20, isRefined: false},
      ],
    };

    // When
    const actual = shallowRender(props);

    // Then
    expect(actual.find('select').prop('value')).toEqual('all');
  });

  it('should limit <select> options to `this.props.limit + 1`', () => {
    // Given
    const props = {
      limit: 2,
      facetValues: [
        {name: '1', count: 10, isRefined: false},
        {name: '2', count: 20, isRefined: false},
        {name: '3', count: 30, isRefined: false},
        {name: '4', count: 40, isRefined: false},
      ],
    };

    // When
    const actual = shallowRender(props);

    // Then
    expect(actual.find('option').length).toEqual(2 + 1);
  });
});
