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
  const widgetsManager = { registerWidget };

  const context = {
    ais: { widgetsManager },
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
});
