import find from 'lodash/collection/find';
import React from 'react';
import ReactDOM from 'react-dom';
import defaultTemplates from '../defaultTemplates.js';
import {
  prepareTemplateProps
} from '../../../lib/utils.js';

export default function currentToggle({
  attributeName,
  label,
  userValues,
  templates,
  collapsible,
  transformData,
  hasAnOffValue,
  containerNode,
  RefinementList,
  cssClasses
} = {}) {
  return {
    getConfiguration() {
      return {
        facets: [attributeName]
      };
    },
    toggleRefinement(helper, facetValue, isRefined) {
      const on = userValues.on;
      const off = userValues.off;

      // Checking
      if (!isRefined) {
        if (hasAnOffValue) {
          helper.removeFacetRefinement(attributeName, off);
        }
        helper.addFacetRefinement(attributeName, on);
      } else {
        // Unchecking
        helper.removeFacetRefinement(attributeName, on);
        if (hasAnOffValue) {
          helper.addFacetRefinement(attributeName, off);
        }
      }

      helper.search();
    },
    init({state, helper, templatesConfig}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });
      this.toggleRefinement = this.toggleRefinement.bind(this, helper);

      // no need to refine anything at init if no custom off values
      if (!hasAnOffValue) {
        return;
      }
      // Add filtering on the 'off' value if set
      const isRefined = state.isFacetRefined(attributeName, userValues.on);
      if (!isRefined) {
        helper.addFacetRefinement(attributeName, userValues.off);
      }
    },
    render({helper, results, state, createURL}) {
      const isRefined = helper.state.isFacetRefined(attributeName, userValues.on);
      const currentRefinement = isRefined ? userValues.on : userValues.off;
      let count;
      if (typeof currentRefinement === 'number') {
        count = results.getFacetStats(attributeName).sum;
      } else {
        const facetData = find(results.getFacetValues(attributeName), {name: isRefined.toString()});
        count = facetData !== undefined ? facetData.count : null;
      }

      const facetValue = {
        name: label,
        isRefined,
        count
      };

      // Bind createURL to this specific attribute
      function _createURL() {
        return createURL(state.toggleRefinement(attributeName, isRefined));
      }

      ReactDOM.render(
        <RefinementList
          collapsible={collapsible}
          createURL={_createURL}
          cssClasses={cssClasses}
          facetValues={[facetValue]}
          shouldAutoHideContainer={(facetValue.count === 0 || facetValue.count === null)}
          templateProps={this._templateProps}
          toggleRefinement={this.toggleRefinement}
        />,
        containerNode
      );
    }
  };
}
