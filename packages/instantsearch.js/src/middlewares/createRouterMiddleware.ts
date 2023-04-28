import historyRouter from '../lib/routers/history';
import simpleStateMapping from '../lib/stateMappings/simple';
import { isEqual } from '../lib/utils';

import type {
  Router,
  StateMapping,
  UiState,
  InternalMiddleware,
  CreateURL,
} from '../types';

export type RouterProps<
  TUiState extends UiState = UiState,
  TRouteState = TUiState
> = {
  router?: Router<TRouteState>;
  // ideally stateMapping should be required if TRouteState is given,
  // but there's no way to check if a generic is provided or the default value.
  stateMapping?: StateMapping<TUiState, TRouteState>;
  /**
   * @internal indicator for the default middleware
   */
  $$internal?: boolean;
};

export const createRouterMiddleware = <
  TUiState extends UiState = UiState,
  TRouteState = TUiState
>(
  props: RouterProps<TUiState, TRouteState> = {}
): InternalMiddleware<TUiState> => {
  const {
    router = historyRouter<TRouteState>(),
    // We have to cast simpleStateMapping as a StateMapping<TUiState, TRouteState>.
    // this is needed because simpleStateMapping is StateMapping<TUiState, TUiState>.
    // While it's only used when UiState and RouteState are the same, unfortunately
    // TypeScript still considers them separate types.
    stateMapping = simpleStateMapping<TUiState>() as unknown as StateMapping<
      TUiState,
      TRouteState
    >,
    $$internal = false,
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

    let lastRouteState: TRouteState | undefined = undefined;

    const initialUiState = instantSearchInstance._initialUiState;

    return {
      $$type: `ais.router({router:${
        router.$$type || '__unknown__'
      }, stateMapping:${stateMapping.$$type || '__unknown__'}})`,
      $$internal,
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
        instantSearchInstance._initialUiState = {
          ...initialUiState,
          ...stateMapping.routeToState(router.read()),
        };

        router.onUpdate((route) => {
          instantSearchInstance.setUiState(stateMapping.routeToState(route));
        });
      },

      started() {
        router.start?.();
      },

      unsubscribe() {
        router.dispose();
      },
    };
  };
};
