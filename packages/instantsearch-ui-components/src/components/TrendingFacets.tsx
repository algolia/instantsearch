/** @jsx createElement */

import { cx } from '../lib';

import {
  createDefaultEmptyComponent,
  createDefaultHeaderComponent,
  createListComponent,
} from './recommend-shared';

import type {
  ComponentProps,
  RecommendClassNames,
  RecommendComponentProps,
  RecommendTranslations,
  Renderer,
  TrendingFacetHit,
} from '../types';

export type TrendingFacetsProps<
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> &
  RecommendComponentProps<TrendingFacetHit, TComponentProps>;

export function createTrendingFacetsComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function TrendingFacets(userProps: TrendingFacetsProps) {
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
      itemComponent: ItemComponent,
      layout: Layout = createListComponent({ createElement, Fragment }),
      items,
      status,
      translations: userTranslations,
      sendEvent,
      ...props
    } = userProps;

    const translations: Required<RecommendTranslations> = {
      title: 'Trending facets',
      sliderLabel: 'Trending facets',
      ...userTranslations,
    };

    const cssClasses: RecommendClassNames = {
      root: cx('ais-TrendingFacets', classNames.root),
      emptyRoot: cx(
        'ais-TrendingFacets',
        classNames.root,
        'ais-TrendingFacets--empty',
        classNames.emptyRoot,
        props.className
      ),
      title: cx('ais-TrendingFacets-title', classNames.title),
      container: cx('ais-TrendingFacets-container', classNames.container),
      list: cx('ais-TrendingFacets-list', classNames.list),
      item: cx('ais-TrendingFacets-item', classNames.item),
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
