import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  createButtonComponent,
} from 'instantsearch-ui-components';
import { isIndexWidget } from 'instantsearch.js/es/lib/utils';
import React, { createElement } from 'react';
import { useInstantSearchContext } from 'react-instantsearch-core';

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

                  const attributes = input.facet_filters
                    .flat()
                    .map((filter) => {
                      const [attribute, value] = filter.split(':');

                      return { attribute, value };
                    });

                  const helper = search.mainIndex.getHelper();
                  if (!helper) return;

                  if (input.query) {
                    helper.setQuery(input.query);
                  }

                  attributes.forEach(({ attribute }) => {
                    helper.clearRefinements(attribute);
                  });

                  attributes.forEach(({ attribute, value }) => {
                    const hierarchicalFacet =
                      helper.state.hierarchicalFacets.find(
                        (facet) => facet.name === attribute
                      );

                    if (hierarchicalFacet) {
                      helper.toggleFacetRefinement(
                        hierarchicalFacet.name,
                        value
                      );
                    } else {
                      helper.toggleFacetRefinement(attribute, value);
                    }
                  });

                  helper.search();

                  if (
                    getSearchPageURL &&
                    new URL(getSearchPageURL(helper.state)).pathname !==
                      window.location.pathname
                  ) {
                    window.location.href = getSearchPageURL(helper.state);
                  } else {
                    onClose();
                  }
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
