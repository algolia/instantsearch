/** @jsx createElement */

import { cx } from '../lib';

import {
  createDefaultEmptyComponent,
  createDefaultHeaderComponent,
  createDefaultItemComponent,
  createListComponent,
} from './recommend-shared';

import type {
  ComponentProps,
  RecommendClassNames,
  RecommendComponentProps,
  RecommendTranslations,
  Renderer,
} from '../types';

export type RelatedProductsProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

export function createRelatedProductsComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function RelatedProducts<TObject>(
    userProps: RelatedProductsProps<TObject>
  ) {
    const {
      classNames = {},
      emptyComponent: EmptyComponent = createDefaultEmptyComponent({
        createElement,
        Fragment,
      }),
      headerComponent: HeaderComponent = createDefaultHeaderComponent({
        createElement,
        Fragment,
      }),
      itemComponent: ItemComponent = createDefaultItemComponent({
        createElement,
        Fragment,
      }),
      layout: Layout = createListComponent({ createElement, Fragment }),
      items,
      status,
      translations: userTranslations,
      sendEvent,
      ...props
    } = userProps;

    const translations: Required<RecommendTranslations> = {
      title: 'Related products',
      sliderLabel: 'Related products',
      ...userTranslations,
    };

    const cssClasses: RecommendClassNames = {
      root: cx('ais-RelatedProducts', classNames.root),
      emptyRoot: cx(
        'ais-RelatedProducts',
        classNames.root,
        'ais-RelatedProducts--empty',
        classNames.emptyRoot,
        props.className
      ),
      title: cx('ais-RelatedProducts-title', classNames.title),
      container: cx('ais-RelatedProducts-container', classNames.container),
      list: cx('ais-RelatedProducts-list', classNames.list),
      item: cx('ais-RelatedProducts-item', classNames.item),
    };

    if (items.length === 0 && status === 'idle') {
      return (
        <section {...props} className={cssClasses.emptyRoot}>
          <EmptyComponent />
        </section>
      );
    }

    return (
      <section {...props} className={cssClasses.root}>
        <HeaderComponent
          classNames={cssClasses}
          items={items}
          translations={translations}
        />

        <Layout
          classNames={cssClasses}
          translations={translations}
          itemComponent={ItemComponent}
          items={items}
          sendEvent={sendEvent}
        />
      </section>
    );
  };
}
