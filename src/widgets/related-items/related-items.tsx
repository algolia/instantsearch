/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import Template from '../../components/Template/Template';
import { WidgetFactory, Renderer, RenderOptions } from '../../types';

export type RelatedItemsCSSClasses = {
  root: string;
};

export type RelatedItemsTemplates = {
  default?: string | (({ items }: { items: any }) => string);
};

type RelatedAttribute = {
  value: any;
  score?: number;
  operator?: string;
};

type RelatedAttributes = {
  [attribute: string]: Array<RelatedAttribute>;
};

type RelatedItemsWidgetParams = {
  objectID: string;
  limit: number;
  relatedAttributes: RelatedAttributes;
  container: string | HTMLElement;
  cssClasses?: RelatedItemsCSSClasses;
  templates?: RelatedItemsTemplates;
  transformItems?: (items: any[]) => any;
};

interface RelatedItemsRendererWidgetParams extends RelatedItemsWidgetParams {
  container: HTMLElement;
  cssClasses: RelatedItemsCSSClasses;
  templates: RelatedItemsTemplates;
}

export type RelatedItemsRenderer<TRelatedItemsWidgetParams> = Renderer<any>;

type RelatedItems = WidgetFactory<RelatedItemsWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'related-items',
});

const suit = component('RelatedItems');

function RelatedItems({ items, templates, cssClasses }) {
  const defaultTemplate = ({ items }) => {
    return `<ul>${items
      .map(item => `<li>${item.name} | ${item.price}</li>`)
      .join('')}</ul>`;
  };

  return (
    <Template
      templates={{ ...templates, default: defaultTemplate }}
      templateKey="default"
      rootProps={{ className: cssClasses.root }}
      data={{ items }}
    />
  );
}

const renderer: RelatedItemsRenderer<RelatedItemsRendererWidgetParams> = ({
  items,
  widgetParams,
}) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <RelatedItems
      cssClasses={cssClasses}
      templates={templates}
      items={items}
    />,
    container
  );
};

const relatedItems: RelatedItems = (
  {
    container,
    objectID,
    relatedAttributes = {},
    limit = 5,
    cssClasses: userCssClasses = {} as RelatedItemsCSSClasses,
    templates: userTemplates = {},
    transformItems = items => items,
  } = {} as RelatedItemsWidgetParams
) => {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (!objectID) {
    throw new Error(withUsage('The `objectID` option is required.'));
  }

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  };

  const defaultTemplates = {
    default: ({ items }) => JSON.stringify(items, null, 2),
  };
  const templates: RelatedItemsTemplates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const containerNode = getContainerNode(container);
  const makeRelatedItems = connectRelatedItems(renderer, () => {
    render(null, containerNode);
  });

  return makeRelatedItems({
    container: containerNode,
    objectID,
    relatedAttributes,
    limit,
    cssClasses,
    templates,
    transformItems,
  });
};

const connectRelatedItems = (renderFn, unmountFn = noop) => {
  return widgetParams => {
    const { objectID, limit, relatedAttributes } = widgetParams || {};

    return {
      init({}) {
        renderFn({
          items: [],
          widgetParams,
        });
      },

      render({ results }) {
        renderFn({
          items: results.hits,
          widgetParams,
        });
      },

      dispose() {
        unmountFn();
      },

      getWidgetSearchParameters(state) {
        const optionalFilters = Object.keys(relatedAttributes).reduce<string[]>(
          (acc, attributeName) => {
            const attributes = relatedAttributes[attributeName];

            const filters = attributes.map((attribute: RelatedAttribute) => {
              const operator =
                attribute.operator !== undefined ? attribute.operator : ':';
              const filter = `${attributeName}${operator}${attribute.value}`;
              const score =
                attribute.score !== undefined
                  ? `<score=${attribute.score}>`
                  : '';

              return `${filter}${score}`;
            });

            acc.push(filters);

            return acc;
          },
          []
        );

        console.log(
          JSON.stringify(
            state.setQueryParameters({
              hitsPerPage: limit,
              sumOrFiltersScores: true,
              filters: `NOT objectID:${objectID}`,
              optionalFilters,
            }),
            null,
            2
          )
        );

        return state.setQueryParameters({
          hitsPerPage: limit,
          sumOrFiltersScores: true,
          filters: `NOT objectID:${objectID}`,
          optionalFilters,
        });
      },
    };
  };
};

export default relatedItems;
