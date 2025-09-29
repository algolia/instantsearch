import {
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  ArrowRightIconComponent,
} from 'instantsearch-ui-components';
import React, { createElement } from 'react';

import { Carousel } from '../../../components';

import type {
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  ChatToolMessage,
  UserClientSideTool,
} from 'instantsearch-ui-components';

export const SearchIndexToolType: ChatToolMessage['type'] =
  'tool-algolia_search_index';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

export function createSearchIndexTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>
): UserClientSideTool {
  return {
    type: SearchIndexToolType,
    component: ({ message, indexUiState, setIndexUiState }) => {
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
                      {input?.number_of_results ?? 0} of {output?.nbHits} result
                      {output?.nbHits > 1 ? 's' : ''}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (input?.query) {
                        setIndexUiState({
                          ...indexUiState,
                          query: input.query,
                        });
                      }
                    }}
                    className="ais-ChatToolSearchIndexCarouselHeaderViewAll"
                  >
                    View all
                    <ArrowRightIconComponent
                      createElement={createElement as Pragma}
                    />
                  </button>
                </div>

                {(input?.number_of_results ?? 0) > 2 && (
                  <div className="ais-ChatToolSearchIndexCarouselHeaderScrollButtons">
                    <button
                      onClick={scrollLeft}
                      disabled={!canScrollLeft}
                      className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
                    >
                      <ChevronLeftIconComponent
                        createElement={createElement as Pragma}
                      />
                    </button>
                    <button
                      onClick={scrollRight}
                      disabled={!canScrollRight}
                      className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
                    >
                      <ChevronRightIconComponent
                        createElement={createElement as Pragma}
                      />
                    </button>
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
  };
}
