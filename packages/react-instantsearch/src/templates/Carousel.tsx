import {
  createCarouselComponent,
  generateCarouselId,
} from 'instantsearch-ui-components';
import React, { createElement, Fragment, useRef } from 'react';

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
  'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
>;

export function Carousel<TObject extends Record<string, unknown>>(
  props: CarouselProps<TObject>
) {
  const carouselRefs: Pick<
    CarouselUiProps<TObject>,
    'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
  > = {
    listRef: useRef(null),
    nextButtonRef: useRef(null),
    previousButtonRef: useRef(null),
    carouselIdRef: useRef(generateCarouselId()),
  };

  return <CarouselUiComponent {...carouselRefs} {...props} />;
}
