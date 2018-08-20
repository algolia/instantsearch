import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import defaultTemplates from './defaultTemplates';
import getShowMoreConfig from '../../lib/show-more/getShowMoreConfig';
import connectMenu from '../../connectors/menu/connectMenu';
import RefinementList from '../../components/RefinementList/RefinementList';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
  prefixKeys,
} from '../../lib/utils';

const bem = bemHelper('ais-menu');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  autoHideContainer,
  renderState,
  templates,
  transformData,
  showMoreConfig,
}) => (
  {
    refine,
    items,
    createURL,
    canRefine,
    instantSearchInstance,
    isShowingMore,
    toggleShowMore,
    canToggleShowMore,
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const facetValues = items.map(facetValue => ({
    ...facetValue,
    url: createURL(facetValue.name),
  }));
  const shouldAutoHideContainer = autoHideContainer && !canRefine;

  render(
    <RefinementList
      collapsible={collapsible}
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={facetValues}
      shouldAutoHideContainer={shouldAutoHideContainer}
      showMore={showMoreConfig !== null}
      templateProps={renderState.templateProps}
      toggleRefinement={refine}
      toggleShowMore={toggleShowMore}
      isShowingMore={isShowingMore}
      canToggleShowMore={canToggleShowMore}
    />,
    containerNode
  );
};

const usage = `Usage:
menu({
  container,
  attributeName,
  [ sortBy=['name:asc'] ],
  [ limit=10 ],
  [ cssClasses.{root,list,item} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer ],
  [ showMore.{templates: {active, inactive}, limit} ],
  [ collapsible=false ],
  [ transformItems ]
})`;

/**
 * @typedef {Object} MenuCSSClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [header] CSS class to add to the header element.
 * @property {string|string[]} [body] CSS class to add to the body element.
 * @property {string|string[]} [footer] CSS class to add to the footer element.
 * @property {string|string[]} [list] CSS class to add to the list element.
 * @property {string|string[]} [item] CSS class to add to each item element.
 * @property {string|string[]} [active] CSS class to add to each active element.
 * @property {string|string[]} [link] CSS class to add to each link (when using the default template).
 * @property {string|string[]} [count] CSS class to add to each count element (when using the default template).
 */

/**
 * @typedef {Object} MenuTemplates
 * @property {string|function} [header] Header template.
 * @property {string|function({count: number, cssClasses: object, isRefined: boolean, label: string, url: string, value: string}):string} [item] Item template. The string template gets the same values as the function.
 * @property {string|function} [footer] Footer template.
 */

/**
 * @typedef {Object} MenuShowMoreOptions
 * @property {MenuShowMoreTemplates} [templates] Templates to use for showMore.
 * @property {number} [limit] Max number of facets values to display when showMore is clicked.
 */

/**
 * @typedef {Object} MenuShowMoreTemplates
 * @property {string} [active] Template used when showMore was clicked.
 * @property {string} [inactive] Template used when showMore not clicked.
 */

/**
 * @typedef {Object} MenuTransforms
 * @property {function} [item] Method to change the object passed to the `item` template.
 */

/**
 * @typedef {Object} MenuWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attributeName Name of the attribute for faceting
 * @property {string[]|function} [sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {MenuTemplates} [templates] Customize the output through templating.
 * @property {number} [limit=10] How many facets values to retrieve.
 * @property {boolean|MenuShowMoreOptions} [showMore=false] Limit the number of results and display a showMore button.
 * @property {MenuTransforms} [transformData] Set of functions to update the data before passing them to the templates.
 * @property {boolean} [autoHideContainer=true] Hide the container when there are no items in the menu.
 * @property {MenuCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {boolean|{collapsible: boolean}} [collapsible=false] Hide the widget body and footer when clicking on header.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * Create a menu based on a facet. A menu displays facet values and let the user selects only one value at a time.
 * It also displays an empty value which lets the user "unselect" any previous selection.
 *
 * @requirements
 * The attribute passed to `attributeName` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 * @type {WidgetFactory}
 * @devNovel Menu
 * @category filter
 * @param {MenuWidgetOptions} $0 The Menu widget options.
 * @return {Widget} Creates a new instance of the Menu widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.menu({
 *     container: '#categories',
 *     attributeName: 'hierarchicalCategories.lvl0',
 *     limit: 10,
 *     templates: {
 *       header: 'Categories'
 *     }
 *   })
 * );
 */
export default function menu({
  container,
  attributeName,
  sortBy = ['name:asc'],
  limit = 10,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  collapsible = false,
  transformData,
  autoHideContainer = true,
  showMore = false,
  transformItems,
}) {
  if (!container) {
    throw new Error(usage);
  }

  const showMoreConfig = getShowMoreConfig(showMore);
  if (showMoreConfig && showMoreConfig.limit < limit) {
    throw new Error('showMore.limit configuration should be > than the limit in the main configuration'); // eslint-disable-line
  }

  const containerNode = getContainerNode(container);

  const showMoreLimit = (showMoreConfig && showMoreConfig.limit) || undefined;
  const showMoreTemplates =
    showMoreConfig && prefixKeys('show-more-', showMoreConfig.templates);
  const allTemplates = showMoreTemplates
    ? { ...templates, ...showMoreTemplates }
    : templates;

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    link: cx(bem('link'), userCssClasses.link),
    count: cx(bem('count'), userCssClasses.count),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
    autoHideContainer,
    renderState: {},
    templates: allTemplates,
    transformData,
    showMoreConfig,
  });

  try {
    const makeWidget = connectMenu(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({
      attributeName,
      limit,
      sortBy,
      showMoreLimit,
      transformItems,
    });
  } catch (e) {
    throw new Error(usage);
  }
}
