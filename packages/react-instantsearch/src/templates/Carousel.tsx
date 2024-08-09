import {
  createCarouselComponent,
  generateCarouselId,
} from 'instantsearch-ui-components';
import React, { createElement, Fragment, useRef } from 'react';

import type { CarouselProps, Pragma } from 'instantsearch-ui-components';

const CarouselUiComponent = createCarouselComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type CarouseulProps<TObject extends Record<string, unknown>> = Omit<
  CarouselProps<TObject>,
  'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
>;

export function Carousel<TObject extends Record<string, unknown>>(
  props: CarouseulProps<TObject>
) {
  const carouselRefs: Pick<
    CarouselProps<TObject>,
    'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
  > = {
    listRef: useRef(null),
    nextButtonRef: useRef(null),
    previousButtonRef: useRef(null),
    carouselIdRef: useRef(generateCarouselId()),
  };

  return <CarouselUiComponent {...carouselRefs} {...props} />;
}
