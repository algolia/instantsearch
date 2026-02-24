/** @jsx h */

import { createFilterSuggestionsComponent } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectFilterSuggestions from '../../connectors/filter-suggestions/connectFilterSuggestions';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  FilterSuggestionsRenderState,
  FilterSuggestionsConnectorParams,
  FilterSuggestionsWidgetDescription,
} from '../../connectors/filter-suggestions/connectFilterSuggestions';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { WidgetFactory, Renderer, Template } from '../../types';
import type {
  FilterSuggestionsClassNames,
  FilterSuggestionsEmptyComponentProps,
  FilterSuggestionsHeaderComponentProps,
  FilterSuggestionsItemComponentProps,
  FilterSuggestionsProps as FilterSuggestionsUiProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'filter-suggestions',
});

const FilterSuggestions = createFilterSuggestionsComponent({
  createElement: h,
  Fragment: 'fragment',
});

type UiProps = Pick<
  Parameters<typeof FilterSuggestions>[0],
  | 'suggestions'
  | 'isLoading'
  | 'refine'
  | 'skeletonCount'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
>;

export type FilterSuggestionsCSSClasses = Partial<FilterSuggestionsClassNames>;

export type FilterSuggestionsTemplates = Partial<{
  /**
   * Template to use for the header. Set to `false` to disable the header.
   */
  header: Template<FilterSuggestionsHeaderComponentProps> | false;
  /**
   * Template to use for each suggestion item.
   */
  item: Template<FilterSuggestionsItemComponentProps>;
  /**
   * Template to use when there are no suggestions.
   */
  empty: Template<FilterSuggestionsEmptyComponentProps>;
}>;

type FilterSuggestionsTemplatesWithoutHeader = Partial<{
  header: Template<FilterSuggestionsHeaderComponentProps>;
  item: Template<FilterSuggestionsItemComponentProps>;
  empty: Template<FilterSuggestionsEmptyComponentProps>;
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
    cssClasses: FilterSuggestionsCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<FilterSuggestionsTemplatesWithoutHeader>;
    };
    templates: FilterSuggestionsTemplates;
    maxSuggestions?: number;
  }): Renderer<
    FilterSuggestionsRenderState,
    Partial<FilterSuggestionsWidgetParams>
  > =>
  (props, isFirstRendering) => {
    const { suggestions, isLoading, refine, instantSearchInstance } = props;

    const headerTemplate =
      templates.header === false ? undefined : templates.header;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates:
          {} as unknown as FilterSuggestionsTemplatesWithoutHeader,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: {
          header: headerTemplate,
          item: templates.item,
          empty: templates.empty,
        },
      });
      return;
    }

    let headerComponent: FilterSuggestionsUiProps['headerComponent'];
    if (templates.header === false) {
      headerComponent = false;
    } else if (headerTemplate) {
      headerComponent = (
        headerProps: FilterSuggestionsHeaderComponentProps
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
      ? (itemProps: FilterSuggestionsItemComponentProps) => {
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
      ? (emptyProps: FilterSuggestionsEmptyComponentProps) => {
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
      refine,
      skeletonCount: maxSuggestions,
      itemComponent,
      headerComponent,
      emptyComponent,
    };

    render(
      <FilterSuggestions classNames={cssClasses} {...uiProps} />,
      containerNode
    );
  };

type FilterSuggestionsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: FilterSuggestionsTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: FilterSuggestionsCSSClasses;
};

export type FilterSuggestionsWidget = WidgetFactory<
  FilterSuggestionsWidgetDescription & {
    $$widgetType: 'ais.filterSuggestions';
  },
  FilterSuggestionsConnectorParams,
  FilterSuggestionsWidgetParams
>;

export default (function filterSuggestions(
  widgetParams: FilterSuggestionsWidgetParams & FilterSuggestionsConnectorParams
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
    transport,
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

  const makeWidget = connectFilterSuggestions(specializedRenderer, () =>
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
      transport,
    }),
    $$widgetType: 'ais.filterSuggestions',
  };
} satisfies FilterSuggestionsWidget);
