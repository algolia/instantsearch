/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';
import { useRef } from 'preact/hooks';

import { createCarouselComponent, generateCarouselId } from '../Carousel';

import type { Pragma, RecordWithObjectID } from '../../types';
import type { CarouselProps } from '../Carousel';

const Carousel = createCarouselComponent({
  createElement: createElement as Pragma,
  Fragment,
});

function CarouselWithRefs(
  props: Omit<
    CarouselProps<RecordWithObjectID>,
    'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
  >
) {
  const carouselRefs: Pick<
    CarouselProps<RecordWithObjectID>,
    'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
  > = {
    listRef: useRef(null),
    nextButtonRef: useRef(null),
    previousButtonRef: useRef(null),
    carouselIdRef: useRef(generateCarouselId()),
  };

  return <Carousel {...carouselRefs} {...props} />;
}

const ItemComponent: CarouselProps<RecordWithObjectID>['itemComponent'] = ({
  item,
}) => (<div>{item.objectID}</div>) as JSX.Element;

describe('Carousel', () => {
  test('renders items', () => {
    const { container } = render(
      <CarouselWithRefs
        items={[
          {
            objectID: '1',
            __position: 1,
          },
          {
            objectID: '2',
            __position: 2,
          },
        ]}
        itemComponent={ItemComponent}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Carousel"
        >
          <button
            aria-controls="ais-Carousel-0"
            aria-label="Previous"
            class="ais-Carousel-navigation ais-Carousel-navigation--previous"
            hidden=""
            title="Previous"
          >
            <svg
              fill="none"
              height="16"
              viewBox="0 0 8 16"
              width="8"
            >
              <path
                clipRule="evenodd"
                d="M7.13809 0.744078C7.39844 1.06951 7.39844 1.59715 7.13809 1.92259L2.27616 8L7.13809 14.0774C7.39844 14.4028 7.39844 14.9305 7.13809 15.2559C6.87774 15.5814 6.45563 15.5814 6.19528 15.2559L0.861949 8.58926C0.6016 8.26382 0.6016 7.73618 0.861949 7.41074L6.19528 0.744078C6.45563 0.418641 6.87774 0.418641 7.13809 0.744078Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </button>
          <ol
            aria-label="Items"
            aria-live="polite"
            aria-roledescription="carousel"
            class="ais-Carousel-list"
            id="ais-Carousel-0"
            tabindex="0"
          >
            <li
              aria-label="1 of 2"
              aria-roledescription="slide"
              class="ais-Carousel-item"
            >
              <div>
                1
              </div>
            </li>
            <li
              aria-label="2 of 2"
              aria-roledescription="slide"
              class="ais-Carousel-item"
            >
              <div>
                2
              </div>
            </li>
          </ol>
          <button
            aria-controls="ais-Carousel-0"
            aria-label="Next"
            class="ais-Carousel-navigation ais-Carousel-navigation--next"
            title="Next"
          >
            <svg
              fill="none"
              height="16"
              viewBox="0 0 8 16"
              width="8"
            >
              <path
                clipRule="evenodd"
                d="M0.861908 15.2559C0.601559 14.9305 0.601559 14.4028 0.861908 14.0774L5.72384 8L0.861908 1.92259C0.601559 1.59715 0.601559 1.06952 0.861908 0.744079C1.12226 0.418642 1.54437 0.418642 1.80472 0.744079L7.13805 7.41074C7.3984 7.73618 7.3984 8.26382 7.13805 8.58926L1.80472 15.2559C1.54437 15.5814 1.12226 15.5814 0.861908 15.2559Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    `);
  });

  test('accepts custom translations', () => {
    const { container } = render(
      <CarouselWithRefs
        items={[{ objectID: '1', __position: 1 }]}
        itemComponent={ItemComponent}
        translations={{
          listLabel: 'Liste',
          nextButtonLabel: 'Suivant',
          nextButtonTitle: 'Produit suivant',
          previousButtonLabel: 'Précédent',
          previousButtonTitle: 'Produit précédent',
        }}
      />
    );

    expect(container.querySelector('.ais-Carousel-list')).toHaveAttribute(
      'aria-label',
      'Liste'
    );
    expect(
      container.querySelector('.ais-Carousel-navigation--previous')
    ).toHaveAttribute('aria-label', 'Précédent');
    expect(
      container.querySelector('.ais-Carousel-navigation--previous')
    ).toHaveAccessibleDescription('Produit précédent');
    expect(
      container.querySelector('.ais-Carousel-navigation--next')
    ).toHaveAttribute('aria-label', 'Suivant');
    expect(
      container.querySelector('.ais-Carousel-navigation--next')
    ).toHaveAccessibleDescription('Produit suivant');
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <CarouselWithRefs
        items={[{ objectID: '1', __position: 1 }]}
        itemComponent={ItemComponent}
        hidden={true}
      />
    );

    expect(container.querySelector<HTMLElement>('.ais-Carousel')!.hidden).toBe(
      true
    );
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <CarouselWithRefs
        items={[{ objectID: '1', __position: 1 }]}
        itemComponent={ItemComponent}
        classNames={{
          root: 'ROOT',
          list: 'LIST',
          item: 'ITEM',
          navigation: 'NAVIGATION',
          navigationNext: 'NAVIGATION_NEXT',
          navigationPrevious: 'NAVIGATION_PREVIOUS',
        }}
      />
    );

    expect(container.querySelector('.ais-Carousel')).toHaveClass('ROOT');
    expect(container.querySelector('.ais-Carousel-list')).toHaveClass('LIST');
    expect(container.querySelector('.ais-Carousel-item')).toHaveClass('ITEM');
    expect(
      container.querySelector('.ais-Carousel-navigation--previous')
    ).toHaveClass('NAVIGATION', 'NAVIGATION_PREVIOUS');
    expect(
      container.querySelector('.ais-Carousel-navigation--next')
    ).toHaveClass('NAVIGATION', 'NAVIGATION_NEXT');
  });
});
