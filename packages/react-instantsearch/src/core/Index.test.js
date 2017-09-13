/* eslint-env jest, jasmine */
/* eslint-disable max-len */

import React from 'react';
import { mount } from 'enzyme';

import Index from './Index';

describe('Index', () => {
  const DEFAULT_PROPS = {
    indexName: 'foobar',
    root: {
      Root: 'div',
    },
  };

  const registerWidget = jest.fn();
  const update = jest.fn();
  const widgetsManager = { registerWidget, update };

  let context = {
    ais: {
      widgetsManager,
      onSearchParameters: () => {},
      update,
    },
  };

  it('validates its props', () => {
    expect(() => {
      mount(
        <Index {...DEFAULT_PROPS}>
          <div />
        </Index>,
        { context }
      );
    }).not.toThrow();

    expect(() => {
      mount(<Index {...DEFAULT_PROPS} />, { context });
    }).not.toThrow();

    expect(() => {
      mount(
        <Index {...DEFAULT_PROPS}>
          <div />
          <div />
        </Index>,
        { context }
      );
    }).not.toThrow();

    expect(registerWidget.mock.calls.length).toBe(3);
  });

  it('exposes multi index context', () => {
    const wrapper = mount(
      <Index {...DEFAULT_PROPS}>
        <div />
      </Index>,
      { context }
    );

    const childContext = wrapper.instance().getChildContext();
    expect(childContext.multiIndexContext.targetedIndex).toBe(
      DEFAULT_PROPS.indexName
    );
  });

  it('update search if indexName prop change', () => {
    const wrapper = mount(
      <Index {...DEFAULT_PROPS}>
        <div />
      </Index>,
      { context }
    );

    wrapper.setProps({ indexName: 'newIndexName' });

    expect(update.mock.calls.length).toBe(1);
  });

  it('calls onSearchParameters when mounted', () => {
    const onSearchParameters = jest.fn();
    context = {
      ais: {
        widgetsManager,
        onSearchParameters,
      },
    };

    mount(
      <Index {...DEFAULT_PROPS}>
        <div />
      </Index>,
      { context }
    );

    expect(onSearchParameters.mock.calls.length).toBe(1);
  });
});
