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
import { WidgetFactory, Renderer, RenderOptions, ResultHit } from '../../types';

export type RelatedItemsCSSClasses = {
  root: string;
};

export type RelatedItemsTemplates = {
  default?: string | (({ items }: { items: any }) => string);
};

type RelatedAttribute = {
  value?: any;
  score?: number;
  operator?: string;
};

type RelatedAttributes = {
  [attribute: string]: Array<RelatedAttribute>;
};

type RelatedItemsWidgetParams = {
  hit: ResultHit;
  limit: number;
  relatedAttributes?: RelatedAttributes;
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
      .map(
        item => `
<li>
  <strong>${item.name}</strong>

  <ul>
    <li>price: ${item.price}</li>
    <li>rating: ${item.rating}</li>
    <li>categories: [${item.categories.join(', ')}]</li>
  </ul>
</li>`
      )
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
    hit,
    relatedAttributes = Object.keys(hit).reduce((acc, key) => {
      acc[key] = [{}];

      return acc;
    }, {}),
    limit = 5,
    cssClasses: userCssClasses = {} as RelatedItemsCSSClasses,
    templates: userTemplates = {},
    transformItems = items => items,
  } = {} as RelatedItemsWidgetParams
) => {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (!hit) {
    throw new Error(withUsage('The `hit` option is required.'));
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
    hit,
    relatedAttributes,
    limit,
    cssClasses,
    templates,
    transformItems,
  });
};

const connectRelatedItems = (renderFn, unmountFn = noop) => {
  return widgetParams => {
    const { hit, limit, relatedAttributes } = widgetParams || {};

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
              const value =
                attribute.value !== undefined
                  ? attribute.value
                  : hit[attributeName];

              if (Array.isArray(value)) {
                return value.map(filterValue => {
                  const filter = `${attributeName}${operator}${filterValue}`;
                  const score =
                    attribute.score !== undefined
                      ? `<score=${attribute.score}>`
                      : '';

                  return `${filter}${score}`;
                });
              } else {
                const filter = `${attributeName}${operator}${value}`;
                const score =
                  attribute.score !== undefined
                    ? `<score=${attribute.score}>`
                    : '';

                return `${filter}${score}`;
              }
            });

            acc.push(filters);

            return acc;
          },
          []
        );

        const searchParameters = state.setQueryParameters({
          hitsPerPage: limit,
          sumOrFiltersScores: true,
          filters: `NOT objectID:${hit.objectID}`,
          optionalFilters,
        });

        console.log(JSON.stringify(searchParameters, null, 2));

        return searchParameters;
      },
    };
  };
};

export default relatedItems;
