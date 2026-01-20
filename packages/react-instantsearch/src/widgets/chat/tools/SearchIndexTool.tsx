import AlgoliaSearchHelper from 'algoliasearch-helper';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  createButtonComponent,
} from 'instantsearch-ui-components';
import { isIndexWidget } from 'instantsearch.js/es/lib/utils';
import React, { createElement } from 'react';
import {
  useInstantSearch,
  useInstantSearchContext,
} from 'react-instantsearch-core';

import { Carousel } from '../../../components';

import type {
  ClientSideToolComponentProps,
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTool,
} from 'instantsearch-ui-components';
import type { IndexUiState, IndexWidget } from 'instantsearch.js';
import type { ComponentProps } from 'react';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

type SearchToolInput = {
  query: string;
  number_of_results?: number;
  facet_filters?: string[][];
};

function getLocalWidgetsUiState(
  widgets: Array<Widget | IndexWidget>,
  widgetStateOptions: WidgetUiStateOptions,
  initialUiState: IndexUiState = {}
) {
  return widgets.reduce((uiState, widget) => {
    if (isIndexWidget(widget)) {
      return uiState;
    }

    if (!widget.getWidgetUiState && !widget.getWidgetState) {
      return uiState;
    }

    if (widget.getWidgetUiState) {
      return widget.getWidgetUiState(uiState, widgetStateOptions);
    }

    return widget.getWidgetState!(uiState, widgetStateOptions);
  }, initialUiState);
}

function createCarouselTool<TObject extends RecordWithObjectID>(
  showViewAll: boolean,
  itemComponent?: ItemComponent<TObject>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideTool {
  const Button = createButtonComponent({
    createElement: createElement as Pragma,
  });

  function SearchLayoutComponent({
    message,
    indexUiState,
    setIndexUiState,
    onClose,
  }: ClientSideToolComponentProps) {
    const input = message?.input as
      | {
          query: string;
          number_of_results?: number;
        }
      | undefined;

    const output = message?.output as
      | {
          hits?: Array<RecordWithObjectID<TObject>>;
          nbHits?: number;
        }
      | undefined;

    const items = output?.hits || [];

    const MemoedHeaderComponent = React.useMemo(() => {
      return (
        props: Omit<
          ComponentProps<typeof HeaderComponent>,
          | 'nbHits'
          | 'query'
          | 'hitsPerPage'
          | 'setIndexUiState'
          | 'indexUiState'
          | 'getSearchPageURL'
          | 'onClose'
        >
      ) => (
        <HeaderComponent
          nbHits={output?.nbHits}
          input={input}
          hitsPerPage={items.length}
          setIndexUiState={setIndexUiState}
          indexUiState={indexUiState}
          getSearchPageURL={getSearchPageURL}
          onClose={onClose}
          {...props}
        />
      );
    }, [
      items.length,
      input,
      output?.nbHits,
      setIndexUiState,
      onClose,
      indexUiState,
    ]);

    return (
      <Carousel
        items={items}
        itemComponent={itemComponent}
        sendEvent={() => {}}
        showNavigation={false}
        headerComponent={MemoedHeaderComponent}
      />
    );
  }

  function HeaderComponent({
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    nbHits,
    input,
    hitsPerPage,
    setIndexUiState,
    indexUiState,
    // eslint-disable-next-line no-shadow
    getSearchPageURL,
    onClose,
  }: {
    canScrollLeft: boolean;
    canScrollRight: boolean;
    scrollLeft: () => void;
    scrollRight: () => void;
    nbHits?: number;
    input?: SearchToolInput;
    hitsPerPage?: number;
    setIndexUiState: IndexWidget['setIndexUiState'];
    indexUiState: IndexUiState;
    getSearchPageURL?: (nextUiState: IndexUiState) => string;
    onClose: () => void;
  }) {
    const search = useInstantSearchContext();
    const { indexRenderState } = useInstantSearch();

    if ((hitsPerPage ?? 0) < 1) {
      return null;
    }

    return (
      <div className="ais-ChatToolSearchIndexCarouselHeader">
        <div className="ais-ChatToolSearchIndexCarouselHeaderResults">
          {nbHits && (
            <div className="ais-ChatToolSearchIndexCarouselHeaderCount">
              {hitsPerPage ?? 0} of {nbHits.toLocaleString()} result
              {nbHits > 1 ? 's' : ''}
            </div>
          )}
          {showViewAll && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!input?.query) return;

                  input.facet_filters = [
                    ['brand:Samsung'],
                    [
                      'categories:Cell Phones',
                      'categories:Unlocked Cell Phones',
                    ],
                  ];

                  const attributeMap = input.facet_filters.reduce(
                    (acc, filters) => {
                      filters.forEach((filter) => {
                        const [facet, value] = filter.split(':');
                        if (!acc[facet]) {
                          acc[facet] = [];
                        }
                        acc[facet].push(value);
                      });
                      return acc;
                    },
                    {} as Record<string, string[]>
                  );

                  const facetFilters: string[] = [];
                  const facetRefinements: Record<string, string[]> = {};
                  const disjunctiveFacets: string[] = [];
                  const disjunctiveFacetsRefinements: Record<string, string[]> =
                    {};

                  if (indexRenderState.refinementList) {
                    Object.keys(indexRenderState.refinementList).forEach(
                      (attribute) => {
                        if (
                          indexRenderState.refinementList?.[attribute]
                            .widgetParams.operator === 'and'
                        ) {
                          facetFilters.push(attribute);
                          facetRefinements[attribute] = attributeMap[attribute];
                        } else {
                          disjunctiveFacets.push(attribute);
                          disjunctiveFacetsRefinements[attribute] =
                            attributeMap[attribute];
                        }
                      }
                    );
                  }

                  const searchParameters =
                    new AlgoliaSearchHelper.SearchParameters({
                      query: input.query,
                      facets: facetFilters.length ? facetFilters : undefined,
                      facetsRefinements:
                        Object.keys(facetRefinements).length > 0
                          ? facetRefinements
                          : undefined,
                      disjunctiveFacets: disjunctiveFacets.length
                        ? disjunctiveFacets
                        : undefined,
                      disjunctiveFacetsRefinements:
                        Object.keys(disjunctiveFacetsRefinements).length > 0
                          ? disjunctiveFacetsRefinements
                          : undefined,
                    });

                  const newState = getLocalWidgetsUiState(
                    search.mainIndex.getWidgets(),
                    {
                      searchParameters,
                    }
                  );

                  const nextUiState = {
                    ...indexUiState,
                    ...newState,
                  };

                  if (!indexRenderState.currentRefinements?.aiMode) {
                    indexRenderState.currentRefinements?.setAiMode(true);
                  }

                  // If no main search page URL or we are on the search page, just update the state
                  if (
                    !getSearchPageURL ||
                    (getSearchPageURL &&
                      new URL(getSearchPageURL(nextUiState)).pathname ===
                        window.location.pathname)
                  ) {
                    setIndexUiState(nextUiState);
                    onClose();
                    return;
                  }

                  // Navigate to different page
                  window.location.href = getSearchPageURL(nextUiState);
                }}
                className="ais-ChatToolSearchIndexCarouselHeaderViewAll"
              >
                View all
                <ArrowRightIcon createElement={createElement as Pragma} />
              </Button>
            </>
          )}
        </div>

        {(hitsPerPage ?? 0) > 2 && (
          <div className="ais-ChatToolSearchIndexCarouselHeaderScrollButtons">
            <Button
              variant="outline"
              size="sm"
              iconOnly
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
            >
              <ChevronLeftIcon createElement={createElement as Pragma} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconOnly
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
            >
              <ChevronRightIcon createElement={createElement as Pragma} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return {
    layoutComponent: SearchLayoutComponent,
  };
}

export { createCarouselTool };
