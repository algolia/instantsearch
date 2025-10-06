import {
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  ArrowRightIconComponent,
  createButtonComponent,
} from 'instantsearch-ui-components';
import React, { createElement } from 'react';

import { Carousel } from '../../../components';

import type {
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTools,
} from 'instantsearch-ui-components';
import type { IndexUiState } from 'instantsearch.js';

export const SearchIndexToolType: string = 'algolia_search_index';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

export function createSearchIndexTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideTools {
  const Button = createButtonComponent({
    createElement: createElement as Pragma,
  });

  return {
    [SearchIndexToolType]: {
      layoutComponent: ({ message, indexUiState, setIndexUiState }) => {
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

        // Safe: this is called within ChatMessage component's render cycle
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const HeaderComponent = React.useMemo(
          () =>
            ({
              canScrollLeft,
              canScrollRight,
              scrollLeft,
              scrollRight,
            }: {
              canScrollLeft: boolean;
              canScrollRight: boolean;
              scrollLeft: () => void;
              scrollRight: () => void;
            }) => {
              return (
                <div className="ais-ChatToolSearchIndexCarouselHeader">
                  <div className="ais-ChatToolSearchIndexCarouselHeaderResults">
                    {output?.nbHits && (
                      <div className="ais-ChatToolSearchIndexCarouselHeaderCount">
                        {input?.number_of_results ?? 0} of {output?.nbHits}{' '}
                        result
                        {output?.nbHits > 1 ? 's' : ''}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!input?.query) {
                          return;
                        }

                        if (!getSearchPageURL) {
                          setIndexUiState({
                            ...indexUiState,
                            query: input.query,
                          });
                          return;
                        }

                        const url = getSearchPageURL({
                          query: input.query,
                        });

                        if (
                          new URL(url).pathname === window.location.pathname
                        ) {
                          // same page, just update the state
                          setIndexUiState({
                            ...indexUiState,
                            query: input.query,
                          });
                          return;
                        }

                        window.location.href = url;
                      }}
                      className="ais-ChatToolSearchIndexCarouselHeaderViewAll"
                    >
                      View all
                      <ArrowRightIconComponent
                        createElement={createElement as Pragma}
                      />
                    </Button>
                  </div>

                  {(input?.number_of_results ?? 0) > 2 && (
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
            },
          [
            input?.number_of_results,
            input?.query,
            output?.nbHits,
            setIndexUiState,
            indexUiState,
          ]
        );

        return (
          <Carousel
            items={items}
            itemComponent={itemComponent}
            sendEvent={() => {}}
            showNavigation={false}
            headerComponent={
              (input?.number_of_results ?? 0) > 1 ? HeaderComponent : undefined
            }
          />
        );
      },
    },
  };
}
