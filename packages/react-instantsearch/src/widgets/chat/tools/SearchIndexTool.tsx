import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  createButtonComponent,
} from 'instantsearch-ui-components';
import React, { createElement } from 'react';

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
    applyFilters,
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
          | 'applyFilters'
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
          applyFilters={applyFilters}
          {...props}
        />
      );
    }, [
      items.length,
      input,
      output?.nbHits,
      applyFilters,
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
    applyFilters,
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
    applyFilters: ClientSideToolComponentProps['applyFilters'];
    getSearchPageURL?: (nextUiState: IndexUiState) => string;
    onClose: () => void;
  }) {
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
                  if (!input || !applyFilters) return;

                  const success = applyFilters({
                    query: input.query,
                    facetFilters: input.facet_filters,
                  });
                  if (success) {
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
