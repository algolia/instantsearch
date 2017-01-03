/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import React from 'react';
import {mount} from 'enzyme';

import createConnector from './createConnector';

function createState() {
  return {
    widgets: {},
    results: {},
    error: {},
    searching: {},
    metadata: {},
  };
}

describe('createConnector', () => {
  const getId = () => 'id';
  describe('state', () => {
    it('computes passed props from props and state', () => {
      const getProvidedProps = jest.fn(props => ({gotProps: props}));
      const Dummy = () => null;
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps,
        getId,
      })(Dummy);
      const state = createState();
      const props = {
        hello: 'there',
      };
      const wrapper = mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => state,
            subscribe: () => null,
          },
        },
      }});
      const args = getProvidedProps.mock.calls[0];
      expect(args[0]).toEqual(props);
      expect(args[1]).toBe(state.widgets);
      expect(args[2].results).toBe(state.results);
      expect(args[2].error).toBe(state.error);
      expect(args[2].searching).toBe(state.searching);
      expect(args[3]).toBe(state.metadata);
      expect(wrapper.find(Dummy).props()).toEqual({...props, gotProps: props});
    });

    it('updates on props change', () => {
      const getProvidedProps = jest.fn(props => ({gotProps: props}));
      const Dummy = () => null;
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps,
        getId,
      })(Dummy);
      const state = createState();
      let props = {hello: 'there'};
      const wrapper = mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => state,
            subscribe: () => null,
          },
        },
      }});
      props = {hello: 'you'};
      wrapper.setProps(props);
      expect(getProvidedProps.mock.calls.length).toBe(2);
      const args = getProvidedProps.mock.calls[1];
      expect(args[0]).toEqual(props);
      expect(args[1]).toBe(state.widgets);
      expect(args[2].results).toBe(state.results);
      expect(args[2].error).toBe(state.error);
      expect(args[2].searching).toBe(state.searching);
      expect(args[3]).toBe(state.metadata);
      expect(wrapper.find(Dummy).props()).toEqual({...props, gotProps: props});
    });

    it('updates on state change', () => {
      const getProvidedProps = jest.fn((props, state) => state);
      const Dummy = () => null;
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps,
        getId,
      })(Dummy);
      let state = {
        ...createState(),
        widgets: {
          hoy: 'hey',
        },
      };
      const props = {
        hello: 'there',
      };
      let listener;
      const wrapper = mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => state,
            subscribe: l => {
              listener = l;
            },
          },
        },
      }});
      expect(wrapper.find(Dummy).props()).toEqual({...props, ...state.widgets});
      state = {
        ...createState(),
        widgets: {
          hey: 'hoy',
        },
      };
      listener();
      expect(getProvidedProps.mock.calls.length).toBe(2);
      const args = getProvidedProps.mock.calls[1];
      expect(args[0]).toEqual(props);
      expect(args[1]).toBe(state.widgets);
      expect(args[2].results).toBe(state.results);
      expect(args[2].error).toBe(state.error);
      expect(args[2].searching).toBe(state.searching);
      expect(args[3]).toBe(state.metadata);
      expect(wrapper.find(Dummy).props()).toEqual({...props, ...state.widgets});
    });

    it('unsubscribes from the store on unmount', () => {
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => null,
        getId,
      })(() => null);
      const unsubscribe = jest.fn();
      const wrapper = mount(<Connected />, {context: {
        ais: {
          store: {
            getState: () => ({}),
            subscribe: () => unsubscribe,
          },
        },
      }});
      expect(unsubscribe.mock.calls.length).toBe(0);
      wrapper.unmount();
      expect(unsubscribe.mock.calls.length).toBe(1);
    });

    it('doesn\'t update the component when passed props don\'t change', () => {
      const getProvidedProps = jest.fn(() => {});
      const Dummy = jest.fn(() => null);
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps,
        getId,
      })(Dummy);
      const wrapper = mount(<Connected />, {context: {
        ais: {
          store: {
            getState: () => ({}),
            subscribe: () => null,
          },
        },
      }});
      expect(Dummy.mock.calls.length).toBe(1);
      wrapper.setProps({hello: 'there'});
      expect(Dummy.mock.calls.length).toBe(2);
      wrapper.setProps({hello: 'there'});
      expect(Dummy.mock.calls.length).toBe(2);
    });
  });

  describe('widget', () => {
    it('doesn\'t register itself as a widget when neither getMetadata nor getSearchParameters are present', () => {
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => null,
        getId,
      })(() => null);
      const registerWidget = jest.fn();
      mount(<Connected />, {context: {
        ais: {
          store: {
            getState: () => ({}),
            subscribe: () => null,
          },
          widgetsManager: {
            registerWidget,
          },
        },
      }});
      expect(registerWidget.mock.calls.length).toBe(0);
    });

    it('registers itself as a widget with getMetadata', () => {
      const metadata = {};
      const getMetadata = jest.fn(() => metadata);
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => null,
        getMetadata,
        getId,
      })(() => null);
      const registerWidget = jest.fn();
      const props = {hello: 'there'};
      mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => ({}),
            subscribe: () => null,
          },
          widgetsManager: {
            registerWidget,
          },
        },
      }});
      expect(registerWidget.mock.calls.length).toBe(1);
      const state = {};
      const outputMetadata = registerWidget.mock.calls[0][0].getMetadata(state);
      expect(getMetadata.mock.calls.length).toBe(1);
      expect(getMetadata.mock.calls[0][0]).toEqual(props);
      expect(getMetadata.mock.calls[0][1]).toBe(state);
      expect(outputMetadata).toBe(metadata);
    });

    it('registers itself as a widget with getSearchParameters', () => {
      const sp = {};
      const getSearchParameters = jest.fn(() => sp);
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => null,
        getSearchParameters,
        getId,
      })(() => null);
      const registerWidget = jest.fn();
      const props = {hello: 'there'};
      const state = {
        widgets: {},
      };
      mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => state,
            subscribe: () => null,
          },
          widgetsManager: {
            registerWidget,
          },
        },
      }});
      expect(registerWidget.mock.calls.length).toBe(1);
      const inputSP = {};
      const outputSP = registerWidget.mock.calls[0][0].getSearchParameters(inputSP);
      expect(getSearchParameters.mock.calls.length).toBe(1);
      expect(getSearchParameters.mock.calls[0][0]).toBe(inputSP);
      expect(getSearchParameters.mock.calls[0][1]).toEqual(props);
      expect(getSearchParameters.mock.calls[0][2]).toBe(state.widgets);
      expect(outputSP).toBe(sp);
    });

    it('calls update when props change', () => {
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => null,
        getMetadata: () => null,
        getId,
      })(() => null);
      const update = jest.fn();
      const props = {hello: 'there'};
      const wrapper = mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => ({}),
            subscribe: () => null,
          },
          widgetsManager: {
            registerWidget: () => null,
            update,
          },
        },
      }});
      expect(update.mock.calls.length).toBe(0);
      wrapper.setProps({hello: 'you'});
      expect(update.mock.calls.length).toBe(1);
    });

    it('dont update when props dont change', () => {
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => null,
        getMetadata: () => null,
        getId,
      })(() => null);
      const update = jest.fn();
      const props = {hello: 'there'};
      const wrapper = mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => ({}),
            subscribe: () => null,
          },
          widgetsManager: {
            registerWidget: () => null,
            update,
          },
        },
      }});
      expect(update.mock.calls.length).toBe(0);
      wrapper.setProps({hello: 'there'});
      expect(update.mock.calls.length).toBe(0);
    });

    it('unregisters itself on unmount', () => {
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => null,
        getMetadata: () => null,
        cleanUp: () => ({another: {state: 'state'}}),
      })(() => null);
      const unregister = jest.fn();
      const setState = jest.fn();
      const onInternalStateUpdate = jest.fn();
      const wrapper = mount(<Connected />, {context: {
        ais: {
          store: {
            getState: () => ({widgets: {another: {state: 'state'}}}),
            setState,
            subscribe: () => () => null,
          },
          widgetsManager: {
            registerWidget: () => unregister,
          },
          onInternalStateUpdate,
        },
      }});
      expect(unregister.mock.calls.length).toBe(0);
      expect(setState.mock.calls.length).toBe(0);
      expect(onInternalStateUpdate.mock.calls.length).toBe(0);

      wrapper.unmount();

      expect(unregister.mock.calls.length).toBe(1);
      expect(setState.mock.calls.length).toBe(1);
      expect(onInternalStateUpdate.mock.calls.length).toBe(1);
      expect(setState.mock.calls[0][0]).toEqual({widgets: {another: {state: 'state'}}});
      expect(onInternalStateUpdate.mock.calls[0][0]).toEqual({another: {state: 'state'}});
    });
  });

  describe('refine', () => {
    it('passes a refine method to the component', () => {
      const Dummy = () => null;
      const nextState = {};
      const widgets = {};
      const refine = jest.fn(() => nextState);
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => ({}),
        refine,
        getId,
      })(Dummy);
      const onInternalStateUpdate = jest.fn();
      const props = {hello: 'there'};
      const wrapper = mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => ({
              widgets,
            }),
            subscribe: () => null,
          },
          onInternalStateUpdate,
        },
      }});
      const passedProps = wrapper.find(Dummy).props();
      const arg1 = {};
      const arg2 = {};
      passedProps.refine(arg1, arg2);
      expect(refine.mock.calls[0][0]).toEqual(props);
      expect(refine.mock.calls[0][1]).toBe(widgets);
      expect(refine.mock.calls[0][2]).toBe(arg1);
      expect(refine.mock.calls[0][3]).toBe(arg2);
      expect(onInternalStateUpdate.mock.calls[0][0]).toBe(nextState);
    });

    it('passes a createURL method to the component', () => {
      const Dummy = () => null;
      const nextState = {};
      const widgets = {};
      const refine = jest.fn(() => nextState);
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => ({}),
        refine,
        getId,
      })(Dummy);
      const createHrefForState = jest.fn();
      const props = {hello: 'there'};
      const wrapper = mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => ({
              widgets,
            }),
            subscribe: () => null,
          },
          createHrefForState,
        },
      }});
      const passedProps = wrapper.find(Dummy).props();
      const arg1 = {};
      const arg2 = {};
      passedProps.createURL(arg1, arg2);
      expect(refine.mock.calls[0][0]).toEqual(props);
      expect(refine.mock.calls[0][1]).toBe(widgets);
      expect(refine.mock.calls[0][2]).toBe(arg1);
      expect(refine.mock.calls[0][3]).toBe(arg2);
      expect(createHrefForState.mock.calls[0][0]).toBe(nextState);
    });
  });

  describe('searchForFacetValues', () => {
    it('passes a searchForFacetValues method to the component', () => {
      const Dummy = () => null;
      const searchState = {};
      const widgets = {};
      const searchForFacetValues = jest.fn(() => searchState);
      const Connected = createConnector({
        displayName: 'CoolConnector',
        getProvidedProps: () => ({}),
        searchForFacetValues,
        getId,
      })(Dummy);
      const onSearchForFacetValues = jest.fn();
      const props = {hello: 'there'};
      const wrapper = mount(<Connected {...props} />, {context: {
        ais: {
          store: {
            getState: () => ({
              widgets,
            }),
            subscribe: () => null,
          },
          onSearchForFacetValues,
        },
      }});
      const passedProps = wrapper.find(Dummy).props();
      const facetName = 'facetName';
      const query = 'query';
      passedProps.searchForFacetValues(facetName, query);
      expect(searchForFacetValues.mock.calls[0][0]).toEqual(props);
      expect(searchForFacetValues.mock.calls[0][1]).toBe(widgets);
      expect(searchForFacetValues.mock.calls[0][2]).toBe(facetName);
      expect(searchForFacetValues.mock.calls[0][3]).toBe(query);
      expect(onSearchForFacetValues.mock.calls[0][0]).toBe(searchState);
    });
  });
});
