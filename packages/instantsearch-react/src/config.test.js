/* eslint-env jest, jasmine */

import React, {PropTypes, Component} from 'react';
import {shallow, mount} from 'enzyme';

import config from './config';
jest.unmock('./config');

function mockConfigManager() {
  return {
    register: jest.fn(),
    swap: jest.fn(),
    unregister: jest.fn(),
    apply: jest.fn(),
  };
}

class SpyComponent extends Component {
  static propTypes = {
    willUpdate: PropTypes.func,
  };

  static defaultProps = {
    willUpdate: () => null,
  };

  componentWillUpdate() {
    this.props.willUpdate();
  }

  render() {
    return <div />;
  }
}

const Configured = config(props => props.config || {})(SpyComponent);

describe('config HOC', () => {
  it('registers its config before mounting', () => {
    const configManager = mockConfigManager();
    const conf = {};
    shallow(<Configured config={conf} />, {
      context: {
        algoliaConfigManager: configManager,
      },
    });
    expect(configManager.register.mock.calls.length).toBe(1);
    expect(configManager.register.mock.calls[0][0]).toBe(conf);
  });

  it('applies its config after mounting', () => {
    const configManager = mockConfigManager();
    mount(<Configured />, {
      context: {
        algoliaConfigManager: configManager,
      },
    });
    expect(configManager.apply.mock.calls.length).toBe(1);
  });

  it('swaps its config before updating', () => {
    const configManager = mockConfigManager();
    const conf1 = {};
    const conf2 = {};
    const wrapper = mount(
      <Configured
        config={conf1}
        willUpdate={() => {
          expect(configManager.swap.mock.calls.length).toBe(1);
          expect(configManager.swap.mock.calls[0][0]).toBe(conf1);
          expect(configManager.swap.mock.calls[0][1]).toBe(conf2);
        }}
      />,
      {
        context: {
          algoliaConfigManager: configManager,
        },
      }
    );
    wrapper.setProps({config: conf2});
  });

  it('applies its config after updating', () => {
    const configManager = mockConfigManager();
    const wrapper = mount(
      <Configured
        willUpdate={() => {
          expect(configManager.apply.mock.calls.length).toBe(1);
        }}
      />,
      {
        context: {
          algoliaConfigManager: configManager,
        },
      }
    );
    wrapper.update();
    expect(configManager.apply.mock.calls.length).toBe(2);
  });

  it('unregisters its config before unmounting', () => {
    const configManager = mockConfigManager();
    const conf = {};
    const wrapper = mount(<Configured config={conf} />, {
      context: {
        algoliaConfigManager: configManager,
      },
    });
    expect(configManager.unregister.mock.calls.length).toBe(0);
    wrapper.unmount();
    expect(configManager.unregister.mock.calls.length).toBe(1);
    expect(configManager.unregister.mock.calls[0][0]).toBe(conf);
  });
});
