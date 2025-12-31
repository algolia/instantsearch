/** @jsx h */

import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
} from 'instantsearch-ui-components';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';
import { generateIndexUiState } from '../../lib/utils/getStateFromSearchToolInput';
import { carousel } from '../../templates';

import type { IndexUiState, IndexWidget, SearchToolInput } from '../../types';
import type { ChatTemplates, UserClientSideToolWithTemplate } from './chat';
import type {
  ClientSideToolComponentProps,
  ComponentProps,
  RecordWithObjectID,
} from 'instantsearch-ui-components';

export function createCarouselTool<
  THit extends RecordWithObjectID = RecordWithObjectID
>(
  showViewAll: boolean,
  templates: ChatTemplates<THit>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideToolWithTemplate {
  const Button = createButtonComponent({
    createElement: h,
  });

  function SearchLayoutComponent({
    message,
    indexUiState,
    setIndexUiState,
    onClose,
  }: ClientSideToolComponentProps) {
    const input = message?.input as SearchToolInput | undefined;

    const output = message?.output as
      | {
          hits?: Array<RecordWithObjectID<THit>>;
          nbHits?: number;
        }
      | undefined;

    const items = output?.hits || [];

    const MemoedHeaderComponent = useMemo(() => {
      return (
        props: Omit<
          // @ts-expect-error
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
        // @ts-expect-error
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
      indexUiState,
      onClose,
    ]);

    return carousel({
      showNavigation: false,
      templates: {
        header: MemoedHeaderComponent,
      },
    })({
      items,
      templates: {
        item: ({ item }) => (
          <TemplateComponent
            templates={templates}
            templateKey="item"
            data={item}
            rootTagName="fragment"
          />
        ),
      },
      sendEvent: () => {},
    });
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
    onClose,
    // eslint-disable-next-line no-shadow
    getSearchPageURL,
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
    onClose: () => void;
    getSearchPageURL?: (nextUiState: IndexUiState) => string;
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
                if (!input?.query) return;

                const nextUiState = {
                  ...indexUiState,
                  ...generateIndexUiState(input, indexUiState),
                };

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
              <ArrowRightIcon createElement={h} />
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
              <ChevronLeftIcon createElement={h} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconOnly
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
            >
              <ChevronRightIcon createElement={h} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return {
    templates: { layout: SearchLayoutComponent },
  };
}
