/** @jsx h */

// @ts-nocheck

import { createAutocompleteComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

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
  }: {
    containerNode: HTMLElement;
    placeholder?: string;
  }): Renderer<AutocompleteRenderState, Partial<AutocompleteWidgetParams>> =>
  ({ items, isOpen, refine, query }) => {
    render(
      <Autocomplete
        isOpen={isOpen}
        items={items}
        onInput={(evt) => refine(evt.target.value)}
        query={query}
        placeholder={placeholder}
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
  const { container, placeholder } = widgetParams || {};

  const containerNode = getContainerNode(container);

  const specializedRenderer = renderer({
    containerNode,
    placeholder,
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
