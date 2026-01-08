import { createSearchClient } from '@instantsearch/mocks';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  InstantSearch,
  InstantSearchServerContext,
} from 'react-instantsearch-core';

import * as widgets from '../..';

import type { InstantSearch as InstantSearchClass } from 'instantsearch.js';
import type { ComponentProps } from 'react';

// We only track widgets that use connectors.
const NON_WIDGETS = [
  'Highlight',
  'ReverseHighlight',
  'Snippet',
  'PoweredBy',
  'Chat',
  'PromptSuggestions',
  'createDefaultTools',
  'SearchIndexToolType',
  'RecommendToolType',
  'MemorizeToolType',
  'MemorySearchToolType',
  'PonderToolType',
] as const;
type RegularWidgets = Omit<typeof widgets, typeof NON_WIDGETS[number]>;

// Non-components that should be excluded from SingleWidget type
const NON_COMPONENTS = [
  'createDefaultTools',
  'SearchIndexToolType',
  'RecommendToolType',
  'MemorizeToolType',
  'MemorySearchToolType',
  'PonderToolType',
] as const;
type ComponentWidgets = Omit<typeof widgets, typeof NON_COMPONENTS[number]>;

export type SingleWidget = {
  [name in keyof ComponentWidgets]: {
    name: name;
    Component: ComponentWidgets[name];
  };
}[keyof ComponentWidgets];

/**
 * Get the props for a widget, excluding the ref prop as it's not valid for
 * "Internal" components due to the usage of a more generic ComponentProps used
 * than the React.ComponentProps.
 * We also make classNames stricter to ensure type compatibility until
 * all widgets can support class list arrays.
 */
type Props<TWidget extends SingleWidget> = Omit<
  ComponentProps<TWidget['Component']>,
  'ref' | 'classNames'
> & {
  classNames?: {
    root: string | undefined;
  };
};

/**
 * Intermediary component to render any React InstantSearch widget with their minimal props
 */
function Widget<TWidget extends SingleWidget>({
  widget,
  ...props
}: { widget: TWidget } & Props<TWidget>) {
  switch (widget.name) {
    case 'Breadcrumb': {
      return <widget.Component attributes={['']} {...props} />;
    }
    case 'SortBy': {
      return <widget.Component items={[]} {...props} />;
    }
    case 'HierarchicalMenu': {
      return (
        <widget.Component
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
          ]}
          {...props}
        />
      );
    }
    case 'HitsPerPage': {
      return (
        <widget.Component
          items={[{ label: 'one', value: 1, default: true }]}
          {...props}
        />
      );
    }
    case 'Snippet':
    case 'Highlight':
    case 'ReverseHighlight': {
      return (
        <widget.Component
          hit={{ objectID: '', __position: 0 }}
          attribute="objectID"
          {...props}
        />
      );
    }
    case 'Chat': {
      return <widget.Component agentId="agentId" {...props} />;
    }
    case 'ToggleRefinement':
    case 'RangeInput':
    case 'RefinementList':
    case 'Menu': {
      return <widget.Component attribute="brand" {...props} />;
    }
    case 'SearchBox': {
      return <widget.Component onSubmit={undefined} {...props} />;
    }
    case 'FrequentlyBoughtTogether':
    case 'RelatedProducts':
    case 'LookingSimilar': {
      return <widget.Component objectIDs={['1']} {...props} />;
    }
    case 'EXPERIMENTAL_Autocomplete': {
      // @ts-expect-error - incorrectly expects onSelect from ComponentProps<'div'>
      return <widget.Component {...props} />;
    }
    case 'FilterSuggestions': {
      return <widget.Component agentId="test-agent-id" {...props} />;
    }
    default: {
      return <widget.Component {...props} />;
    }
  }
}

/**
 * Uses the SSR APIs to access the InstantSearch widgets rendered by all React InstantSearch
 * components/widgets.
 */
export function getAllInstantSearchWidgets() {
  return Object.entries(widgets)
    .filter(
      (
        regularWidget
      ): regularWidget is [
        keyof RegularWidgets,
        RegularWidgets[keyof RegularWidgets]
      ] =>
        (NON_WIDGETS as readonly string[]).includes(regularWidget[0]) === false
    )
    .map(([name, Component]) => {
      let instantSearchInstance: InstantSearchClass | undefined = undefined;

      const widget = { name, Component } as SingleWidget;

      renderToString(
        <InstantSearchServerContext.Provider
          value={{
            notifyServer: ({ search }) => {
              instantSearchInstance = search;
            },
          }}
        >
          <InstantSearch
            searchClient={createSearchClient({})}
            indexName="indexName"
          >
            <Widget widget={widget} />
          </InstantSearch>
        </InstantSearchServerContext.Provider>
      );

      const renderedWidgets = instantSearchInstance!.mainIndex.getWidgets();

      return {
        name,
        renderedWidgets,
        widget: renderedWidgets[0],
      };
    });
}

/**
 * Retrieve all widget components, wrapped inside InstantSearch, ready to render
 */

export function getAllWidgets() {
  return Object.entries(widgets)
    .filter(([name]) => !(NON_COMPONENTS as readonly string[]).includes(name))
    .map(([name, Component]) => {
      const widget = { name, Component } as SingleWidget;

      return {
        name,
        Component: (props: Omit<ComponentProps<typeof Widget>, 'widget'>) => (
          <InstantSearch
            searchClient={createSearchClient({})}
            indexName="indexName"
          >
            <Widget {...props} widget={widget} />
          </InstantSearch>
        ),
      };
    });
}
