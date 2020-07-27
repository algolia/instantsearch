import simpleStateMapping from '../lib/stateMappings/simple';
import historyRouter from '../lib/routers/history';
import { Index } from '../widgets/index/index';
import {
  Router,
  StateMapping,
  UiState,
  Middleware,
  RouteState,
} from '../types';
import { isEqual } from '../lib/utils';

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

export type RouterProps = {
  router?: Router;
  stateMapping?: StateMapping;
};

export type RoutingManager = (props?: RouterProps) => Middleware;

export const createRouterMiddleware: RoutingManager = (props = {}) => {
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
        instantSearchInstance.mainIndex.getWidgetUiState({})
      );

      const route = stateMapping.stateToRoute(uiState);

      return router.createURL(route);
    }

    instantSearchInstance._createURL = topLevelCreateURL;
    instantSearchInstance._initialUiState = {
      ...instantSearchInstance._initialUiState,
      ...stateMapping.routeToState(router.read()),
    };

    let lastRouteState: RouteState | undefined = undefined;

    return {
      onStateChange({ uiState }) {
        const routeState = stateMapping.stateToRoute(uiState);

        if (
          lastRouteState === undefined ||
          !isEqual(lastRouteState, routeState)
        ) {
          router.write(routeState);
          lastRouteState = routeState;
        }
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
