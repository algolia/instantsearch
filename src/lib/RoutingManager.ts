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

  public constructor({
    router,
    stateMapping,
    instantSearchInstance,
  }: RoutingManagerProps) {
    this.router = router;
    this.stateMapping = stateMapping;
    this.instantSearchInstance = instantSearchInstance;

    this.createURL = this.createURL.bind(this);
    this.applyStateFromRoute = this.applyStateFromRoute.bind(this);

    this.router.onUpdate(this.applyStateFromRoute);
  }

  public applyStateFromRoute(route: UiState): void {
    const currentUiState = this.stateMapping.routeToState(route);

    walk(this.instantSearchInstance.mainIndex, current => {
      const widgets = current.getWidgets();
      const indexUiState = currentUiState[current.getIndexId()] || {};

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
  }

  public read(): UiState {
    const route = this.router.read();

    return this.stateMapping.routeToState(route);
  }

  public write({ state }: { state: UiState }) {
    const route = this.stateMapping.stateToRoute(state);

    this.router.write(route);
  }

  public dispose(): void {
    this.router.dispose();
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
