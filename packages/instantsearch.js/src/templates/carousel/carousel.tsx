/** @jsx h */

import { html } from 'htm/preact';
import {
  createCarouselComponent,
  generateCarouselId,
} from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';
import { useRef } from 'preact/hooks';

import type {
  CarouselProps as CarouselUiProps,
  VNode,
} from 'instantsearch-ui-components';

const Carousel = createCarouselComponent({
  createElement: h,
  Fragment,
});

function CarouselWithRefs<TObject extends Record<string, unknown>>(
  props: Omit<
    CarouselUiProps<TObject>,
    'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
  >
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

  return <Carousel {...carouselRefs} {...props} />;
}

type Template = (params: { html: typeof html }) => VNode | VNode[] | null;

type CreateCarouselTemplateProps<TObject extends Record<string, unknown>> = {
  templates?: Partial<{
    previous: Exclude<Template, string>;
    next: Exclude<Template, string>;
  }>;
  cssClasses?: Partial<CarouselUiProps<TObject>['classNames']>;
};

type CarouselTemplateProps<TObject extends Record<string, unknown>> = Pick<
  CarouselUiProps<TObject>,
  'items'
> & {
  templates: {
    item?: CarouselUiProps<TObject>['itemComponent'];
  };
};

export function carousel<TObject extends Record<string, unknown>>({
  cssClasses,
  templates,
}: CreateCarouselTemplateProps<TObject> = {}) {
  return function CarouselTemplate({
    items,
    templates: userTemplates,
  }: CarouselTemplateProps<TObject>) {
    const previousIconComponent = (
      templates?.previous ? () => templates.previous?.({ html }) : undefined
    ) as CarouselUiProps<TObject>['previousIconComponent'];

    const nextIconComponent = (
      templates?.next ? () => templates.next?.({ html }) : undefined
    ) as CarouselUiProps<TObject>['previousIconComponent'];

    return (
      <CarouselWithRefs
        items={items}
        itemComponent={userTemplates.item}
        previousIconComponent={previousIconComponent}
        nextIconComponent={nextIconComponent}
        classNames={cssClasses}
      />
    );
  };
}
