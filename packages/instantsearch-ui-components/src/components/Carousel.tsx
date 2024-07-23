/** @jsx createElement */
import { cx } from '../lib';

import type {
  ComponentProps,
  RecommendItemComponentProps,
  RecordWithObjectID,
  Renderer,
} from '../types';

export type CarouselProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & {
  items: Array<RecordWithObjectID<TObject>>;
  itemComponent: (
    props: RecommendItemComponentProps<RecordWithObjectID<TObject>> &
      TComponentProps
  ) => JSX.Element;
  classNames?: Partial<CarouselClassNames>;
  translations?: Partial<CarouselTranslations>;
};

export type CarouselClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
  /**
   * Class names to apply to both navigation elements
   */
  navigation: string | string[];
  /**
   * Class names to apply to the next navigation element
   */
  navigationNext: string | string[];
  /**
   * Class names to apply to the previous navigation element
   */
  navigationPrevious: string | string[];
};

export type CarouselTranslations = {
  /**
   * The label of the next navigation element
   */
  nextButtonLabel: string;
  /**
   * The title of the next navigation element
   */
  nextButtonTitle: string;
  /**
   * The label of the previous navigation element
   */
  previousButtonLabel: string;
  /**
   * The title of the previous navigation element
   */
  previousButtonTitle: string;
  /**
   * The label of the carousel
   */
  listLabel: string;
};

let lastCarouselId = 0;

function generateCarouselId() {
  return `ais-Carousel-${lastCarouselId++}`;
}

export function createCarouselComponent({ createElement, useRef }: Renderer) {
  // This prevents the SVG buttons references from being hoisted
  // during the build, where `createElement` is not available.
  const buttonPathCommonProps: JSX.IntrinsicElements['path'] = {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
    fill: 'currentColor',
  };

  return function Carousel<TObject extends RecordWithObjectID>(
    userProps: CarouselProps<TObject>
  ) {
    const {
      classNames = {},
      itemComponent: ItemComponent,
      items,
      translations: userTranslations,
      ...props
    } = userProps;

    const listRef = useRef?.<HTMLOListElement>(null);
    const nextButtonRef = useRef?.<HTMLButtonElement>(null);
    const previousButtonRef = useRef?.<HTMLButtonElement>(null);
    const carouselIdRef = useRef?.(generateCarouselId());

    const translations: Required<CarouselTranslations> = {
      listLabel: 'Items',
      nextButtonLabel: 'Next',
      nextButtonTitle: 'Next',
      previousButtonLabel: 'Previous',
      previousButtonTitle: 'Previous',
      ...userTranslations,
    };

    const cssClasses: CarouselClassNames = {
      root: cx('ais-Carousel', classNames.root),
      list: cx('ais-Carousel-list', classNames.list),
      item: cx('ais-Carousel-item', classNames.item),
      navigation: cx('ais-Carousel-navigation', classNames.navigation),
      navigationNext: cx(
        'ais-Carousel-navigation--next',
        classNames.navigationNext
      ),
      navigationPrevious: cx(
        'ais-Carousel-navigation--previous',
        classNames.navigationPrevious
      ),
    };

    function scrollLeft() {
      if (listRef?.current) {
        listRef.current.scrollLeft -= listRef.current.offsetWidth * 0.75;
      }
    }

    function scrollRight() {
      if (listRef?.current) {
        listRef.current.scrollLeft += listRef.current.offsetWidth * 0.75;
      }
    }

    function updateNavigationButtonsProps() {
      if (
        !listRef?.current ||
        !previousButtonRef?.current ||
        !nextButtonRef?.current
      ) {
        return;
      }

      previousButtonRef.current.hidden = listRef.current.scrollLeft <= 0;
      nextButtonRef.current.hidden =
        listRef.current.scrollLeft + listRef.current.clientWidth >=
        listRef.current.scrollWidth;
    }

    if (items.length === 0) {
      return null;
    }

    return (
      <div {...props} className={cx(cssClasses.root)}>
        <button
          ref={previousButtonRef}
          title={translations.previousButtonTitle}
          aria-label={translations.previousButtonLabel}
          hidden
          aria-controls={carouselIdRef?.current}
          className={cx(cssClasses.navigation, cssClasses.navigationPrevious)}
          onClick={(event) => {
            event.preventDefault();
            scrollLeft();
          }}
        >
          <svg width="8" height="16" viewBox="0 0 8 16" fill="none">
            <path
              {...buttonPathCommonProps}
              d="M7.13809 0.744078C7.39844 1.06951 7.39844 1.59715 7.13809 1.92259L2.27616 8L7.13809 14.0774C7.39844 14.4028 7.39844 14.9305 7.13809 15.2559C6.87774 15.5814 6.45563 15.5814 6.19528 15.2559L0.861949 8.58926C0.6016 8.26382 0.6016 7.73618 0.861949 7.41074L6.19528 0.744078C6.45563 0.418641 6.87774 0.418641 7.13809 0.744078Z"
            />
          </svg>
        </button>

        <ol
          className={cx(cssClasses.list)}
          ref={listRef}
          tabIndex={0}
          id={carouselIdRef?.current}
          aria-roledescription="carousel"
          aria-label={translations.listLabel}
          aria-live="polite"
          onScroll={updateNavigationButtonsProps}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              scrollLeft();
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              scrollRight();
            }
          }}
        >
          {items.map((item, index) => (
            <li
              key={item.objectID}
              className={cx(cssClasses.item)}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}`}
            >
              <ItemComponent item={item} />
            </li>
          ))}
        </ol>

        <button
          ref={nextButtonRef}
          title={translations.nextButtonTitle}
          aria-label={translations.nextButtonLabel}
          aria-controls={carouselIdRef?.current}
          className={cx(cssClasses.navigation, cssClasses.navigationNext)}
          onClick={(event) => {
            event.preventDefault();
            scrollRight();
          }}
        >
          <svg width="8" height="16" viewBox="0 0 8 16" fill="none">
            <path
              {...buttonPathCommonProps}
              d="M0.861908 15.2559C0.601559 14.9305 0.601559 14.4028 0.861908 14.0774L5.72384 8L0.861908 1.92259C0.601559 1.59715 0.601559 1.06952 0.861908 0.744079C1.12226 0.418642 1.54437 0.418642 1.80472 0.744079L7.13805 7.41074C7.3984 7.73618 7.3984 8.26382 7.13805 8.58926L1.80472 15.2559C1.54437 15.5814 1.12226 15.5814 0.861908 15.2559Z"
            />
          </svg>
        </button>
      </div>
    );
  };
}
