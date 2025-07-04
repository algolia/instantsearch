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

type AllWidgets = typeof widgets;
// We only track widgets that use connectors.
const NON_WIDGETS = ['Highlight', 'Snippet', 'PoweredBy'] as const;
type RegularWidgets = Omit<typeof widgets, typeof NON_WIDGETS[number]>;

export type SingleWidget = {
  [name in keyof AllWidgets]: {
    name: name;
    Component: AllWidgets[name];
  };
}[keyof AllWidgets];

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
    case 'Highlight': {
      return (
        <widget.Component
          hit={{ objectID: '', __position: 0 }}
          attribute="objectID"
          {...props}
        />
      );
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
    case 'TrendingFacets': {
      return (
        <widget.Component
          facetName="foobar"
          itemComponent={({ item }) => <div>{item.objectID}</div>}
          {...props}
        />
      );
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
  return Object.entries(widgets).map(([name, Component]) => {
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
