/** @jsx createElement */

import { cx } from '../../lib';

import { createDefaultEmptyComponent } from './DefaultEmpty';
import { createDefaultHeaderComponent } from './DefaultHeader';
import { createDefaultItemComponent } from './DefaultItem';
import { createListComponent } from './List';

import type {
  ComponentProps,
  RecommendClassNames,
  RecommendComponentProps,
  RecommendTranslations,
  Renderer,
} from '../../types';

export type RecommendComponentDescriptor = {
  /**
   * The CSS class-name prefix used to build the `cssClasses` object
   * (e.g. `ais-RelatedProducts`).
   */
  cssClasses: string;
  /**
   * The default translations applied when the caller does not override them.
   */
  translations: Required<RecommendTranslations>;
  /**
   * The component display name, used for debugging and devtools.
   */
  displayName: string;
};

export type RecommendComponentInternalProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

/**
 * Builds a recommend component (RelatedProducts, TrendingItems, …) from a small
 * per-widget descriptor. The shared rendering structure — prop defaults,
 * `cssClasses` assembly, the empty-state branch, and the header + layout tree —
 * lives here, so each public factory only has to provide its class-name prefix
 * and default translations.
 */
export function createRecommendComponent(
  { createElement, Fragment }: Renderer,
  {
    cssClasses: cssClassesPrefix,
    translations: defaultTranslations,
    displayName,
  }: RecommendComponentDescriptor
) {
  function RecommendComponent<TObject>(
    userProps: RecommendComponentInternalProps<TObject>
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
      ...defaultTranslations,
      ...userTranslations,
    };

    const cssClasses: RecommendClassNames = {
      root: cx(cssClassesPrefix, classNames.root),
      emptyRoot: cx(
        cssClassesPrefix,
        classNames.root,
        `${cssClassesPrefix}--empty`,
        classNames.emptyRoot,
        props.className
      ),
      title: cx(`${cssClassesPrefix}-title`, classNames.title),
      container: cx(`${cssClassesPrefix}-container`, classNames.container),
      list: cx(`${cssClassesPrefix}-list`, classNames.list),
      item: cx(`${cssClassesPrefix}-item`, classNames.item),
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
  }

  RecommendComponent.displayName = displayName;

  return RecommendComponent;
}
