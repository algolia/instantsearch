/**
 * @jest-environment jsdom
 */

import { wait } from '@instantsearch/testutils';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount, shallow } from 'enzyme';
import React from 'react';

import { InstantSearchProvider } from '../context';
import createConnector, {
  createConnectorWithoutContext,
} from '../createConnector';

Enzyme.configure({ adapter: new Adapter() });

describe('createConnector', () => {
  const createFakeState = (props) => ({
    widgets: {},
    results: {},
    resultsFacetValues: {},
    searching: false,
    searchingForFacetValues: false,
    isSearchStalled: false,
    metadata: [],
    error: new Error(),
    ...props,
  });

  const createFakeStore = (props) => ({
    getState: () => createFakeState(),
    setState() {},
    subscribe() {},
    ...props,
  });

  const createFakeWidgetManager = (props) => ({
    registerWidget() {},
    getWidgets() {},
    update() {},
    ...props,
  });

  const createFakeContext = (props) => ({
    onInternalStateUpdate() {},
    createHrefForState() {},
    onSearchForFacetValues() {},
    onSearchStateChange() {},
    onSearchParameters() {},
    store: createFakeStore(),
    widgetsManager: createFakeWidgetManager(),
    ...props,
  });

  describe('state', () => {
    it('computes provided props', () => {
      const getProvidedProps = jest.fn((props) => ({
        providedProps: props,
      }));

      const Fake = () => null;
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps,
      })(Fake);

      const state = createFakeState();

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
        }),
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(getProvidedProps).toHaveBeenCalledTimes(1);
      expect(getProvidedProps).toHaveBeenCalledWith(
        { hello: 'there', contextValue: context },
        state.widgets,
        {
          results: state.results,
          searching: state.searching,
          searchingForFacetValues: state.searchingForFacetValues,
          isSearchStalled: state.isSearchStalled,
          error: state.error,
        },
        state.metadata,
        state.resultsFacetValues
      );

      expect(wrapper.find(Fake).props()).toEqual({
        hello: 'there',
        providedProps: {
          hello: 'there',
          contextValue: context,
        },
      });
    });

    it('computes provided props on props change', () => {
      const getProvidedProps = jest.fn((props) => ({
        providedProps: props,
      }));

      const Fake = () => null;
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps,
      })(Fake);

      const props = {
        hello: 'there',
      };

      const context = createFakeContext();

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(getProvidedProps).toHaveBeenCalledTimes(1);

      wrapper.setProps({
        hello: 'again',
      });

      expect(getProvidedProps).toHaveBeenCalledTimes(2);
      expect(wrapper.find(Fake).props()).toEqual({
        hello: 'again',
        providedProps: {
          hello: 'again',
          contextValue: context,
        },
      });
    });

    it('computes provided props with the correct value for `canRender` on props change', () => {
      const getProvidedProps = jest.fn((props) => ({
        providedProps: props,
      }));

      const Fake = () => null;
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps,
      })(Fake);

      const props = {
        hello: 'there',
      };

      const context = createFakeContext();

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      // Simulate props change before mount
      wrapper.setProps({ hello: 'again' });

      expect(wrapper.find(Fake).props()).toEqual({
        hello: 'again',
        providedProps: {
          hello: 'again',
          contextValue: context,
        },
      });

      // Simulate mount lifecycle
      wrapper.instance().componentDidMount();

      // Simulate props change after mount
      wrapper.setProps({ hello: 'once again' });

      expect(wrapper.find(Fake).props()).toEqual({
        hello: 'once again',
        providedProps: {
          hello: 'once again',
          contextValue: context,
        },
      });
    });

    it('computes provided props on search state change', () => {
      const getProvidedProps = jest.fn((_, state) => state);

      const Fake = () => null;
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps,
      })(Fake);

      const subscribe = jest.fn();

      const state = createFakeState({
        widgets: {
          query: 'hello',
        },
      });

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        store: createFakeStore({
          getState: jest.fn(() => state),
          subscribe,
        }),
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(getProvidedProps).toHaveBeenCalledTimes(1);
      expect(wrapper.find(Fake).props()).toEqual({
        hello: 'there',
        query: 'hello',
      });

      // Simulate a search state change
      context.store.getState.mockImplementation(() => ({
        ...state,
        widgets: {
          query: 'hello World',
        },
      }));

      // Simulate a dispatch on search state change
      context.store.subscribe.mock.calls[0][0]();

      expect(getProvidedProps).toHaveBeenCalledTimes(2);
      expect(wrapper.find(Fake).props()).toEqual({
        hello: 'there',
        query: 'hello World',
      });
    });

    it('computes provided props with latest props on search state change', () => {
      const getProvidedProps = jest.fn((_, state) => state);

      const Fake = () => null;
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps,
      })(Fake);

      const subscribe = jest.fn();

      const state = createFakeState({
        widgets: {
          query: 'hello',
        },
      });

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        store: createFakeStore({
          getState: jest.fn(() => state),
          subscribe,
        }),
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(wrapper.find(Fake).props()).toEqual({
        hello: 'there',
        query: 'hello',
      });

      // Simulate a search state change
      context.store.getState.mockImplementation(() => ({
        ...state,
        widgets: {
          query: 'hello world',
        },
      }));

      // Simulate a props change
      wrapper.setProps({
        hello: 'again',
      });

      // Simulate a dispatch on search state change
      context.store.subscribe.mock.calls[0][0]();

      expect(wrapper.find(Fake).props()).toEqual({
        hello: 'again',
        query: 'hello world',
      });
    });

    it('does not compute provided props when props do not change', () => {
      const getProvidedProps = jest.fn((props) => ({
        providedProps: props,
      }));

      const Fake = jest.fn(() => null);
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps,
      })(Fake);

      const props = {
        hello: 'again',
        another: ['one', 'two'],
      };

      const context = createFakeContext();

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(getProvidedProps).toHaveBeenCalledTimes(1);

      wrapper.setProps({
        hello: 'again',
        another: ['one', 'two'],
      });

      expect(getProvidedProps).toHaveBeenCalledTimes(1);

      wrapper.setProps({
        hello: 'again',
        another: ['one', 'two'],
      });

      expect(getProvidedProps).toHaveBeenCalledTimes(1);
    });

    it('use shouldComponentUpdate when provided', () => {
      const shouldComponentUpdate = jest.fn(() => true);
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: (props) => props,
        getMetadata: () => null,
        shouldComponentUpdate,
      })(() => null);

      const props = { hello: 'there' };
      const context = createFakeContext();
      const wrapper = mount(<Connected {...props} contextValue={context} />);

      expect(shouldComponentUpdate).toHaveBeenCalledTimes(0);

      wrapper.setProps({ hello: 'here' });

      expect(shouldComponentUpdate).toHaveBeenCalledTimes(2);
      expect(shouldComponentUpdate).toHaveBeenCalledWith(
        {
          hello: 'there',
          contextValue: context,
        },
        {
          hello: 'here',
          contextValue: context,
        },
        {
          providedProps: {
            hello: 'there',
            contextValue: context,
          },
        },
        {
          providedProps: {
            hello: 'there',
            contextValue: context,
          },
        }
      );

      expect(shouldComponentUpdate).toHaveBeenCalledWith(
        {
          hello: 'here',
          contextValue: context,
        },
        {
          hello: 'here',
          contextValue: context,
        },
        {
          providedProps: {
            hello: 'there',
            contextValue: context,
          },
        },
        {
          providedProps: {
            hello: 'here',
            contextValue: context,
          },
        }
      );
    });

    it('subscribes to the store once mounted', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
      })(() => null);

      const subscribe = jest.fn();

      const context = createFakeContext({
        store: createFakeStore({
          subscribe,
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />, {
        disableLifecycleMethods: true,
      });

      expect(subscribe).toHaveBeenCalledTimes(0);

      // Simulate didMount
      wrapper.instance().componentDidMount();

      expect(subscribe).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes from the store on unmount', async () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
      })(() => null);

      const unsubscribe = jest.fn();

      const context = createFakeContext({
        store: createFakeStore({
          subscribe: () => unsubscribe,
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />);

      expect(unsubscribe).toHaveBeenCalledTimes(0);

      wrapper.unmount();

      await wait(0);

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('does not throw an error on unmount before mount', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
      })(() => null);

      const context = createFakeContext({
        store: createFakeStore({
          subscribe() {
            return () => {
              // unsubscribe
            };
          },
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />, {
        disableLifecycleMethods: true,
      });

      expect(() => wrapper.unmount()).not.toThrow();
    });

    it('does not throw an error on dispatch after unmount', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
      })(() => null);

      const unsubscribe = () => {};
      const subscribe = jest.fn(() => unsubscribe);

      const context = createFakeContext({
        store: createFakeStore({
          subscribe,
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />);

      expect(() => () => {
        wrapper.unmount();

        // Simulate a dispatch
        subscribe.mock.calls[0][0]();
      }).not.toThrow();
    });
  });

  describe('widget', () => {
    it('registers itself as a widget with getMetadata', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
      })(() => null);

      const registerWidget = jest.fn();

      const context = createFakeContext({
        widgetsManager: createFakeWidgetManager({
          registerWidget,
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />);

      expect(registerWidget).toHaveBeenCalledTimes(1);
      expect(registerWidget).toHaveBeenCalledWith(wrapper.instance());
    });

    it('registers itself as a widget with getSearchParameters', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getSearchParameters: () => null,
      })(() => null);

      const registerWidget = jest.fn();

      const context = createFakeContext({
        widgetsManager: createFakeWidgetManager({
          registerWidget,
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />);

      expect(registerWidget).toHaveBeenCalledTimes(1);
      expect(registerWidget).toHaveBeenCalledWith(wrapper.instance());
    });

    it('registers itself as a widget once mounted', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getSearchParameters: () => null,
      })(() => null);

      const registerWidget = jest.fn();

      const context = createFakeContext({
        widgetsManager: createFakeWidgetManager({
          registerWidget,
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />, {
        disableLifecycleMethods: true,
      });

      expect(registerWidget).toHaveBeenCalledTimes(0);

      // Simulate didMount
      wrapper.instance().componentDidMount();

      expect(registerWidget).toHaveBeenCalledTimes(1);
      expect(registerWidget).toHaveBeenCalledWith(wrapper.instance());
    });

    it('does not register itself as a widget without getMetadata nor getSearchParameters', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
      })(() => null);

      const registerWidget = jest.fn();

      const context = createFakeContext({
        widgetsManager: createFakeWidgetManager({
          registerWidget,
        }),
      });

      shallow(<Connected contextValue={context} />);

      expect(registerWidget).not.toHaveBeenCalled();
    });

    it('calls onSearchParameters on mount with getSearchParameters', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'CoolConnector',
        getProvidedProps: () => {},
        getSearchParameters: () => null,
        getMetadata: () => null,
      })(() => null);

      const onSearchParameters = jest.fn();

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        onSearchParameters,
      });

      shallow(<Connected {...props} contextValue={context} />);

      expect(onSearchParameters).toHaveBeenCalledTimes(1);
      expect(onSearchParameters).toHaveBeenCalledWith(
        expect.any(Function),
        { ais: context },
        { ...props, contextValue: context },
        expect.any(Function),
        'CoolConnector'
      );
    });

    it('does not call onSearchParameters on mount without getSearchParameters', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'CoolConnector',
        getProvidedProps: () => {},
      })(() => null);

      const onSearchParameters = jest.fn();

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        onSearchParameters,
      });

      shallow(<Connected {...props} contextValue={context} />);

      expect(onSearchParameters).not.toHaveBeenCalled();
    });

    it('binds getSearchParameters to the connector instance with onSearchParameters', () => {
      const getSearchParameters = jest.fn(function () {
        return this;
      });

      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getSearchParameters,
      })(() => null);

      const onSearchParameters = jest.fn();

      const context = createFakeContext({
        onSearchParameters,
      });

      const wrapper = shallow(<Connected contextValue={context} />);

      expect(onSearchParameters.mock.calls[0][0]()).toBe(wrapper.instance());
    });

    it('triggers a widgetManager update on props change', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
      })(() => null);

      const update = jest.fn();

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        widgetsManager: createFakeWidgetManager({
          update,
        }),
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(update).toHaveBeenCalledTimes(0);

      wrapper.setProps({
        hello: 'again',
      });

      expect(update).toHaveBeenCalledTimes(1);
    });

    it('does not trigger a widgetManager update when props do not change', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
      })(() => null);

      const update = jest.fn();

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        widgetsManager: createFakeWidgetManager({
          update,
        }),
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(update).toHaveBeenCalledTimes(0);

      wrapper.setProps({
        hello: 'there',
      });

      expect(update).toHaveBeenCalledTimes(0);
    });

    it('triggers an onSearchStateChange on props change with transitionState', () => {
      const transitionState = jest.fn(function () {
        return this.props;
      });

      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
        transitionState,
      })(() => null);

      const state = createFakeState();
      const onSearchStateChange = jest.fn();

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
        }),
        onSearchStateChange,
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(onSearchStateChange).toHaveBeenCalledTimes(0);
      expect(transitionState).toHaveBeenCalledTimes(0);

      wrapper.setProps({
        hello: 'again',
      });

      expect(onSearchStateChange).toHaveBeenCalledTimes(1);
      expect(onSearchStateChange).toHaveBeenCalledWith({
        hello: 'again',
        contextValue: context,
      });

      expect(transitionState).toHaveBeenCalledTimes(1);
      expect(transitionState).toHaveBeenCalledWith(
        { hello: 'again', contextValue: context },
        state.widgets,
        state.widgets
      );
    });

    it('does not trigger an onSearchStateChange on props change without transitionState', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
      })(() => null);

      const onSearchStateChange = jest.fn();

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        onSearchStateChange,
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(onSearchStateChange).not.toHaveBeenCalled();

      wrapper.setProps({
        hello: 'again',
      });

      expect(onSearchStateChange).not.toHaveBeenCalled();
    });

    it('unregisters itself on unmount', async () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
      })(() => null);

      const unregisterWidget = jest.fn();

      const context = createFakeContext({
        widgetsManager: createFakeWidgetManager({
          registerWidget: () => unregisterWidget,
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />);

      expect(unregisterWidget).toHaveBeenCalledTimes(0);

      wrapper.unmount();

      await wait(0);

      expect(unregisterWidget).toHaveBeenCalledTimes(1);
    });

    it('calls onSearchStateChange with cleanUp on unmount', async () => {
      const cleanUp = jest.fn(function (props, searchState) {
        return {
          instanceProps: this.props,
          providedProps: props,
          searchState,
        };
      });

      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
        cleanUp,
      })(() => null);

      const onSearchStateChange = jest.fn();
      const setState = jest.fn();

      const state = createFakeState({
        widgets: {
          query: 'hello',
        },
      });

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
          setState,
        }),
        widgetsManager: createFakeWidgetManager({
          registerWidget: () => () => {},
        }),
        onSearchStateChange,
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(cleanUp).toHaveBeenCalledTimes(0);
      expect(onSearchStateChange).toHaveBeenCalledTimes(0);

      wrapper.unmount();

      await wait(0);

      expect(cleanUp).toHaveBeenCalledTimes(1);
      expect(onSearchStateChange).toHaveBeenCalledTimes(1);
      expect(onSearchStateChange).toHaveBeenCalledWith({
        providedProps: {
          hello: 'there',
          contextValue: context,
        },
        instanceProps: {
          hello: 'there',
          contextValue: context,
        },
        searchState: {
          query: 'hello',
        },
      });
    });

    it('calls onSearchStateChange with cleanUp without empty keys on unmount', async () => {
      const cleanUp = jest.fn((_, searchState) => searchState);

      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
        cleanUp,
      })(() => null);

      const onSearchStateChange = jest.fn();
      const setState = jest.fn();

      const state = createFakeState({
        widgets: {
          query: 'hello',
          hello: {},
        },
      });

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
          setState,
        }),
        widgetsManager: createFakeWidgetManager({
          registerWidget: () => () => {},
        }),
        onSearchStateChange,
      });

      const wrapper = shallow(<Connected contextValue={context} />);

      wrapper.unmount();

      await wait(0);

      expect(onSearchStateChange).toHaveBeenCalledWith({
        query: 'hello',
      });
    });

    it('does not throw an error on unmount before mount', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata: () => null,
      })(() => null);

      const unregisterWidget = jest.fn();

      const context = createFakeContext({
        widgetsManager: createFakeWidgetManager({
          registerWidget: () => unregisterWidget,
        }),
      });

      const wrapper = shallow(<Connected contextValue={context} />, {
        disableLifecycleMethods: true,
      });

      const trigger = () => wrapper.unmount();

      expect(() => trigger()).not.toThrow();
    });
  });

  describe('getSearchParameters', () => {
    it('returns the widget search parameters when getSearchParameters is provided', () => {
      const getSearchParameters = function (
        searchParameters,
        props,
        searchState
      ) {
        return {
          instanceProps: this.props,
          providedProps: props,
          searchParameters,
          searchState,
        };
      };

      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getSearchParameters,
      })(() => null);

      const searchParameters = {
        query: '',
        hitsPerPage: 10,
      };

      const state = createFakeState({
        widgets: {
          query: 'hello',
        },
      });

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
        }),
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      const widgetSearchParameters = wrapper
        .instance()
        .getSearchParameters(searchParameters);

      expect(widgetSearchParameters).toEqual({
        searchParameters: {
          query: '',
          hitsPerPage: 10,
        },
        instanceProps: {
          hello: 'there',
          contextValue: context,
        },
        providedProps: {
          hello: 'there',
          contextValue: context,
        },
        searchState: {
          query: 'hello',
        },
      });
    });

    it('returns null when getSearchParameters is not provided', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
      })(() => null);

      const searchParameters = {
        query: '',
        hitsPerPage: 10,
      };

      const context = createFakeContext();

      const wrapper = shallow(<Connected contextValue={context} />);

      const widgetSearchParamameters = wrapper
        .instance()
        .getSearchParameters(searchParameters);

      expect(widgetSearchParamameters).toBe(null);
    });
  });

  describe('getMetadata', () => {
    it('returns the widget metadata when getMetadata is provided', () => {
      const getMetadata = function (props, searchState) {
        return {
          instanceProps: this.props,
          providedProps: props,
          searchState,
        };
      };

      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        getMetadata,
      })(() => null);

      const props = {
        hello: 'there',
      };

      const searchState = {
        query: 'hello',
      };

      const context = createFakeContext();

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      const widgetMetadata = wrapper.instance().getMetadata(searchState);

      expect(widgetMetadata).toEqual({
        instanceProps: {
          hello: 'there',
          contextValue: context,
        },
        providedProps: {
          hello: 'there',
          contextValue: context,
        },
        searchState: {
          query: 'hello',
        },
      });
    });

    it('returns an empty object when getMetadata is not provided', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
      })(() => null);

      const searchState = {
        query: 'hello',
      };

      const context = createFakeContext();

      const wrapper = shallow(<Connected contextValue={context} />);

      const widgetMetadata = wrapper.instance().getMetadata(searchState);

      expect(widgetMetadata).toEqual({});
    });
  });

  describe('transitionState', () => {
    it('returns the widget transitionState when transitionState is provided', () => {
      const transitionState = function (
        props,
        previousSearchState,
        nextSearchState
      ) {
        return {
          instanceProps: this.props,
          providedProps: props,
          previousSearchState,
          nextSearchState,
        };
      };

      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        transitionState,
      })(() => null);

      const props = {
        hello: 'there',
      };

      const previousSearchState = {
        query: 'hello',
      };

      const nextSearchState = {
        query: 'hello again',
      };

      const context = createFakeContext();

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      const widgetTransitionState = wrapper
        .instance()
        .transitionState(previousSearchState, nextSearchState);

      expect(widgetTransitionState).toEqual({
        instanceProps: {
          hello: 'there',
          contextValue: context,
        },
        providedProps: {
          hello: 'there',
          contextValue: context,
        },
        previousSearchState: {
          query: 'hello',
        },
        nextSearchState: {
          query: 'hello again',
        },
      });
    });

    it('returns the given next state when transitionState is not provided', () => {
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
      })(() => null);

      const props = {
        hello: 'there',
      };

      const previousSearchState = {
        query: 'hello',
      };

      const nextSearchState = {
        query: 'hello again',
      };

      const context = createFakeContext();

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      const widgetTransitionState = wrapper
        .instance()
        .transitionState(previousSearchState, nextSearchState);

      expect(widgetTransitionState).toEqual({
        query: 'hello again',
      });
    });
  });

  describe('refine', () => {
    it('passes a refine method to the component', () => {
      const refine = (props, searchState, next) => ({
        props,
        searchState,
        next,
      });

      const Dummy = () => null;
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        refine,
      })(Dummy);

      const onInternalStateUpdate = jest.fn();

      const state = createFakeState({
        widgets: {
          query: 'hello',
        },
      });

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
        }),
        onInternalStateUpdate,
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(onInternalStateUpdate).toHaveBeenCalledTimes(0);

      wrapper.find(Dummy).props().refine({ query: 'hello world' });

      expect(onInternalStateUpdate).toHaveBeenCalledTimes(1);
      expect(onInternalStateUpdate).toHaveBeenCalledWith({
        props: {
          hello: 'there',
          contextValue: context,
        },
        searchState: {
          query: 'hello',
        },
        next: {
          query: 'hello world',
        },
      });
    });
  });

  describe('createURL', () => {
    it('passes a createURL method to the component', () => {
      const refine = (props, searchState, next) => ({
        props,
        searchState,
        next,
      });

      const Dummy = () => null;
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        refine,
      })(Dummy);

      const createHrefForState = jest.fn();

      const state = createFakeState({
        widgets: {
          query: 'hello',
        },
      });

      const props = {
        hello: 'there',
      };

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
        }),
        createHrefForState,
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(createHrefForState).toHaveBeenCalledTimes(0);

      wrapper.find(Dummy).props().createURL({ query: 'hello world' });

      expect(createHrefForState).toHaveBeenCalledTimes(1);
      expect(createHrefForState).toHaveBeenCalledWith({
        props: {
          hello: 'there',
          contextValue: context,
        },
        searchState: {
          query: 'hello',
        },
        next: {
          query: 'hello world',
        },
      });
    });
  });

  describe('searchForFacetValues', () => {
    it('passes a searchForItems method to the component', () => {
      const searchForFacetValues = (props, searchState, next) => ({
        props,
        searchState,
        next,
      });

      const Dummy = () => null;
      const Connected = createConnectorWithoutContext({
        displayName: 'Connector',
        getProvidedProps: () => {},
        searchForFacetValues,
      })(Dummy);

      const onSearchForFacetValues = jest.fn();

      const props = {
        hello: 'there',
      };

      const state = createFakeState({
        widgets: {
          query: 'hello',
        },
      });

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
        }),
        onSearchForFacetValues,
      });

      const wrapper = shallow(<Connected {...props} contextValue={context} />);

      expect(onSearchForFacetValues).toHaveBeenCalledTimes(0);

      wrapper.find(Dummy).props().searchForItems({
        facetName: 'brand',
        query: 'apple',
        maxFacetHits: 10,
      });

      expect(onSearchForFacetValues).toHaveBeenCalledTimes(1);
      expect(onSearchForFacetValues).toHaveBeenCalledWith({
        props: {
          hello: 'there',
          contextValue: context,
        },
        searchState: {
          query: 'hello',
        },
        next: {
          facetName: 'brand',
          query: 'apple',
          maxFacetHits: 10,
        },
      });
    });
  });

  describe('wrapped with InstantSearchProvider', () => {
    it('default export reads from context', () => {
      const state = createFakeState({
        widgets: {
          query: 'hello',
        },
      });

      const context = createFakeContext({
        store: createFakeStore({
          getState: () => state,
        }),
      });

      const Dummy = (props) => JSON.stringify(props, null, 2).replace(/"/g, '');

      const Connected = createConnector({
        displayName: 'Connector',
        getProvidedProps: (props) => ({ providedProps: props }),
      })(Dummy);

      const props = {
        message: 'hello',
      };

      const wrapper = mount(
        <InstantSearchProvider value={context}>
          <Connected {...props} />
        </InstantSearchProvider>
      );

      expect(wrapper.text()).toMatchInlineSnapshot(`
        "{
          message: hello,
          providedProps: {
            contextValue: {
              store: {},
              widgetsManager: {}
            },
            message: hello
          }
        }"
      `);
    });
  });
});
