/** @jsx createElement */

import { cx } from '../lib';

import {
  createDefaultEmptyComponent,
  createDefaultHeaderComponent,
  createDefaultItemComponent,
  createListViewComponent,
} from './recommend-shared';

import type {
  RecommendTranslations,
  Renderer,
  ComponentProps,
  RecommendComponentProps,
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
      view: View = createListViewComponent({ createElement, Fragment }),
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

    if (items.length === 0 && status === 'idle') {
      return (
        <section
          {...props}
          className={cx(
            'ais-FrequentlyBoughtTogether',
            classNames.root,
            'ais-FrequentlyBoughtTogether--empty',
            classNames.emptyRoot,
            props.className
          )}
        >
          <EmptyComponent />
        </section>
      );
    }

    return (
      <section
        {...props}
        className={cx('ais-FrequentlyBoughtTogether', classNames.root)}
      >
        <HeaderComponent
          classNames={{
            ...classNames,
            title: cx('ais-FrequentlyBoughtTogether-title', classNames.title),
          }}
          recommendations={items}
          translations={translations}
        />

        <View
          classNames={{
            ...classNames,
            container: cx(
              'ais-FrequentlyBoughtTogether-container',
              classNames.container
            ),
            list: cx('ais-FrequentlyBoughtTogether-list', classNames.list),
            item: cx('ais-FrequentlyBoughtTogether-item', classNames.item),
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
