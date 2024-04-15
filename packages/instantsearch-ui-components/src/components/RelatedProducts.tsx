/** @jsx createElement */

import { cx } from '../lib';

import { createDefaultHeaderComponent } from './recommend-shared/DefaultHeader';
import { createListViewComponent } from './recommend-shared/ListView';

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
      fallbackComponent: FallbackComponent = () => null,
      headerComponent: HeaderComponent = createDefaultHeaderComponent({
        createElement,
        Fragment,
      }),
      itemComponent: ItemComponent,
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
      return <FallbackComponent />;
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
