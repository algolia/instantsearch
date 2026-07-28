/** @jsx h */

import { html } from 'htm/preact';
import {
  createCarouselComponent,
  cx,
  generateCarouselId,
} from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import type {
  CarouselProps as CarouselUiProps,
  HeaderComponentProps,
  VNode,
} from 'instantsearch-ui-components';

const Carousel = createCarouselComponent({
  createElement: h,
  Fragment,
  useEffect,
  useRef,
});

function CarouselWithRefs<TObject extends Record<string, unknown>>(
  props: Omit<
    CarouselUiProps<TObject>,
    | 'listRef'
    | 'nextButtonRef'
    | 'previousButtonRef'
    | 'carouselIdRef'
    | 'canScrollLeft'
    | 'canScrollRight'
    | 'setCanScrollLeft'
    | 'setCanScrollRight'
  >
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

  return <Carousel {...carouselRefs} {...props} />;
}

type Template<TData = Record<string, unknown>> = (
  params: { html: typeof html } & TData
) => VNode | VNode[] | null;

type CreateCarouselTemplateProps<TObject extends Record<string, unknown>> = {
  templates?: Partial<{
    previous: Exclude<Template, string>;
    next: Exclude<Template, string>;
    header: Exclude<Template<HeaderComponentProps>, string>;
  }>;
  cssClasses?: Partial<CarouselUiProps<TObject>['classNames']>;
  showNavigation?: boolean;
};

type CarouselTemplateProps<TObject extends Record<string, unknown>> = Pick<
  CarouselUiProps<TObject>,
  'items'
> & {
  templates: {
    item?: CarouselUiProps<TObject>['itemComponent'];
  };
  cssClasses?: Partial<CarouselUiProps<TObject>['classNames']>;
} & {
  sendEvent?: CarouselUiProps<TObject>['sendEvent'];
};

export function carousel<TObject extends Record<string, unknown>>({
  cssClasses,
  templates = {},
  showNavigation = true,
}: CreateCarouselTemplateProps<TObject> = {}) {
  const { previous, next, header } = templates;
  const HeaderComponent = (
    header
      ? (props: HeaderComponentProps) => header({ html, ...props })
      : undefined
  ) as CarouselUiProps<TObject>['headerComponent'];
  const PreviousIconComponent = (
    previous ? () => previous({ html }) : undefined
  ) as CarouselUiProps<TObject>['previousIconComponent'];
  const NextIconComponent = (
    next ? () => next({ html }) : undefined
  ) as CarouselUiProps<TObject>['nextIconComponent'];

  return function CarouselTemplate({
    items,
    templates: widgetTemplates,
    cssClasses: widgetCssClasses = {},
    sendEvent = () => {},
  }: CarouselTemplateProps<TObject>) {
    return (
      <CarouselWithRefs
        items={items}
        sendEvent={sendEvent}
        itemComponent={widgetTemplates.item}
        headerComponent={HeaderComponent}
        previousIconComponent={PreviousIconComponent}
        nextIconComponent={NextIconComponent}
        classNames={{
          ...cssClasses,
          ...{
            list: cx(cssClasses?.list, widgetCssClasses?.list),
            item: cx(cssClasses?.item, widgetCssClasses?.item),
          },
        }}
        showNavigation={showNavigation}
      />
    );
  };
}
