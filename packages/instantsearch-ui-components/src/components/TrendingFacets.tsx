/** @jsx createElement */

import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type TrendingFacetItem = {
  facetName: string;
  facetValue: string;
  _score: number;
};

export type TrendingFacetsClassNames = {
  root: string;
  emptyRoot: string;
  title: string;
  container: string;
  list: string;
  item: string;
};

export type TrendingFacetsTranslations = {
  title: string;
};

export type TrendingFacetsProps = ComponentProps<'div'> & {
  items: TrendingFacetItem[];
  classNames?: Partial<TrendingFacetsClassNames>;
  itemComponent?: (props: { item: TrendingFacetItem }) => JSX.Element;
  headerComponent?: (props: {
    classNames: Partial<TrendingFacetsClassNames>;
    items: TrendingFacetItem[];
    translations: Required<TrendingFacetsTranslations>;
  }) => JSX.Element;
  emptyComponent?: () => JSX.Element;
  status: 'idle' | 'loading' | 'stalled' | 'error';
  translations?: Partial<TrendingFacetsTranslations>;
};

export function createTrendingFacetsComponent({
  createElement,
  Fragment,
}: Renderer) {
  function DefaultHeader({
    classNames = {},
    items,
    translations,
  }: {
    classNames: Partial<TrendingFacetsClassNames>;
    items: TrendingFacetItem[];
    translations: Required<TrendingFacetsTranslations>;
  }) {
    if (!items || items.length < 1) {
      return null;
    }

    if (!translations.title) {
      return null;
    }

    return <h3 className={classNames.title}>{translations.title}</h3>;
  }

  function DefaultItem({ item }: { item: TrendingFacetItem }) {
    return <Fragment>{item.facetValue}</Fragment>;
  }

  function DefaultEmpty() {
    return <Fragment>No results</Fragment>;
  }

  return function TrendingFacets(userProps: TrendingFacetsProps) {
    const {
      classNames = {},
      emptyComponent: EmptyComponent = DefaultEmpty,
      headerComponent: HeaderComponent = DefaultHeader,
      itemComponent: ItemComponent = DefaultItem,
      items,
      status,
      translations: userTranslations,
      ...props
    } = userProps;

    const translations: Required<TrendingFacetsTranslations> = {
      title: 'Trending',
      ...userTranslations,
    };

    const cssClasses: TrendingFacetsClassNames = {
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

        <div className={cssClasses.container}>
          <ol className={cssClasses.list}>
            {items.map((item, index) => (
              <li
                key={`${item.facetName}:${item.facetValue}:${index}`}
                className={cssClasses.item}
              >
                <ItemComponent item={item} />
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  };
}
