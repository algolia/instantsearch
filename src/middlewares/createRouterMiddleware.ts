import simpleStateMapping from '../lib/stateMappings/simple';
import historyRouter from '../lib/routers/history';
import {
  Router,
  StateMapping,
  UiState,
  InternalMiddleware,
  CreateURL,
} from '../types';
import { isEqual } from '../lib/utils';

export type RouterProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = {
  router?: Router<TRouteState>;
  stateMapping?: StateMapping<TUiState, TRouteState>;
};

export const createRouterMiddleware = <
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>(
  props: RouterProps<TUiState, TRouteState> = {}
): InternalMiddleware<TUiState> => {
  const {
    router = historyRouter<TRouteState>(),
    // technically this is wrong, as without stateMapping parameter given, the routeState *must* be UiState
    stateMapping = (simpleStateMapping() as unknown) as StateMapping<
      TUiState,
      TRouteState
    >,
  } = props;

  return ({ instantSearchInstance }) => {
    function topLevelCreateURL(nextState: TUiState) {
      const uiState: TUiState = Object.keys(nextState).reduce(
        (acc, indexId) => ({
          ...acc,
          [indexId]: nextState[indexId],
        }),
        instantSearchInstance.mainIndex.getWidgetUiState<TUiState>(
          {} as TUiState
        )
      );

      const route = stateMapping.stateToRoute(uiState);

      return router.createURL(route);
    }

    // casting to UiState here to keep createURL unaware of custom UiState
    // (as long as it's an object, it's ok)
    instantSearchInstance._createURL = topLevelCreateURL as CreateURL<UiState>;
    instantSearchInstance._initialUiState = {
      ...instantSearchInstance._initialUiState,
      ...stateMapping.routeToState(router.read()),
    };

    let lastRouteState: TRouteState | undefined = undefined;

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
