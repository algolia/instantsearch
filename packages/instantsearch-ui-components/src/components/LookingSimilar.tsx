/** @jsx createElement */

import { cx } from '../lib';

import {
  createDefaultEmptyComponent,
  createDefaultHeaderComponent,
  createDefaultItemComponent,
  createListViewComponent,
} from './recommend-shared';

import type {
  ComponentProps,
  RecommendClassNames,
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
      title: 'Looking similar',
      sliderLabel: 'Looking similar',
      ...userTranslations,
    };

    const cssClasses: RecommendClassNames = {
      root: cx('ais-LookingSimilar', classNames.root),
      emptyRoot: cx(
        'ais-LookingSimilar',
        classNames.root,
        'ais-LookingSimilar--empty',
        classNames.emptyRoot,
        props.className
      ),
      title: cx('ais-LookingSimilar-title', classNames.title),
      container: cx('ais-LookingSimilar-container', classNames.container),
      list: cx('ais-LookingSimilar-list', classNames.list),
      item: cx('ais-LookingSimilar-item', classNames.item),
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

        <View
          classNames={cssClasses}
          translations={translations}
          itemComponent={ItemComponent}
          items={items}
          sendEvent={sendEvent}
        />
      </section>
    );
  };
}
