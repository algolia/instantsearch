import { isEqual } from './utils';
import {
  InstantSearch,
  UiState,
  SearchParameters,
  Router,
  StateMapping,
  Widget,
} from '../types';

type UiStateChange = (uiState: UiState) => void;

type RoutingManagerProps = {
  instantSearchInstance: InstantSearch;
  router: Router;
  stateMapping: StateMapping;
  onUiStateChange: UiStateChange;
};

class RoutingManager implements Widget {
  private readonly instantSearchInstance: InstantSearch;
  private readonly router: Router;
  private readonly stateMapping: StateMapping;
  private readonly onUiStateChange: UiStateChange;

  private isFirstRender: boolean = true;
  private initState?: UiState;

  public constructor({
    router,
    stateMapping,
    instantSearchInstance,
    onUiStateChange,
  }: RoutingManagerProps) {
    this.router = router;
    this.stateMapping = stateMapping;
    this.instantSearchInstance = instantSearchInstance;
    this.onUiStateChange = onUiStateChange;

    this.onUiStateChange(this.stateMapping.routeToState(this.router.read()));
  }

  private setupRouting(state: SearchParameters): void {
    const helper = this.instantSearchInstance.helper!;

    this.router.onUpdate(route => {
      const nextUiState = this.stateMapping.routeToState(route);
      const widgetsUiState = this.instantSearchInstance.getWidgetsUiState({
        searchParameters: helper.state,
      });

      if (isEqual(nextUiState, widgetsUiState)) {
        return;
      }

      const searchParameters = this.instantSearchInstance.getWidgetsSearchParameters(
        {
          // @TODO: use a blank state
          currentSearchParameters: state,
          uiState: nextUiState,
        }
      );

      this.onUiStateChange(nextUiState);

      helper
        .overrideStateWithoutTriggeringChangeEvent(searchParameters)
        .search();
    });

    // Compare initial state and first render state to see if the query has been
    // changed by the `searchFunction`. It's required because the helper of the
    // `searchFunction` does not trigger change event (not the same instance).
    const firstRenderState = this.instantSearchInstance.getWidgetsUiState({
      searchParameters: state,
    });

    if (!isEqual(this.initState, firstRenderState)) {
      // Force update the URL, if the state has changed since the initial read.
      // We do this in order to make the URL update when there is `searchFunction`
      // that prevents the search of the initial rendering.
      // See: https://github.com/algolia/instantsearch.js/issues/2523#issuecomment-339356157
      this.onUiStateChange(firstRenderState);

      this.renderUiState(firstRenderState);
    }
  }

  public init({ state }: { state: SearchParameters }): void {
    // Store the initial state from the storage to compare it with the state on
    // next renders in case the `searchFunction` has modified it.
    this.initState = this.instantSearchInstance.getWidgetsUiState({
      searchParameters: state,
    });
  }

  public render({ state }: { state: SearchParameters }): void {
    if (this.isFirstRender) {
      this.isFirstRender = false;
      this.setupRouting(state);
    }
  }

  public dispose({ helper, state }): void {
    if (this.router.dispose) {
      this.router.dispose({ helper, state });
    }
  }

  public renderUiState(uiState: UiState): void {
    const route = this.stateMapping.stateToRoute(uiState);

    this.router.write(route);
  }

  public createURL(state: SearchParameters): string {
    const uiState = this.instantSearchInstance.getWidgetsUiState({
      searchParameters: state,
    });

    const route = this.stateMapping.stateToRoute(uiState);

    return this.router.createURL(route);
  }
}

export default RoutingManager;
