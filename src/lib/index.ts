import algoliasearchHelper from 'algoliasearch-helper';
import {
  InstantSearch,
  Widget,
  Client,
  Helper,
  SearchParameters,
  DerivedHelper,
} from '../types';
import {
  createDocumentationMessageGenerator,
  enhanceConfiguration,
} from './utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'index',
});

type IndexProps = {
  indexName: string;
};

export type Index = Widget & {
  getHelper(): Helper | null;
  getWidgets(): Widget[];
  addWidgets(widgets: Widget[]): Index;
  removeWidgets(widgets: Widget[]): Index;
};

const index = (props: IndexProps): Index => {
  const { indexName = null } = props || {};

  let localWidgets: Widget[] = [];
  let localInstantSearchInstance: InstantSearch | null = null;
  let helper: Helper | null = null;
  let derivedHelper: DerivedHelper | null = null;

  if (indexName === null) {
    throw new Error(withUsage('The `indexName` option is required.'));
  }

  return {
    getHelper() {
      return helper;
    },

    getWidgets() {
      return localWidgets;
    },

    addWidgets(widgets) {
      if (!Array.isArray(widgets)) {
        throw new Error(
          withUsage('The `addWidgets` method expects an array of widgets.')
        );
      }

      if (
        widgets.some(
          widget =>
            typeof widget.init !== 'function' &&
            typeof widget.render !== 'function'
        )
      ) {
        throw new Error(
          withUsage(
            'The widget definition expects a `render` and/or an `init` method.'
          )
        );
      }

      // The routing manager widget is always added manually at the last position.
      // By removing it from the last position and adding it back after, we ensure
      // it keeps this position.
      // fixes #3148
      const lastWidget = localWidgets.pop();

      localWidgets = localWidgets.concat(widgets);

      if (lastWidget) {
        // Second part of the fix for #3148
        localWidgets = localWidgets.concat(lastWidget);
      }

      if (localInstantSearchInstance && Boolean(widgets.length)) {
        helper!.setState(
          localWidgets.reduce(enhanceConfiguration, {
            ...helper!.state,
          })
        );

        widgets.forEach(widget => {
          if (localInstantSearchInstance && widget.init) {
            widget.init({
              helper: helper!,
              parent: this,
              instantSearchInstance: localInstantSearchInstance,
              state: helper!.state,
              templatesConfig: localInstantSearchInstance.templatesConfig,
              createURL: localInstantSearchInstance._createAbsoluteURL,
              onHistoryChange: localInstantSearchInstance._onHistoryChange,
            });
          }
        });

        localInstantSearchInstance.scheduleSearch();
      }

      return this;
    },

    removeWidgets(widgets) {
      if (!Array.isArray(widgets)) {
        throw new Error(
          withUsage('The `removeWidgets` method expects an array of widgets.')
        );
      }

      if (widgets.some(widget => typeof widget.dispose !== 'function')) {
        throw new Error(
          withUsage('The widget definition expects a `dispose` method.')
        );
      }

      localWidgets = localWidgets.filter(
        widget => widgets.indexOf(widget) === -1
      );

      if (localInstantSearchInstance && widgets.length) {
        const nextState = widgets.reduce((state, widget) => {
          // the `dispose` method exists at this point we already assert it
          const next = widget.dispose!({ helper: helper!, state });

          return next || state;
        }, helper!.state);

        helper!.setState(
          localWidgets.reduce(enhanceConfiguration, {
            ...nextState,
          })
        );

        if (localWidgets.length) {
          localInstantSearchInstance.scheduleSearch();
        }
      }

      return this;
    },

    init({ instantSearchInstance, parent }) {
      localInstantSearchInstance = instantSearchInstance;

      // The `mainHelper` is already defined at this point. The instance is created
      // inside InstantSearch at the `start` method, which occurs before the `init`
      // step.
      const mainHelper = instantSearchInstance.mainHelper!;

      const initialSearchParameters =
        // Uses the `searchParameters` for the top level index only, it allows
        // us to have the exact same behaviour than before for the mono-index.
        parent === null ? instantSearchInstance._searchParameters : {};

      // This Helper is only used for state management we do not care about the
      // `searchClient`. Only the "main" Helper created at the `InstantSearch`
      // level is aware of the client.
      helper = algoliasearchHelper(
        {} as Client,
        indexName,
        localWidgets.reduce(enhanceConfiguration, initialSearchParameters)
      );

      // We forward the call to `search` to the "main" instance of the Helper
      // which is responsible for managing the queries (it's the only one that is
      // aware of the `searchClient`).
      helper.search = () => mainHelper.search();

      // We use the same pattern for the `searchForFacetValues`.
      helper.searchForFacetValues = (
        facetName,
        facetValue,
        maxFacetHits,
        userState: Partial<SearchParameters>
      ) => {
        const state = helper!.state.setQueryParameters(userState);

        return mainHelper.searchForFacetValues(
          facetName,
          facetValue,
          maxFacetHits,
          state
        );
      };

      derivedHelper = mainHelper.derive(() => {
        // @TODO: resolve the root and merge the SearchParameters
        return helper!.state;
      });

      // We have to use `!` at the moment because `dervive` is not correctly typed.
      derivedHelper!.on('search', () => {
        // The index does not manage the "stalleness" of the search. This is the
        // responsibility of the main instance. It does not make sense to manage
        // it at the index level because it's either: all of them or none of them
        // that are stalled. The queries are performed into a single network request.
        instantSearchInstance.scheduleStalledRender();
      });

      // We have to use `!` at the moment because `dervive` is not correctly typed.
      derivedHelper!.on('result', () => {
        // The index does not render the results it schedules a new render
        // to let all the other indices emit their own results. It allows us to
        // run the render process in one pass.
        instantSearchInstance.scheduleRender();
      });

      localWidgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            helper: helper!,
            parent: this,
            instantSearchInstance,
            state: helper!.state,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL: instantSearchInstance._createAbsoluteURL,
            onHistoryChange: instantSearchInstance._onHistoryChange,
          });
        }
      });
    },

    render({ instantSearchInstance }) {
      localWidgets.forEach(widget => {
        // At this point, all the variables used below are set. Both `helper`
        //  and `derivedHelper` has been created at the `init` step. The attribute
        // `lastResults` is set before the event `result` is emitted. At this stage,
        // the event has emitted hence the value is already set.

        if (widget.render) {
          widget.render({
            helper: helper!,
            instantSearchInstance,
            results: derivedHelper!.lastResults!,
            state: derivedHelper!.lastResults!._state,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL: instantSearchInstance._createAbsoluteURL,
            searchMetadata: {
              isSearchStalled: instantSearchInstance._isSearchStalled,
            },
          });
        }
      });
    },

    dispose() {
      localWidgets.forEach(widget => {
        if (widget.dispose) {
          // The dispose function is always called once the instance is started
          // (it's an effect of `removeWidgets`). The index is initialized and
          // the Helper is available. We don't care about the return value of
          // `dispose` because the index is removed. We can't call `removeWidgets`
          // because we want to keep the widgets on the instance, to allow idempotent
          // operations on `add` & `remove`.
          widget.dispose({ helper: helper!, state: helper!.state });
        }
      });

      localInstantSearchInstance = null;
      helper = null;

      derivedHelper!.detach();
      derivedHelper = null;
    },
  };
};

export default index;
