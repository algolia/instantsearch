import simpleStateMapping from '../lib/stateMappings/simple';
import historyRouter from '../lib/routers/history';
import { Index } from '../widgets/index/index';
import { Middleware } from '.';
import { Router, StateMapping, UiState } from '../types';

const walk = (current: Index, callback: (index: Index) => void) => {
  callback(current);
  current
    .getWidgets()
    .filter(function(widget): widget is Index {
      return widget.$$type === 'ais.index';
    })
    .forEach(innerIndex => {
      walk(innerIndex, callback);
    });
};

export interface RouterProps<TRouteState = UiState> {
  router?: Router<TRouteState>;
  stateMapping?: StateMapping<TRouteState>;
}

export type RoutingManager<TRouteState = UiState> = (
  props?: RouterProps<TRouteState>
) => Middleware;

export const createRouter: RoutingManager = (props = {}) => {
  const {
    router = historyRouter(),
    stateMapping = simpleStateMapping(),
  } = props;

  return ({ instantSearchInstance }) => {
    function topLevelCreateURL(nextState: UiState) {
      const uiState: UiState = Object.keys(nextState).reduce(
        (acc, indexId) => ({
          ...acc,
          [indexId]: nextState[indexId],
        }),
        instantSearchInstance.mainIndex.getWidgetState({})
      );

      const route = stateMapping.stateToRoute(uiState);

      return router.createURL(route);
    }

    instantSearchInstance._createURL = topLevelCreateURL;
    instantSearchInstance._initialUiState = {
      ...instantSearchInstance._initialUiState,
      ...stateMapping.routeToState(router.read()),
    };

    return {
      onStateChange({ state }) {
        const route = stateMapping.stateToRoute(state);

        router.write(route);
      },

      subscribe() {
        router.onUpdate(route => {
          const uiState = stateMapping.routeToState(route);

          walk(instantSearchInstance.mainIndex, current => {
            const widgets = current.getWidgets();
            const indexUiState = uiState[current.getIndexId()] || {};

            const searchParameters = widgets.reduce((parameters, widget) => {
              if (!widget.getWidgetSearchParameters) {
                return parameters;
              }

              return widget.getWidgetSearchParameters(parameters, {
                uiState: indexUiState,
              });
            }, current.getHelper()!.state);

            current
              .getHelper()!
              .overrideStateWithoutTriggeringChangeEvent(searchParameters);

            instantSearchInstance.scheduleSearch();
          });
        });
      },

      unsubscribe() {
        router.dispose();
      },
    };
  };
};
