import { InstantSearch, UiState, Router, StateMapping } from '../types';
import { Index } from '../widgets/index/index';

type RoutingManagerProps = {
  instantSearchInstance: InstantSearch;
  router: Router;
  stateMapping: StateMapping;
};

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

class RoutingManager {
  private readonly instantSearchInstance: InstantSearch;
  private readonly router: Router;
  private readonly stateMapping: StateMapping;

  private currentUiState: UiState;

  public constructor({
    router,
    stateMapping,
    instantSearchInstance,
  }: RoutingManagerProps) {
    this.router = router;
    this.stateMapping = stateMapping;
    this.instantSearchInstance = instantSearchInstance;
    this.currentUiState = this.stateMapping.routeToState(this.router.read());

    this.createURL = this.createURL.bind(this);
  }

  public setupRouting(): void {
    walk(this.instantSearchInstance.mainIndex, current => {
      const widgets = current.getWidgets();
      const indexUiState = this.currentUiState[current.getIndexId()] || {};

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

      this.instantSearchInstance.scheduleSearch();
    });

    // @TODO: Update state on external route update (popState)
    // this.router.onUpdate(route => {});
  }

  public write({ state }: { state: UiState }) {
    const route = this.stateMapping.stateToRoute(state);

    this.router.write(route);
  }

  public dispose({ helper, state }): void {
    if (this.router.dispose) {
      this.router.dispose({ helper, state });
    }
  }

  public createURL(nextState: UiState): string {
    const uiState = Object.keys(nextState).reduce(
      (acc, indexId) => ({
        ...acc,
        [indexId]: nextState[indexId],
      }),
      this.instantSearchInstance.mainIndex.getWidgetState({})
    );

    const route = this.stateMapping.stateToRoute(uiState);

    return this.router.createURL(route);
  }
}

export default RoutingManager;
