/** @jsx createElement */
import { createButtonComponent } from '../../Button';
import { createCarouselComponent, generateCarouselId } from '../../Carousel';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

import type {
  ComponentProps,
  RecordWithObjectID,
  Renderer,
} from '../../../types';
import type { CarouselProps } from '../../Carousel';
import type { ClientSideToolComponentProps } from '../types';

type SearchToolInput = {
  query: string;
  number_of_results?: number;
  facet_filters?: string[][];
};

type HeaderProps = {
  showViewAll: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
  nbHits?: number;
  input?: SearchToolInput;
  hitsPerPage?: number;
  setIndexUiState: (v: object) => void;
  indexUiState: object;
  onClose: () => void;
  getSearchPageURL?: (nextUiState: object) => string;
};

export type SearchIndexToolProps<THit extends RecordWithObjectID> = {
  useMemo: <TType>(factory: () => TType, inputs: readonly unknown[]) => TType;
  useRef: <TType>(initialValue: TType) => { current: TType };
  useState: <TType>(
    initialState: TType
  ) => [TType, (newState: TType) => unknown];
  getSearchPageURL?: (nextUiState: object) => string;
  toolProps: ClientSideToolComponentProps;
  itemComponent?: CarouselProps<THit>['itemComponent'];
  headerComponent?: (props: HeaderProps) => JSX.Element;
  headerProps: Omit<
    // @ts-expect-error
    ComponentProps<ReturnType<typeof createHeaderComponent>>,
    | 'nbHits'
    | 'query'
    | 'hitsPerPage'
    | 'setIndexUiState'
    | 'indexUiState'
    | 'getSearchPageURL'
    | 'onClose'
  >;
};

function generateIndexUiState(input: SearchToolInput) {
  const indexUiState: {
    query?: string;
    refinementList?: { [key: string]: string[] };
  } = {};

  if (input.query) {
    indexUiState.query = input.query;
  }

  if (input.facet_filters) {
    indexUiState.refinementList = {};

    input.facet_filters.forEach((facetFilter) => {
      facetFilter.forEach((filter) => {
        const [facet, value] = filter.split(':');
        if (!indexUiState.refinementList![facet]) {
          indexUiState.refinementList![facet] = [];
        }
        indexUiState.refinementList![facet].push(value);
      });
    });
  }

  return indexUiState;
}

function createHeaderComponent({ createElement }: Renderer) {
  const Button = createButtonComponent({ createElement });

  return function HeaderComponent({
    showViewAll,
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
    getSearchPageURL,
  }: HeaderProps) {
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
                  ...generateIndexUiState(input),
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
              <ArrowRightIcon createElement={createElement} />
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
              <ChevronLeftIcon createElement={createElement} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconOnly
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="ais-ChatToolSearchIndexCarouselHeaderScrollButton"
            >
              <ChevronRightIcon createElement={createElement} />
            </Button>
          </div>
        )}
      </div>
    );
  };
}

export function createSearchIndexTool<THit extends RecordWithObjectID>({
  createElement,
  Fragment,
}: Renderer) {
  const Header = createHeaderComponent({ createElement, Fragment });
  const Carousel = createCarouselComponent({ createElement, Fragment });

  return function SearchIndexTool({
    useMemo,
    useRef,
    useState,
    getSearchPageURL,
    itemComponent: ItemComponent,
    headerComponent: HeaderComponent,
    toolProps: { message, indexUiState, setIndexUiState, onClose },
    headerProps,
  }: SearchIndexToolProps<THit>) {
    const input = message?.input as SearchToolInput | undefined;

    const output = message?.output as
      | {
          hits?: Array<RecordWithObjectID<THit>>;
          nbHits?: number;
        }
      | undefined;

    const items = output?.hits || [];

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const carouselRefs: Pick<
      CarouselProps<THit>,
      | 'listRef'
      | 'nextButtonRef'
      | 'previousButtonRef'
      | 'carouselIdRef'
      | 'canScrollLeft'
      | 'canScrollRight'
      | 'setCanScrollLeft'
      | 'setCanScrollRight'
    > = {
      listRef: useRef(null),
      nextButtonRef: useRef(null),
      previousButtonRef: useRef(null),
      carouselIdRef: useRef(generateCarouselId()),
      canScrollLeft,
      canScrollRight,
      setCanScrollLeft,
      setCanScrollRight,
    };

    const MemoedHeader = useMemo(() => {
      if (HeaderComponent) {
        return HeaderComponent;
      }

      return () => (
        // @ts-expect-error
        <Header
          nbHits={output?.nbHits}
          input={input}
          hitsPerPage={items.length}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          setIndexUiState={setIndexUiState}
          indexUiState={indexUiState}
          getSearchPageURL={getSearchPageURL}
          onClose={onClose}
          {...headerProps}
        />
      );
    }, [
      HeaderComponent,
      output?.nbHits,
      input,
      items.length,
      canScrollLeft,
      canScrollRight,
      setIndexUiState,
      indexUiState,
      getSearchPageURL,
      onClose,
      headerProps,
    ]);

    return (
      <Carousel
        {...carouselRefs}
        items={items}
        itemComponent={ItemComponent}
        // @ts-expect-error
        headerComponent={MemoedHeader}
        sendEvent={() => {}}
      />
    );
  };
}
