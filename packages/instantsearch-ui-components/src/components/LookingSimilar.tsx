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

export type LookingSimilarProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

export function createLookingSimilarComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function LookingSimilar<TObject>(
    userProps: LookingSimilarProps<TObject>
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
      title: 'Looking similar',
      sliderLabel: 'Looking similar',
      ...userTranslations,
    };

    if (items.length === 0 && status === 'idle') {
      return (
        <section
          {...props}
          className={cx(
            'ais-LookingSimilar',
            classNames.root,
            'ais-LookingSimilar--empty',
            classNames.emptyRoot,
            props.className
          )}
        >
          <FallbackComponent />
        </section>
      );
    }

    return (
      <section {...props} className={cx('ais-LookingSimilar', classNames.root)}>
        <HeaderComponent
          classNames={{
            ...classNames,
            title: cx('ais-LookingSimilar-title', classNames.title),
          }}
          recommendations={items}
          translations={translations}
        />

        <View
          classNames={{
            ...classNames,
            container: cx('ais-LookingSimilar-container', classNames.container),
            list: cx('ais-LookingSimilar-list', classNames.list),
            item: cx('ais-LookingSimilar-item', classNames.item),
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
