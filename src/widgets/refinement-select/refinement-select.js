import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import headerFooterHOC from '../../decorators/headerFooter.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import RefinementSelectComponent from '../../components/RefinementSelect/RefinementSelect.js';
import defaultTemplates from './defaultTemplates.js';

import {
  getContainerNode,
  prepareTemplateProps,
  bemHelper,
} from '../../lib/utils.js';

const bem = bemHelper('ais-refinement-select');

const usage = `Usage:
refinementSelect({
  container,
  attributeName,
  [ autoHideContainer=true ],
  [ sortBy=['count:desc', 'name:asc'] ],
  [ cssClasses.{root,header,body,footer,select}={} ],
})`;

function refinementSelect({
  container,
  attributeName,
  autoHideContainer = true,
  sortBy = ['count:desc', 'name:asc'],
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
} = {}) {
  if (!container || !attributeName) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const RefinementSelect = autoHideContainer === true
    ? autoHideContainerHOC(headerFooterHOC(RefinementSelectComponent))
    : headerFooterHOC(RefinementSelectComponent);

  const hierarchicalFacetName = attributeName;

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    select: cx(bem('select'), userCssClasses.select),
  };

  return {
    init({helper, templatesConfig, createURL}) {
      this._templateProps = prepareTemplateProps({defaultTemplates, templatesConfig, templates});

      // TODO: find out what it does, just copy/paste
      this._createURL = (state, facetValue) => createURL(state.toggleRefinement(hierarchicalFacetName, facetValue));
      this._toggleRefinement = facetValue => helper
        .toggleRefinement(hierarchicalFacetName, facetValue)
        .search();
    },

    // TODO: find out what it does, just copy/paste
    _prepareFacetValues(facetValues, state) {
      return facetValues.map(facetValue => ({...facetValue, url: this._createURL(state, facetValue)}));
    },

    render({results, state}) {
      // TODO: find out what it does, just copy/paste
      const facetValues = this._prepareFacetValues(
        results.getFacetValues(hierarchicalFacetName, {sortBy}).data || [],
        state
      );

      ReactDOM.render(
        <RefinementSelect
          shouldAutoHideContainer={ false }
          cssClasses={ cssClasses }
          facetValues={ facetValues }
          templateProps={ this._templateProps }
        />,
        containerNode
      );
    },
  };
}

export default refinementSelect;
