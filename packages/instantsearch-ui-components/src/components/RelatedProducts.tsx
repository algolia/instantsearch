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
      title: 'Related products',
      sliderLabel: 'Related products',
      ...userTranslations,
    };

    if (items.length === 0 && status === 'idle') {
      return (
        <section
          {...props}
          className={cx(
            'ais-RelatedProducts',
            classNames.root,
            'ais-RelatedProducts--empty',
            classNames.emptyRoot,
            props.className
          )}
        >
          <FallbackComponent />
        </section>
      );
    }

    return (
      <section
        {...props}
        className={cx('ais-RelatedProducts', classNames.root)}
      >
        <HeaderComponent
          classNames={{
            ...classNames,
            title: cx('ais-RelatedProducts-title', classNames.title),
          }}
          recommendations={items}
          translations={translations}
        />

        <View
          classNames={{
            ...classNames,
            container: cx(
              'ais-RelatedProducts-container',
              classNames.container
            ),
            list: cx('ais-RelatedProducts-list', classNames.list),
            item: cx('ais-RelatedProducts-item', classNames.item),
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
