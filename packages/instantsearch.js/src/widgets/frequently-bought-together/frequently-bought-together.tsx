/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { Fragment, VNode, createElement, h, render } from 'preact';
import { html } from 'htm/preact';

import {
  HeaderComponentProps,
  RecommendClassNames,
  createFrequentlyBoughtTogetherComponent,
} from '@algolia/recommend-vdom';
import connectFrequentlyBoughtTogether from '../../connectors/frequently-bought-together/connectFrequentlyBoughtTogether';
import { component } from '../../lib/suit';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  FrequentlyBoughtTogetherConnectorParams,
  FrequentlyBoughtTogetherRenderState,
  FrequentlyBoughtTogetherWidgetDescription,
} from '../../connectors/frequently-bought-together/connectFrequentlyBoughtTogether';
import type { Renderer, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'frequentlyBoughtTogether',
});
const suit = component('FrequentlyBoughtTogether');

const UncontrolledFrequentlyBoughtTogether =
  createFrequentlyBoughtTogetherComponent({
    createElement,
    Fragment,
  });

type FrequentlyBoughtTogetherComponentCSSClasses = RecommendClassNames;

export type FrequentlyBoughtTogetherCSSClasses =
  Partial<FrequentlyBoughtTogetherComponentCSSClasses>;

export type FrequentlyBoughtTogetherWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * CSS classes to add.
   */
  cssClasses?: FrequentlyBoughtTogetherCSSClasses;

  /**
   * Templates to use for the widget.
   */
  templates: FrequentlyBoughtTogetherTemplates;
};

export type FrequentlyBoughtTogetherTemplates = {
  header?({ html, sendEvent }: any): VNode;
  item({ item, html, sendEvent }: any): VNode;
};

export type FrequentlyBoughtTogetherWidget = WidgetFactory<
  FrequentlyBoughtTogetherWidgetDescription & {
    $$widgetType: 'ais.frequentlyBoughtTogether';
  },
  FrequentlyBoughtTogetherConnectorParams,
  FrequentlyBoughtTogetherWidgetParams
>;

type RendererProps = {
  containerNode: HTMLElement;
  cssClasses: FrequentlyBoughtTogetherComponentCSSClasses;
  renderState: {};
  templates: FrequentlyBoughtTogetherTemplates;
};

function renderer({
  containerNode,
  cssClasses,
  templates,
}: RendererProps): Renderer<
  FrequentlyBoughtTogetherRenderState,
  Partial<FrequentlyBoughtTogetherWidgetParams>
> {
  return ({ recommendations, sendEvent }) => {
    render(
      <UncontrolledFrequentlyBoughtTogether
        items={recommendations}
        classNames={cssClasses}
        status={'idle'}
        headerComponent={(props) => {
          const header = templates.header || DefaultHeaderComponent;

          return header({ ...props, html, sendEvent });
        }}
        itemComponent={({ item }) => templates.item({ item, html, sendEvent })}
      />,
      containerNode
    );
  };
}

function DefaultHeaderComponent<TObject>(props: HeaderComponentProps<TObject>) {
  return (
    <h3 className={cx('auc-Recommend-title', props.classNames.title)}>
      {props.translations.title}
    </h3>
  );
}

const frequentlyBoughtTogether: FrequentlyBoughtTogetherWidget = (
  widgetParams
) => {
  const {
    container,
    cssClasses: userCssClasses = {},
    objectIDs,
    templates,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses: FrequentlyBoughtTogetherComponentCSSClasses = {
    root: cx(suit(), userCssClasses.root),
    title: cx(suit({ descendantName: 'title' }), userCssClasses.title),
    container: cx(
      suit({ descendantName: 'container' }),
      userCssClasses.container
    ),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectFrequentlyBoughtTogether(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ objectIDs }),
    $$widgetType: 'ais.frequentlyBoughtTogether',
  };
};

export default frequentlyBoughtTogether;
