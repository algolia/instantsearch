/** @jsx h */

import { createHitsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { connectHits } from '../../connectors';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  HitsConnectorParams,
  HitsRenderState,
  HitsWidgetDescription,
} from '../../connectors';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  Template,
  Hit,
  WidgetFactory,
  Renderer,
  BaseHit,
  TemplateWithSendEvent,
  Widget,
} from '../../types';
import type { SearchResults } from 'algoliasearch-helper';
import type {
  HitsClassNames as HitsUiComponentClassNames,
  HitsProps as HitsUiComponentProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'hits' });

const Hits = createHitsComponent({ createElement: h, Fragment });

const renderer =
  <THit extends NonNullable<object> = BaseHit>({
    renderState,
    cssClasses,
    containerNode,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: HitsCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<HitsTemplates<THit>>;
    };
    templates: HitsTemplates<THit>;
  }): Renderer<HitsRenderState, Partial<HitsWidgetParams>> =>
  ({ items, results, sendEvent, banner }, isFirstRendering) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps<HitsTemplates<THit>>({
        defaultTemplates,
        templates,
      });
      return;
    }

    const emptyComponent: HitsUiComponentProps<Hit>['emptyComponent'] = ({
      ...rootProps
    }) => (
      <TemplateComponent
        {...renderState.templateProps}
        rootProps={rootProps}
        templateKey="empty"
        data={results}
        rootTagName="fragment"
      />
    );

    // @MAJOR: Move default hit component back to the UI library
    // once flavour specificities are erased
    const itemComponent: HitsUiComponentProps<Hit>['itemComponent'] = ({
      hit,
      ...rootProps
    }) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="item"
        rootTagName="li"
        rootProps={{
          ...rootProps,
        }}
        data={hit}
        sendEvent={sendEvent}
      />
    );

    const bannerComponent: HitsUiComponentProps<Hit>['bannerComponent'] = (
      props
    ) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="banner"
        data={props}
        rootTagName="fragment"
      />
    );

    render(
      <Hits
        hits={items}
        itemComponent={itemComponent}
        sendEvent={sendEvent}
        classNames={cssClasses}
        emptyComponent={emptyComponent}
        banner={banner}
        bannerComponent={templates.banner ? bannerComponent : undefined}
      />,
      containerNode
    );
  };

export type HitsCSSClasses = Partial<HitsUiComponentClassNames>;

export type HitsTemplates<THit extends NonNullable<object> = BaseHit> =
  Partial<{
    /**
     * Template to use when there are no results.
     *
     * @default 'No Results'
     */
    empty: Template<SearchResults<THit>>;

    /**
     * Template to use for each result. This template will receive an object containing a single record.
     *
     * @default ''
     */
    item: TemplateWithSendEvent<Hit<THit>>;

    /**
     * Template to use for the banner.
     */
    banner: Template<{
      banner: Required<HitsRenderState['banner']>;
      className: string;
    }>;
  }>;

export type HitsWidgetParams<THit extends NonNullable<object> = BaseHit> = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: HitsTemplates<THit>;

  /**
   * CSS classes to add.
   */
  cssClasses?: HitsCSSClasses;
};

export type HitsWidget<THit extends NonNullable<object> = BaseHit> =
  WidgetFactory<
    HitsWidgetDescription<THit> & { $$widgetType: 'ais.hits' },
    HitsConnectorParams<THit>,
    HitsWidgetParams<THit>
  >;

export default (function hits<THit extends NonNullable<object> = BaseHit>(
  widgetParams: HitsWidgetParams<THit> & HitsConnectorParams<THit>
) {
  const {
    container,
    escapeHTML,
    transformItems,
    templates = {},
    cssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectHits(specializedRenderer, () =>
    render(null, containerNode)
  );

  const widget = {
    ...makeWidget({
      escapeHTML,
      transformItems,
    }),
    $$widgetType: 'ais.hits',
  };

  // explicitly cast this type to have a small type output.
  return widget as Widget<
    HitsWidgetDescription & {
      $$widgetType: 'ais.hits';
      widgetParams: HitsConnectorParams<THit>;
    }
  >;
} satisfies HitsWidget);
