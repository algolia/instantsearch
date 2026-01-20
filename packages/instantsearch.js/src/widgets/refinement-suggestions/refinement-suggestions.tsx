/** @jsx h */

import { createRefinementSuggestionsComponent } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectRefinementSuggestions from '../../connectors/refinement-suggestions/connectRefinementSuggestions';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  RefinementSuggestionsRenderState,
  RefinementSuggestionsConnectorParams,
  RefinementSuggestionsWidgetDescription,
} from '../../connectors/refinement-suggestions/connectRefinementSuggestions';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Renderer, Template } from '../../types';
import type {
  RefinementSuggestionsClassNames,
  RefinementSuggestionsEmptyComponentProps,
  RefinementSuggestionsHeaderComponentProps,
  RefinementSuggestionsItemComponentProps,
  RefinementSuggestionsProps as RefinementSuggestionsUiProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'refinement-suggestions',
});

const RefinementSuggestions = createRefinementSuggestionsComponent({
  createElement: h,
  Fragment: 'fragment',
});

type UiProps = Pick<
  Parameters<typeof RefinementSuggestions>[0],
  | 'suggestions'
  | 'isLoading'
  | 'onRefine'
  | 'skeletonCount'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
>;

export type RefinementSuggestionsCSSClasses =
  Partial<RefinementSuggestionsClassNames>;

export type RefinementSuggestionsTemplates = Partial<{
  /**
   * Template to use for the header. Set to `false` to disable the header.
   */
  header: Template<RefinementSuggestionsHeaderComponentProps> | false;
  /**
   * Template to use for each suggestion item.
   */
  item: Template<RefinementSuggestionsItemComponentProps>;
  /**
   * Template to use when there are no suggestions.
   */
  empty: Template<RefinementSuggestionsEmptyComponentProps>;
}>;

type RefinementSuggestionsTemplatesWithoutHeader = Partial<{
  header: Template<RefinementSuggestionsHeaderComponentProps>;
  item: Template<RefinementSuggestionsItemComponentProps>;
  empty: Template<RefinementSuggestionsEmptyComponentProps>;
}>;

const createRenderer =
  ({
    renderState,
    cssClasses,
    containerNode,
    templates,
    maxSuggestions,
  }: {
    containerNode: HTMLElement;
    cssClasses: RefinementSuggestionsCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<RefinementSuggestionsTemplatesWithoutHeader>;
    };
    templates: RefinementSuggestionsTemplates;
    maxSuggestions?: number;
  }): Renderer<
    RefinementSuggestionsRenderState,
    Partial<RefinementSuggestionsWidgetParams>
  > =>
  (props, isFirstRendering) => {
    const { suggestions, isLoading, refine, instantSearchInstance } = props;

    const headerTemplate =
      templates.header === false ? undefined : templates.header;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates:
          {} as unknown as RefinementSuggestionsTemplatesWithoutHeader,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: {
          header: headerTemplate,
          item: templates.item,
          empty: templates.empty,
        },
      });
      return;
    }

    let headerComponent: RefinementSuggestionsUiProps['headerComponent'];
    if (templates.header === false) {
      headerComponent = false;
    } else if (headerTemplate) {
      headerComponent = (
        headerProps: RefinementSuggestionsHeaderComponentProps
      ) => {
        return (
          <TemplateComponent
            {...renderState.templateProps}
            templateKey="header"
            rootTagName="div"
            data={headerProps}
          />
        );
      };
    }

    const itemComponent = templates.item
      ? (itemProps: RefinementSuggestionsItemComponentProps) => {
          return (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="item"
              rootTagName="fragment"
              data={itemProps}
            />
          );
        }
      : undefined;

    const emptyComponent = templates.empty
      ? (emptyProps: RefinementSuggestionsEmptyComponentProps) => {
          return (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="empty"
              rootTagName="div"
              data={emptyProps}
            />
          );
        }
      : undefined;

    const uiProps: UiProps = {
      suggestions,
      isLoading,
      onRefine: refine,
      skeletonCount: maxSuggestions,
      itemComponent,
      headerComponent,
      emptyComponent,
    };

    render(
      <RefinementSuggestions classNames={cssClasses} {...uiProps} />,
      containerNode
    );
  };

type RefinementSuggestionsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: RefinementSuggestionsTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: RefinementSuggestionsCSSClasses;
};

export type RefinementSuggestionsWidget = WidgetFactory<
  RefinementSuggestionsWidgetDescription & {
    $$widgetType: 'ais.refinementSuggestions';
  },
  RefinementSuggestionsConnectorParams,
  RefinementSuggestionsWidgetParams
>;

export default (function refinementSuggestions(
  widgetParams: RefinementSuggestionsWidgetParams &
    RefinementSuggestionsConnectorParams
) {
  const {
    container,
    templates = {},
    cssClasses = {},
    agentId,
    attributes,
    maxSuggestions,
    debounceMs,
    hitsToSample,
    transformItems,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
    maxSuggestions,
  });

  const makeWidget = connectRefinementSuggestions(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      agentId,
      attributes,
      maxSuggestions,
      debounceMs,
      hitsToSample,
      transformItems,
    }),
    $$widgetType: 'ais.refinementSuggestions',
  };
} satisfies RefinementSuggestionsWidget);
