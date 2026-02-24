import {
  createCarouselComponent,
  generateCarouselId,
} from 'instantsearch-ui-components';
import React, { createElement, Fragment, useRef, useState } from 'react';

import type {
  CarouselProps as CarouselUiProps,
  Pragma,
} from 'instantsearch-ui-components';

const CarouselUiComponent = createCarouselComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type CarouselProps<TObject extends Record<string, unknown>> = Omit<
  CarouselUiProps<TObject>,
  | 'listRef'
  | 'nextButtonRef'
  | 'previousButtonRef'
  | 'carouselIdRef'
  | 'canScrollLeft'
  | 'canScrollRight'
  | 'setCanScrollLeft'
  | 'setCanScrollRight'
>;

export function Carousel<TObject extends Record<string, unknown>>(
  props: CarouselProps<TObject>
) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const carouselRefs: Pick<
    CarouselUiProps<TObject>,
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

  return <CarouselUiComponent {...carouselRefs} {...props} />;
}
