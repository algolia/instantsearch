/** @jsx h */

import { createCompareBarComponent } from 'instantsearch-ui-components';
import { h, Fragment, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectCompare from '../../connectors/compare/connectCompare';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  CompareConnectorParams,
  CompareRenderState,
} from '../../connectors/compare/connectCompare';
import type { RendererOptions, Template } from '../../types';
import type {
  CompareBarClassNames,
  CompareBarItem,
  CompareBarTranslations,
  Pragma,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'compareBar',
});

export type CompareBarTemplates = Partial<{
  /**
   * Template for a selected item's label.
   */
  item: Template<{ item: CompareBarItem }>;
}>;

export type CompareBarWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: CompareBarTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: Partial<CompareBarClassNames>;

  /**
   * Translations for the widget's texts.
   */
  translations?: Partial<CompareBarTranslations>;
} & CompareConnectorParams;

const CompareBar = createCompareBarComponent({
  createElement: h as unknown as Pragma,
  Fragment,
});

/**
 * The `compareBar` widget renders the comparison selection bar: the records
 * picked for comparison (through the shared `compare` render state), a
 * clear-selection action, and the "Compare" call-to-action that opens the
 * sibling `chat` widget with the comparison message.
 *
 * Select records from your own UI (e.g. a "Compare" button in the `hits`
 * template) by calling `toggleItem(hit)` from the `compare` render state.
 */
export default function compareBar(widgetParams: CompareBarWidgetParams) {
  const {
    container,
    templates: userTemplates = {},
    cssClasses = {},
    translations,
    ...connectorParams
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const templates: CompareBarTemplates = { ...userTemplates };

  function renderCompareBar(
    renderState: CompareRenderState & RendererOptions<CompareConnectorParams>,
    _isFirstRender: boolean
  ) {
    const {
      items,
      minItems,
      maxItems,
      canCompare,
      removeItem,
      clearItems,
      compare,
      instantSearchInstance,
    } = renderState;

    const templateProps = prepareTemplateProps({
      defaultTemplates: {} as unknown as CompareBarTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });

    const itemComponent = templates.item
      ? ({ item }: { item: CompareBarItem }) => (
          <TemplateComponent
            {...templateProps}
            templateKey="item"
            rootTagName="fragment"
            data={{ item }}
          />
        )
      : undefined;

    render(
      <CompareBar
        items={items}
        minItems={minItems}
        maxItems={maxItems}
        canCompare={canCompare}
        onCompare={() => compare()}
        onRemove={(item) => removeItem(item.objectID)}
        onClear={clearItems}
        itemComponent={itemComponent}
        classNames={cssClasses}
        translations={translations}
      />,
      containerNode
    );
  }

  const makeWidget = connectCompare(renderCompareBar, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget(connectorParams),
    $$widgetType: 'ais.compareBar' as const,
  };
}
