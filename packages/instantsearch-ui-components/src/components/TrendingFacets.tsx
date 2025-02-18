/** @jsx createElement */

import { cx } from '../lib';

import {
  createDefaultEmptyComponent,
  createDefaultHeaderComponent,
} from './recommend-shared';

import type {
  ComponentProps,
  RecommendClassNames,
  RecommendInnerComponentProps,
  RecommendItemComponentProps,
  RecommendStatus,
  RecommendTranslations,
  RecordWithObjectID,
  Renderer,
  SendEventForHits,
  TrendingFacetHit,
} from '../types';

type TrendingFacetLayoutProps<TClassNames extends Record<string, string>> = {
  classNames: TClassNames;
  itemComponent: (
    props: RecommendItemComponentProps<TrendingFacetHit>
  ) => JSX.Element;
  items: TrendingFacetHit[];
  sendEvent: SendEventForHits;
};

export type TrendingFacetsComponentProps<
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = {
  itemComponent: (
    props: RecommendItemComponentProps<TrendingFacetHit> & TComponentProps
  ) => JSX.Element;
  items: TrendingFacetHit[];
  sendEvent: SendEventForHits;
  classNames?: Partial<RecommendClassNames>;
  emptyComponent?: (props: TComponentProps) => JSX.Element;
  headerComponent?: (
    props: RecommendInnerComponentProps<TrendingFacetHit> & TComponentProps
  ) => JSX.Element;
  status: RecommendStatus;
  translations?: Partial<RecommendTranslations>;
  layout?: (
    props: TrendingFacetLayoutProps<Record<string, string>> & TComponentProps
  ) => JSX.Element;
};

export type TrendingFacetsProps<
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & TrendingFacetsComponentProps<TComponentProps>;

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

export function createListComponent({ createElement }: Renderer) {
  return function List(
    userProps: TrendingFacetLayoutProps<Partial<RecommendClassNames>>
  ) {
    const {
      classNames = {},
      itemComponent: ItemComponent,
      items,
      sendEvent,
    } = userProps;

    return (
      <div className={classNames.container}>
        <ol className={classNames.list}>
          {items.map((item) => (
            <li
              key={item.facetName + item.facetValue}
              className={classNames.item}
            >
              <ItemComponent item={item} sendEvent={sendEvent} />
            </li>
          ))}
        </ol>
      </div>
    );
  };
}

export const isTrendingFacetHit = (
  item: RecordWithObjectID<any> | TrendingFacetHit
): item is TrendingFacetHit => !item.objectID && 'facetValue' in item;
