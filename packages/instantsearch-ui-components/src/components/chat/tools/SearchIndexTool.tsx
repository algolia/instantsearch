/** @jsx createElement */

import { createButtonComponent } from '../../Button';
import { createCarouselComponent, generateCarouselId } from '../../Carousel';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

import type { RecordWithObjectID, Renderer } from '../../../types';
import type {
  CarouselProps,
  HeaderComponentProps as CarouselHeaderComponentProps,
} from '../../Carousel';
import type { ClientSideToolComponentProps } from '../types';
import type { SearchParameters } from 'algoliasearch-helper';

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
  applyFilters: ClientSideToolComponentProps['applyFilters'];
  getSearchPageURL?: (params: SearchParameters) => string;
  onClose: () => void;
};

export type SearchIndexToolProps<THit extends RecordWithObjectID> = {
  useMemo: <TType>(factory: () => TType, inputs: readonly unknown[]) => TType;
  useRef: <TType>(initialValue: TType) => { current: TType };
  useState: <TType>(
    initialState: TType
  ) => [TType, (newState: TType) => unknown];
  getSearchPageURL?: (params: SearchParameters) => string;
  toolProps: ClientSideToolComponentProps;
  itemComponent?: CarouselProps<THit>['itemComponent'];
  headerComponent?: (props: HeaderProps) => JSX.Element;
  headerProps: Pick<HeaderProps, 'showViewAll'>;
};

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
    applyFilters,
    getSearchPageURL,
    onClose,
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
                if (!input || !applyFilters) return;

                const params = applyFilters({
                  query: input.query,
                  facetFilters: input.facet_filters,
                });

                if (
                  getSearchPageURL &&
                  new URL(getSearchPageURL(params)).pathname !==
                    window.location.pathname
                ) {
                  window.location.href = getSearchPageURL(params);
                }

                onClose();
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

export function createSearchIndexToolComponent<
  TObject extends RecordWithObjectID
>({ createElement, Fragment }: Renderer) {
  const DefaultHeader = createHeaderComponent({ createElement, Fragment });
  const Carousel = createCarouselComponent({ createElement, Fragment });

  return function SearchIndexTool(userProps: SearchIndexToolProps<TObject>) {
    const {
      useMemo,
      useRef,
      useState,
      itemComponent: ItemComponent,
      headerComponent: HeaderComponent,
      getSearchPageURL,
      toolProps: { message, applyFilters, onClose },
      headerProps: { showViewAll },
    } = userProps;

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

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const carouselRefs: Pick<
      CarouselProps<TObject>,
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

    const MemoedHeaderComponent = useMemo(() => {
      if (HeaderComponent) {
        return (props: CarouselHeaderComponentProps) => (
          <HeaderComponent
            showViewAll={showViewAll}
            nbHits={output?.nbHits}
            input={input}
            hitsPerPage={items.length}
            applyFilters={applyFilters}
            getSearchPageURL={getSearchPageURL}
            onClose={onClose}
            {...props}
          />
        );
      }

      return (props: CarouselHeaderComponentProps) => (
        <DefaultHeader
          showViewAll={showViewAll}
          nbHits={output?.nbHits}
          input={input}
          hitsPerPage={items.length}
          applyFilters={applyFilters}
          getSearchPageURL={getSearchPageURL}
          onClose={onClose}
          {...props}
        />
      );
    }, [
      showViewAll,
      HeaderComponent,
      output?.nbHits,
      input,
      items.length,
      applyFilters,
      getSearchPageURL,
      onClose,
    ]);

    return (
      <Carousel
        {...carouselRefs}
        items={items}
        itemComponent={ItemComponent}
        headerComponent={MemoedHeaderComponent}
        showNavigation={false}
        sendEvent={() => {}}
      />
    );
  };
}
