/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import connectRelatedHits, {
  MatchingPatterns,
} from '../../connectors/related-hits/connectRelatedHits';
import Template from '../../components/Template/Template';
import {
  WidgetFactory,
  Renderer,
  ResultHit,
  Template as WidgetTemplate,
} from '../../types';
import { SearchParameters } from 'algoliasearch-helper';

export type RelatedHitsCSSClasses = {
  root: string;
};

export type RelatedHitsTemplates = {
  default?: WidgetTemplate<{ items: any }>;
};

type RelatedHitsWidgetParams = {
  container: string | HTMLElement;
  hit: ResultHit;
  matchingPatterns?: MatchingPatterns;
  cssClasses?: RelatedHitsCSSClasses;
  templates?: RelatedHitsTemplates;
  transformItems?(items: any[]): any[];
  transformSearchParameters?(
    searchParameters: SearchParameters
  ): Partial<SearchParameters>;
};

interface RelatedHitsRendererWidgetParams extends RelatedHitsWidgetParams {
  container: HTMLElement;
  cssClasses: RelatedHitsCSSClasses;
  templates: RelatedHitsTemplates;
}

export type RelatedHitsRenderer<TRelatedHitsWidgetParams> = Renderer<any>;

type RelatedHits = WidgetFactory<RelatedHitsWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'related-hits',
});

const suit = component('RelatedHits');

function RelatedHits({ items, templates, cssClasses }) {
  const defaultTemplate = ({ items }) => {
    return `
<ul>${items
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

const renderer: RelatedHitsRenderer<RelatedHitsRendererWidgetParams> = ({
  items,
  widgetParams,
}) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <RelatedHits cssClasses={cssClasses} templates={templates} items={items} />,
    container
  );
};

const relatedHits: RelatedHits = (
  {
    container,
    hit,
    matchingPatterns,
    cssClasses: userCssClasses = {} as RelatedHitsCSSClasses,
    templates: userTemplates = {},
    transformItems,
    transformSearchParameters,
  } = {} as RelatedHitsWidgetParams
) => {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  };

  const defaultTemplates = {
    default: ({ items }) => JSON.stringify(items, null, 2),
  };
  const templates: RelatedHitsTemplates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const containerNode = getContainerNode(container);
  const makeRelatedHits = connectRelatedHits(renderer, () => {
    render(null, containerNode);
  });

  return makeRelatedHits({
    container: containerNode,
    hit,
    matchingPatterns,
    cssClasses,
    templates,
    transformItems,
    transformSearchParameters,
  });
};

export default relatedHits;
