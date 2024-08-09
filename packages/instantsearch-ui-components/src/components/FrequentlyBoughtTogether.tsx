/** @jsx createElement */

import { cx } from '../lib';

import {
  createDefaultEmptyComponent,
  createDefaultHeaderComponent,
  createDefaultItemComponent,
  createListComponent,
} from './recommend-shared';

import type {
  RecommendTranslations,
  Renderer,
  ComponentProps,
  RecommendComponentProps,
  RecommendClassNames,
} from '../types';

export type FrequentlyBoughtTogetherProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

export function createFrequentlyBoughtTogetherComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function FrequentlyBoughtTogether<TObject>(
    userProps: FrequentlyBoughtTogetherProps<TObject>
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
      title: 'Frequently bought together',
      sliderLabel: 'Frequently bought together products',
      ...userTranslations,
    };

    const cssClasses: RecommendClassNames = {
      root: cx('ais-FrequentlyBoughtTogether', classNames.root),
      emptyRoot: cx(
        'ais-FrequentlyBoughtTogether',
        classNames.root,
        'ais-FrequentlyBoughtTogether--empty',
        classNames.emptyRoot,
        props.className
      ),
      title: cx('ais-FrequentlyBoughtTogether-title', classNames.title),
      container: cx(
        'ais-FrequentlyBoughtTogether-container',
        classNames.container
      ),
      list: cx('ais-FrequentlyBoughtTogether-list', classNames.list),
      item: cx('ais-FrequentlyBoughtTogether-item', classNames.item),
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
