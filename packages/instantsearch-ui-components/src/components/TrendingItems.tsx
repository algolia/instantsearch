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

export type TrendingItemsProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

export function createTrendingItemsComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function TrendingItems<TObject>(
    userProps: TrendingItemsProps<TObject>
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
      title: 'Trending items',
      sliderLabel: 'Trending items',
      ...userTranslations,
    };

    const cssClasses: RecommendClassNames = {
      root: cx('ais-TrendingItems', classNames.root),
      emptyRoot: cx(
        'ais-TrendingItems',
        classNames.root,
        'ais-TrendingItems--empty',
        classNames.emptyRoot,
        props.className
      ),
      title: cx('ais-TrendingItems-title', classNames.title),
      container: cx('ais-TrendingItems-container', classNames.container),
      list: cx('ais-TrendingItems-list', classNames.list),
      item: cx('ais-TrendingItems-item', classNames.item),
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
          itemComponent={ItemComponent}
          items={items}
          sendEvent={sendEvent}
        />
      </section>
    );
  };
}
