import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
  prefixKeys,
} from '../../lib/utils.js';
import cx from 'classnames';
import getShowMoreConfig from '../../lib/show-more/getShowMoreConfig.js';
import defaultTemplates from '../../widgets/menu/defaultTemplates.js';

const bem = bemHelper('ais-menu');

const usage = `Usage:
menu({
  container,
  attributeName,
  [ sortBy=['count:desc', 'name:asc'] ],
  [ limit=10 ],
  [ cssClasses.{root,list,item} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer ],
  [ showMore.{templates: {active, inactive}, limit} ],
  [ collapsible=false ]
})`;

export default function connectMenu(renderFn) {
  return function menu({
      container,
      attributeName,
      sortBy = ['count:desc', 'name:asc'],
      limit = 10,
      cssClasses: userCssClasses = {},
      templates = defaultTemplates,
      collapsible = false,
      transformData,
      autoHideContainer = true,
      showMore = false,
    } = {}) {
    const showMoreConfig = getShowMoreConfig(showMore);
    if (showMoreConfig && showMoreConfig.limit < limit) {
      throw new Error('showMore.limit configuration should be > than the limit in the main configuration'); // eslint-disable-line
    }
    const widgetMaxValuesPerFacet = showMoreConfig && showMoreConfig.limit || limit;

    if (!container || !attributeName) {
      throw new Error(usage);
    }

    const containerNode = getContainerNode(container);

    // we use a hierarchicalFacet for the menu because that's one of the use cases
    // of hierarchicalFacet: a flat menu
    const hierarchicalFacetName = attributeName;

    const showMoreTemplates = showMoreConfig && prefixKeys('show-more-', showMoreConfig.templates);
    const allTemplates =
      showMoreTemplates ?
        {...templates, ...showMoreTemplates} :
        templates;

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

    return {
      getConfiguration: configuration => {
        const widgetConfiguration = {
          hierarchicalFacets: [{
            name: hierarchicalFacetName,
            attributes: [attributeName],
          }],
        };

        const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
        widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, widgetMaxValuesPerFacet);

        return widgetConfiguration;
      },
      init({templatesConfig, helper, createURL}) {
        this._templateProps = prepareTemplateProps({
          transformData,
          defaultTemplates,
          templatesConfig,
          templates: allTemplates,
        });
        this._createURL = (state, facetValue) => createURL(state.toggleRefinement(hierarchicalFacetName, facetValue));
        this._toggleRefinement = facetValue => helper
          .toggleRefinement(hierarchicalFacetName, facetValue)
          .search();

        renderFn({
          collapsible,
          createURL: () => {},
          cssClasses,
          facetValues: [],
          limitMax: widgetMaxValuesPerFacet,
          limitMin: limit,
          shouldAutoHideContainer: autoHideContainer,
          showMore: showMoreConfig !== null,
          templateProps: this._templateProps,
          toggleRefinement: this._toggleRefinement,
          containerNode,
        }, true);
      },
      _prepareFacetValues(facetValues, state) {
        return facetValues
          .map(facetValue => {
            facetValue.url = this._createURL(state, facetValue);
            return facetValue;
          });
      },
      render({results, state, createURL}) {
        let facetValues = results.getFacetValues(hierarchicalFacetName, {sortBy}).data || [];
        facetValues = this._prepareFacetValues(facetValues, state);

        // Bind createURL to this specific attribute
        function _createURL(facetValue) {
          return createURL(state.toggleRefinement(attributeName, facetValue));
        }

        renderFn({
          collapsible,
          createURL: _createURL,
          cssClasses,
          facetValues,
          limitMax: widgetMaxValuesPerFacet,
          limitMin: limit,
          shouldAutoHideContainer: autoHideContainer && facetValues.length === 0,
          showMore: showMoreConfig !== null,
          templateProps: this._templateProps,
          toggleRefinement: this._toggleRefinement,
          containerNode,
        }, false);
      },
    };
  };
}
