import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  createButtonComponent,
  createSuggestedFiltersComponent,
  createChatMessageLoaderComponent,
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

function createCarouselTool<TObject extends RecordWithObjectID>(
  showViewAll: boolean,
  itemComponent?: ItemComponent<TObject>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideTool {
  const Button = createButtonComponent({
    createElement: createElement as Pragma,
  });

  const SuggestedFilters = createSuggestedFiltersComponent({
    createElement: createElement as Pragma,
  });

  const ChatMessageLoader = createChatMessageLoaderComponent({
    createElement: createElement as Pragma,
  });

  function SearchLayoutComponent({
    message,
    indexUiState,
    toolState,
    setIndexUiState,
    onClose,
    sendMessage,
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
          suggestedFilters?: Array<{
            label: string;
            attribute: string;
            value: string;
            count: number;
          }>;
        }
      | undefined;

    const items = output?.hits || [];
    const suggestedFilters = output?.suggestedFilters || [];

    const handleFilterClick = React.useCallback(
      (attribute: string, value: string, isRefined: boolean) => {
        const action = isRefined ? 'Remove' : 'Apply';
        sendMessage({
          text: `${action} the ${attribute} filter: ${value}`,
        });
      },
      [sendMessage]
    );

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
          query={input?.query}
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
      input?.query,
      output?.nbHits,
      setIndexUiState,
      onClose,
      indexUiState,
    ]);

    if (toolState === 'input-streaming') {
      return (
        <ChatMessageLoader translations={{ loaderText: 'Searching...' }} />
      );
    }

    return (
      <>
        <Carousel
          items={items}
          itemComponent={itemComponent}
          sendEvent={() => {}}
          showNavigation={false}
          headerComponent={MemoedHeaderComponent}
        />
        {suggestedFilters.length > 0 && (
          <SuggestedFilters
            filters={suggestedFilters}
            onFilterClick={handleFilterClick}
            indexUiState={indexUiState}
          />
        )}
      </>
    );
  }

  function HeaderComponent({
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    nbHits,
    query,
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
    query?: string;
    hitsPerPage?: number;
    setIndexUiState: IndexWidget['setIndexUiState'];
    indexUiState: IndexUiState;
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!query) return;

                const nextUiState = { ...indexUiState, query };

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
