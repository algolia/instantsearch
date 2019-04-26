import algoliasearchHelper from 'algoliasearch-helper';
import { isEqual } from './utils';
import {
  InstantSearch,
  UiState,
  SearchParameters,
  Router,
  StateMapping,
  Widget,
} from '../types';

type RoutingManagerProps = {
  instantSearchInstance: InstantSearch;
  router: Router;
  stateMapping: StateMapping;
};

class RoutingManager implements Widget {
  private readonly instantSearchInstance: RoutingManagerProps['instantSearchInstance'];
  private readonly router: RoutingManagerProps['router'];
  private readonly stateMapping: RoutingManagerProps['stateMapping'];

  private firstRender: boolean;
  private currentUIState: UiState;
  private initState?: UiState;
  private renderURLFromState?: (searchParameters: SearchParameters) => void;

  public constructor({
    router,
    stateMapping,
    instantSearchInstance,
  }: RoutingManagerProps) {
    this.router = router;
    this.stateMapping = stateMapping;
    this.instantSearchInstance = instantSearchInstance;

    this.firstRender = true;
    this.currentUIState = this.stateMapping.routeToState(this.router.read());
  }

  private getAllSearchParameters({
    currentSearchParameters,
    uiState,
  }): Partial<SearchParameters> {
    const widgets = this.instantSearchInstance.widgets!;

    const searchParameters = widgets.reduce((parameters, widget) => {
      if (!widget.getWidgetSearchParameters) {
        return parameters;
      }

      return widget.getWidgetSearchParameters(parameters, {
        uiState,
      });
    }, currentSearchParameters);

    return searchParameters;
  }

  private getAllUIStates({
    searchParameters,
  }: {
    searchParameters: SearchParameters;
  }): UiState {
    const widgets = this.instantSearchInstance.widgets!;
    const helper = this.instantSearchInstance.helper!;

    const uiState = widgets
      .filter(widget => Boolean(widget.getWidgetState))
      .reduce(
        (state, widget) =>
          widget.getWidgetState!(state, {
            helper,
            searchParameters,
          }),
        {}
      );

    return uiState;
  }

  private setupRouting(state: SearchParameters): void {
    const helper = this.instantSearchInstance.helper!;

    this.router.onUpdate(route => {
      const nextUiState = this.stateMapping.routeToState(route);
      const widgetsUIState = this.getAllUIStates({
        searchParameters: helper.state,
      });

      if (isEqual(nextUiState, widgetsUIState)) {
        return;
      }

      this.currentUIState = nextUiState;

      const searchParameters = this.getAllSearchParameters({
        currentSearchParameters: state,
        uiState: this.currentUIState,
      });

      helper
        .overrideStateWithoutTriggeringChangeEvent(searchParameters)
        .search();
    });

    this.renderURLFromState = searchParameters => {
      this.currentUIState = this.getAllUIStates({
        searchParameters,
      });

      const route = this.stateMapping.stateToRoute(this.currentUIState);

      this.router.write(route);
    };

    helper.on('change', this.renderURLFromState);

    // Compare initial state and first render state to see if the query has been
    // changed by the `searchFunction`. It's required because the helper of the
    // `searchFunction` does not trigger change event (not the same instance).
    const firstRenderState = this.getAllUIStates({
      searchParameters: state,
    });

    if (!isEqual(this.initState, firstRenderState)) {
      // Force update the URL, if the state has changed since the initial read.
      // We do this in order to make the URL update when there is `searchFunction`
      // that prevents the search of the initial rendering.
      // See: https://github.com/algolia/instantsearch.js/issues/2523#issuecomment-339356157
      this.currentUIState = firstRenderState;

      const route = this.stateMapping.stateToRoute(this.currentUIState);

      this.router.write(route);
    }
  }

  public init({ state }: { state: SearchParameters }): void {
    // Store the initial state from the storage to compare it with the state on next renders
    // in case the `searchFunction` has modified it.
    this.initState = this.getAllUIStates({
      searchParameters: state,
    });
  }

  public getConfiguration(
    currentConfiguration: Partial<SearchParameters>
  ): Partial<SearchParameters> {
    // We have to create a `SearchParameters` because `getAllSearchParameters`
    // expects an instance of `SearchParameters` and not a plain object.
    const currentSearchParameters = algoliasearchHelper.SearchParameters.make(
      currentConfiguration
    );

    return {
      ...this.getAllSearchParameters({
        uiState: this.currentUIState,
        currentSearchParameters,
      }),
    };
  }

  public render({ state }: { state: SearchParameters }): void {
    if (this.firstRender) {
      this.firstRender = false;
      this.setupRouting(state);
    }
  }

  public dispose(): void {
    if (this.renderURLFromState) {
      this.instantSearchInstance.helper!.removeListener(
        'change',
        this.renderURLFromState
      );
    }

    this.router.dispose();
  }

  public createURL(state: SearchParameters): string {
    const uiState = this.getAllUIStates({
      searchParameters: state,
    });
    const route = this.stateMapping.stateToRoute(uiState);

    return this.router.createURL(route);
  }

  public onHistoryChange(
    callback: (state: Partial<SearchParameters>) => void
  ): void {
    const helper = this.instantSearchInstance.helper!;

    this.router.onUpdate(route => {
      const nextUiState = this.stateMapping.routeToState(route);

      const widgetsUIState = this.getAllUIStates({
        searchParameters: helper.state,
      });

      if (isEqual(nextUiState, widgetsUIState)) {
        return;
      }

      this.currentUIState = nextUiState;

      const searchParameters = this.getAllSearchParameters({
        currentSearchParameters: helper.state,
        uiState: this.currentUIState,
      });

      callback({ ...searchParameters });
    });
  }
}

export default RoutingManager;
