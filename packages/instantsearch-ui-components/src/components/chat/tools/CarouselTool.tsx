/** @jsx createElement */

import { getFacetFiltersFromToolInput } from '../../../lib/utils/chat';
import { addAbsolutePosition, addQueryID } from '../../../lib/utils/hits';
import { createButtonComponent } from '../../Button';
import { createCarouselComponent, generateCarouselId } from '../../Carousel';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

import type { Hooks, RecordWithObjectID, Renderer } from '../../../types';
import type {
  CarouselProps,
  HeaderComponentProps as CarouselHeaderComponentProps,
} from '../../Carousel';
import type {
  ClientSideToolComponentProps,
  SearchToolInput,
} from '../types';
import type { SearchParameters } from 'algoliasearch-helper';

type HeaderProps = {
  showViewAll: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
  nbHits?: number;
  input?: SearchToolInput;
  nbItems: number;
  applyFilters: ClientSideToolComponentProps['applyFilters'];
  getSearchPageURL?: (params: SearchParameters) => string;
  onClose: () => void;
};

export type CarouselToolProps<THit extends RecordWithObjectID> = {
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
    nbItems,
    applyFilters,
    getSearchPageURL,
    onClose,
  }: HeaderProps) {
    if (nbItems < 1) {
      return null;
    }

    return (
      <div className="ais-ChatToolSearchIndexCarouselHeader">
        <div className="ais-ChatToolSearchIndexCarouselHeaderResults">
          {nbHits && (
            <div className="ais-ChatToolSearchIndexCarouselHeaderCount">
              {nbItems} of {nbHits.toLocaleString()} result
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
                  facetFilters: getFacetFiltersFromToolInput(input),
                });

                if (getSearchPageURL) {
                  const searchPageURL = getSearchPageURL(params);
                  const resolvedURL = new URL(
                    searchPageURL,
                    window.location.href
                  );

                  if (resolvedURL.pathname !== window.location.pathname) {
                    window.location.href = searchPageURL;
                  }
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

        {nbItems > 2 && (
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

export function createCarouselToolComponent<
  TObject extends RecordWithObjectID
>({
  createElement,
  Fragment,
  useMemo,
  useRef,
  useState,
}: Renderer & Pick<Hooks, 'useMemo' | 'useRef' | 'useState'>) {
  const DefaultHeader = createHeaderComponent({ createElement, Fragment });
  const Carousel = createCarouselComponent({ createElement, Fragment });

  return function CarouselTool(userProps: CarouselToolProps<TObject>) {
    const {
      itemComponent: ItemComponent,
      headerComponent: HeaderComponent,
      getSearchPageURL,
      toolProps: { message, applyFilters, onClose, sendEvent },
      headerProps: { showViewAll },
    } = userProps;

    const input = message?.input as SearchToolInput | undefined;

    const output = message?.output as
      | {
          hits?: Array<RecordWithObjectID<TObject>>;
          nbHits?: number;
          queryID?: string;
        }
      | undefined;

    const hits = output?.hits || [];
    const items = addQueryID(
      addAbsolutePosition(hits, 0, hits.length),
      output?.queryID
    );
    const nbItems = items.length;

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const carouselIdRef = useRef('');
    if (!carouselIdRef.current) {
      carouselIdRef.current = generateCarouselId();
    }

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
      carouselIdRef,
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
            nbItems={nbItems}
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
          nbItems={nbItems}
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
      nbItems,
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
        sendEvent={sendEvent}
      />
    );
  };
}
