import {
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  ArrowRightIconComponent,
  createButtonComponent,
} from 'instantsearch-ui-components';
import { SearchIndexToolType } from 'instantsearch.js/es/lib/chat';
import React, { createElement } from 'react';

import { Carousel } from '../../../components';

import type {
  ClientSideToolComponentProps,
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTools,
} from 'instantsearch-ui-components';
import type { IndexUiState, IndexWidget } from 'instantsearch.js';
import type { ComponentProps } from 'react';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

export function createSearchIndexTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideTools {
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
          query={input?.query}
          hitsPerPage={input?.number_of_results}
          setIndexUiState={setIndexUiState}
          indexUiState={indexUiState}
          getSearchPageURL={getSearchPageURL}
          onClose={onClose}
          {...props}
        />
      );
    }, [
      input?.number_of_results,
      input?.query,
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
              {hitsPerPage ?? 0} of {nbHits} result
              {nbHits > 1 ? 's' : ''}
            </div>
          )}
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
            <ArrowRightIconComponent createElement={createElement as Pragma} />
          </Button>
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
              <ChevronLeftIconComponent
                createElement={createElement as Pragma}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconOnly
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
            >
              <ChevronRightIconComponent
                createElement={createElement as Pragma}
              />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return {
    [SearchIndexToolType]: {
      layoutComponent: SearchLayoutComponent,
    },
  };
}
