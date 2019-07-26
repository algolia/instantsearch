import { UiState, Router, StateMapping } from '../../types';
import { Index } from '../../widgets/index/index';
import { isEqual } from '../utils';
import { CreatePlaceholder, Placeholder } from './index';

type CreateRoutingPlaceholder = CreatePlaceholder<CreateRoutingPlaceholderArgs>;

type CreateRoutingPlaceholderArgs = {
  router: Router;
  stateMapping: StateMapping;
};

export const createRoutingPlaceholder: CreateRoutingPlaceholder = ({
  router,
  stateMapping,
}) => {
  let currentUiState: UiState;

  const walk = (current: Index, callback: (index: Index) => void) => {
    callback(current);

    return current
      .getWidgets()
      .filter(function(widget): widget is Index {
        // @ts-ignore
        return widget.$$type === 'ais.index';
      })
      .forEach(innerIndex => {
        walk(innerIndex, callback);
      });
  };

  const middleware: Placeholder = ({ uiState }) => {
    currentUiState = uiState;
    router.write(stateMapping.stateToRoute(uiState));
  };

  middleware.intialState = ({ uiState }) => {
    currentUiState = {
      ...uiState,
      ...stateMapping.routeToState(router.read()),
    };

    return currentUiState;
  };

  middleware.subscribe = ({ instantSearchInstance }) => {
    router.onUpdate(route => {
      const nextUiState = stateMapping.routeToState(route);
      // @ts-ignore
      const widgetsUiState = instantSearchInstance.getWidgetState();

      if (isEqual(nextUiState, widgetsUiState)) {
        return;
      }

      currentUiState = nextUiState;

      walk(instantSearchInstance.mainIndex, current => {
        const uiState = currentUiState[current.getIndexName()] || {};

        current.setUiState(uiState);

        current.getHelper()!.overrideStateWithoutTriggeringChangeEvent(
          current.getSearchParameters({
            // Use the previous state to avoid loosing state used
            // by custom widget that do not impleement lifecyle. We
            // have to clear the refinements inside the function then
            // otherwise we always get the previous value.
            parameters: current.getHelper()!.state,
          })
        );

        instantSearchInstance.scheduleSearch();
      });
    });

    return () => {
      if (router.dispose) {
        router.dispose();
      }
    };
  };

  middleware.renderOptions = () => {
    return {
      routing: {
        createURL({ indexId, uiState }) {
          return router.createURL(
            stateMapping.stateToRoute({
              ...currentUiState,
              [indexId]: uiState,
            })
          );
        },
      },
    };
  };

  return middleware;
};

export default createRoutingPlaceholder;
