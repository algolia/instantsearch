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
  Omit<
    RecommendComponentProps<TrendingFacetHit, TComponentProps>,
    'itemComponent'
  > & {
    itemComponent: RecommendComponentProps<
      TrendingFacetHit,
      TComponentProps
    >['itemComponent'];
  };

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
      // Fallback to a no-op component if no itemComponent is provided
      // This is to ensure that the component can render when the layout
      // the user provided does not need an itemComponent, but still allows
      // us to later create a default itemComponent that has an action.
      itemComponent: ItemComponent = () => null as any,
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
          itemComponent={ItemComponent || (() => null as any)}
          items={items}
          sendEvent={sendEvent}
        />
      </section>
    );
  };
}
