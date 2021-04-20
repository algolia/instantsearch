import simpleStateMapping from '../lib/stateMappings/simple';
import historyRouter from '../lib/routers/history';
import {
  Router,
  StateMapping,
  UiState,
  InternalMiddleware,
  RouteState,
} from '../types';
import { isEqual } from '../lib/utils';

export type RouterProps = {
  router?: Router;
  stateMapping?: StateMapping;
};

export type RoutingManager = (props?: RouterProps) => InternalMiddleware;

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
          instantSearchInstance.setUiState(stateMapping.routeToState(route));
        });
      },

      unsubscribe() {
        router.dispose();
      },
    };
  };
};
