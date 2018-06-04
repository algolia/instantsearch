import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Index from '../Index';

Enzyme.configure({ adapter: new Adapter() });

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

    expect(registerWidget.mock.calls).toHaveLength(3);
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

    expect(update.mock.calls).toHaveLength(1);
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

    expect(onSearchParameters.mock.calls).toHaveLength(1);
  });
});
