/** @jsx h */

// @ts-nocheck

import { createAutocompleteComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import type { Renderer, WidgetFactory } from '../../types';

// overcharge h to replace onChange with onInput
const augmentedHyperscript = (type, props, ...children) => {
  const newProps = { ...props };
  if (newProps.onChange) {
    newProps.onInput = newProps.onChange;
    delete newProps.onChange;
  }
  return h(type, newProps, ...children);
};

const Autocomplete = createAutocompleteComponent({
  createElement: augmentedHyperscript,
  Fragment,
});

type AutocompleteRenderState = {
  query: string;
  refine: (query: string) => void;
  isOpen: boolean;
  items: string[];
};

const renderer =
  ({
    placeholder,
    containerNode,
    templates,
    renderState,
  }: {
    containerNode: HTMLElement;
    placeholder?: string;
    templates: { layout: any };
  }): Renderer<AutocompleteRenderState, Partial<AutocompleteWidgetParams>> =>
  (
    { items, isOpen, refine, query, instantSearchInstance },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {},
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    const panelComponent = (
      templates.panel
        ? () => (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="panel"
              rootTagName="fragment"
              data={{ items }}
            />
          )
        : undefined
    ) as FrequentlyBoughtTogetherUiProps<Hit>['emptyComponent'];

    render(
      <Autocomplete
        isOpen={isOpen}
        items={items}
        onInput={(evt) => refine(evt.target.value)}
        query={query}
        placeholder={placeholder}
        panelComponent={panelComponent}
      />,
      containerNode
    );
  };

export type AutocompleteWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Placeholder text for the input field.
   */
  placeholder?: string;
};

export type AutocompleteWidget = WidgetFactory<
  AutocompleteWidgetDescription & { $$widgetType: 'ais.hits' },
  AutocompleteConnectorParams,
  AutocompleteWidgetParams
>;

export default (function autocomplete(
  widgetParams: AutocompleteWidgetParams & AutocompleteConnectorParams
) {
  const { container, placeholder, templates } = widgetParams || {};

  const containerNode = getContainerNode(container);

  const specializedRenderer = renderer({
    containerNode,
    placeholder,
    renderState: {},
    templates,
  });

  const makeWidget = connectAutocomplete(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ placeholder }),
    $$widgetType: 'ais.autocomplete',
  };
} satisfies AutocompleteWidget);

function connectAutocomplete(
  renderFn: Renderer<
    AutocompleteRenderState,
    Partial<AutocompleteWidgetParams>
  >,
  unmount: () => void
): AutocompleteWidget {
  return () => ({
    $$type: 'ais.autocomplete',
    init: ({ instantSearchInstance }) => {
      renderFn(
        {
          instantSearchInstance,
          isOpen: false,
          items: [],
          query: '',
          refine: (query) => {
            console.log('refine', query);
          },
        },
        true
      );
    },
    render: ({ helper, instantSearchInstance, state, ...rest }) => {
      const query = state.query || '';

      renderFn(
        {
          instantSearchInstance,
          isOpen: query.length > 0,
          items: [
            'Evil Chicken Bouillon',
            'Ginger Garlic Paste',
            'Oyster Sauce',
            'Lao Gan Ma Spicy Chili Crisp',
            'Sauce Gribiche',
          ],
          query,
          refine: (newQuery) => {
            helper.setQuery(newQuery).search();
          },
        },
        false
      );
    },
    dispose: () => {
      unmount();
    },
  });
}

type AutocompleteWidgetDescription = {
  $$widgetType: 'ais.autocomplete';
};

type AutocompleteConnectorParams = {
  color?: string;
} & Partial<AutocompleteWidgetParams>;
