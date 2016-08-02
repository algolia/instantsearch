/* eslint-env jest, jasmine */

import React from 'react';
import {shallow, mount} from 'enzyme';
jest.mock('react-algoliasearch-helper', () => ({
  connect: jest.fn(mapStateToProps => Composed => {
    Composed.__mapStateToProps = mapStateToProps;
    return Composed;
  }),
}));

import createHOC from './createHOC';
jest.unmock('./createHOC');
jest.unmock('./utils');

function createMockContext(getState) {
  return {
    algoliaConfigManager: {
      register: jest.fn(),
      swap: jest.fn(),
      unregister: jest.fn(),
    },
    algoliaStateManager: {
      getState: getState || jest.fn(),
      setState: jest.fn(),
      createURL: jest.fn(state => state),
    },
  };
}

describe('createHOC', () => {
  it('creates a higher order component that renders a component', () => {
    const Dummy = () => null;
    const HOC = createHOC({})()(Dummy);
    const wrapper = shallow(<HOC />);
    expect(wrapper.find(Dummy).length).toBe(1);
  });

  it('connects the provided component to the algolia store', () => {
    const Dummy = () => null;
    const mapStateToProps = jest.fn();
    const HOC = createHOC({mapStateToProps})()(Dummy);
    const state = {};
    const props = {foo: 'bar'};
    HOC.__mapStateToProps(state, props);
    expect(mapStateToProps.mock.calls.length).toBe(1);
    expect(mapStateToProps.mock.calls[0][0]).toBe(state);
    expect(mapStateToProps.mock.calls[0][1]).toEqual(props);
  });

  it('registers its configure method', () => {
    const Dummy = () => null;
    const configure = jest.fn();
    const context = createMockContext();
    const HOC = createHOC({configure})()(Dummy);
    const prop = {};
    const state = {};
    shallow(<HOC prop={prop} />, {context});
    const configureWrapper = context.algoliaConfigManager.register.mock
      .calls[0][0];
    configureWrapper(state);
    expect(configure.mock.calls[0][0]).toBe(state);
    expect(configure.mock.calls[0][1].prop).toBe(prop);
  });

  it('swaps its configure method on new props', () => {
    const Dummy = () => null;
    const configure = jest.fn();
    const context = createMockContext();
    const HOC = createHOC({configure})()(Dummy);
    const prop1 = {};
    const prop2 = {};
    const state = {};
    const wrapper = mount(<HOC prop={prop1} />, {context});
    const configureWrapper1 = context.algoliaConfigManager.register.mock
      .calls[0][0];
    wrapper.setProps({prop: prop2});
    expect(context.algoliaConfigManager.swap.mock.calls[0][0])
      .toBe(configureWrapper1);

    const configureWrapper2 = context.algoliaConfigManager.swap.mock
    .calls[0][1];
    configureWrapper2(state);
    expect(configure.mock.calls[0][0]).toBe(state);
    expect(configure.mock.calls[0][1].prop).toBe(prop2);
  });

  it('unregisters its configure method on unmount', () => {
    const Dummy = () => null;
    const configure = jest.fn();
    const context = createMockContext();
    const HOC = createHOC({configure})()(Dummy);

    let wrapper = mount(<HOC />, {context});
    wrapper.unmount();
    const configureWrapper1 = context.algoliaConfigManager.register.mock
      .calls[0][0];
    expect(context.algoliaConfigManager.unregister.mock.calls[0][0])
      .toBe(configureWrapper1);

    wrapper = mount(<HOC />, {context});
    wrapper.setProps({});
    wrapper.unmount();
    const configureWrapper2 = context.algoliaConfigManager.swap.mock
      .calls[0][1];
    expect(context.algoliaConfigManager.unregister.mock.calls[1][0])
      .toBe(configureWrapper2);
  });

  it('provides a refine method to its wrapped component', () => {
    const Dummy = () => null;
    const refine = jest.fn();
    const prop = {};
    const state = {};
    const context = createMockContext(() => state);
    const HOC = createHOC({refine})()(Dummy);
    const wrapper = shallow(<HOC prop={prop} />, {context});
    const props = wrapper.find(Dummy).props();
    const val1 = {};
    const val2 = {};
    const val3 = {};
    props.refine(val1, val2, val3);
    expect(refine.mock.calls[0][0]).toBe(state);
    expect(refine.mock.calls[0][1].prop).toBe(prop);
    expect(refine.mock.calls[0][2]).toBe(val1);
    expect(refine.mock.calls[0][3]).toBe(val2);
    expect(refine.mock.calls[0][4]).toBe(val3);
  });

  it('provides a createURL method to its wrapped component', () => {
    const Dummy = () => null;
    const prop = {};
    const state1 = {};
    const state2 = {};
    const refine = jest.fn(() => state2);
    const context = createMockContext(() => state1);
    const HOC = createHOC({refine})()(Dummy);
    const wrapper = shallow(<HOC prop={prop} />, {context});
    const props = wrapper.find(Dummy).props();
    const val1 = {};
    const val2 = {};
    const val3 = {};
    const url = props.createURL(val1, val2, val3);
    expect(refine.mock.calls[0][0]).toBe(state1);
    expect(refine.mock.calls[0][1].prop).toBe(prop);
    expect(refine.mock.calls[0][2]).toBe(val1);
    expect(refine.mock.calls[0][3]).toBe(val2);
    expect(refine.mock.calls[0][4]).toBe(val3);
    expect(context.algoliaStateManager.createURL.mock.calls[0][0]).toBe(state2);
    expect(url).toBe(state2);
  });

  it('passes props through the transformProps method', () => {
    const Dummy = () => null;
    const prop1 = {};
    const prop2 = {};
    const transformProps = jest.fn(() => ({prop: prop2}));

    const HOC1 = createHOC({transformProps})()(Dummy);
    const wrapper1 = shallow(<HOC1 prop={prop1} />);
    const props1 = wrapper1.find(Dummy).props();
    expect(transformProps.mock.calls[0][0].prop).toBe(prop1);
    expect(props1.prop).toBe(prop2);

    // Props from mapStateToProps must be passed to transformProps as well
    const mapStateToProps = jest.fn(() => ({prop: prop1}));
    const HOC2 = createHOC({mapStateToProps, transformProps})()(Dummy);
    const wrapper2 = shallow(<HOC2 />);
    const props2 = wrapper2.find(Dummy).props();
    expect(transformProps.mock.calls[0][0].prop).toBe(prop1);
    expect(props2.prop).toBe(prop2);
  });
});
