/** @jsx createElement */

import { cx } from '../lib';

import {
  createDefaultFallbackComponent,
  createDefaultHeaderComponent,
  createDefaultItemComponent,
  createListViewComponent,
} from './recommend-shared';

import type {
  ComponentProps,
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
      fallbackComponent: FallbackComponent = createDefaultFallbackComponent({
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
      view: View = createListViewComponent({ createElement, Fragment }),
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

    if (items.length === 0 && status === 'idle') {
      return (
        <section
          {...props}
          className={cx(
            'ais-TrendingItems',
            classNames.root,
            'ais-TrendingItems--empty',
            classNames.emptyRoot,
            props.className
          )}
        >
          <FallbackComponent />
        </section>
      );
    }

    return (
      <section {...props} className={cx('ais-TrendingItems', classNames.root)}>
        <HeaderComponent
          classNames={{
            ...classNames,
            title: cx('ais-TrendingItems-title', classNames.title),
          }}
          recommendations={items}
          translations={translations}
        />

        <View
          classNames={{
            ...classNames,
            container: cx('ais-TrendingItems-container', classNames.container),
            list: cx('ais-TrendingItems-list', classNames.list),
            item: cx('ais-TrendingItems-item', classNames.item),
          }}
          translations={translations}
          itemComponent={ItemComponent}
          items={items}
          sendEvent={sendEvent}
        />
      </section>
    );
  };
}
