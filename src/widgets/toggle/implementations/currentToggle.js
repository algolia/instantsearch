import find from 'lodash/collection/find';
import React from 'react';
import ReactDOM from 'react-dom';
import defaultTemplates from '../defaultTemplates.js';
import {
  prepareTemplateProps
} from '../../../lib/utils.js';

// cannot use a function declaration because of
// https://github.com/speedskater/babel-plugin-rewire/issues/109#issuecomment-227917555
const currentToggle = ({
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
} = {}) => ({
  getConfiguration() {
    return {
      disjunctiveFacets: [attributeName]
    };
  },
  toggleRefinement(helper, facetValue, isRefined) {
    const on = userValues.on;
    const off = userValues.off;

    // Checking
    if (!isRefined) {
      if (hasAnOffValue) {
        helper.removeDisjunctiveFacetRefinement(attributeName, off);
      }
      helper.addDisjunctiveFacetRefinement(attributeName, on);
    } else {
      // Unchecking
      helper.removeDisjunctiveFacetRefinement(attributeName, on);
      if (hasAnOffValue) {
        helper.addDisjunctiveFacetRefinement(attributeName, off);
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
    const isRefined = state.isDisjunctiveFacetRefined(attributeName, userValues.on);
    if (!isRefined) {
      helper.addDisjunctiveFacetRefinement(attributeName, userValues.off);
    }
  },
  render({helper, results, state, createURL}) {
    const isRefined = helper.state.isDisjunctiveFacetRefined(attributeName, userValues.on);
    const onValue = userValues.on;
    const offValue = userValues.off === undefined ? false : userValues.off;
    const allFacetValues = results.getFacetValues(attributeName);
    const onData = find(allFacetValues, {name: onValue.toString()});
    const onFacetValue = {
      name: label,
      isRefined: onData !== undefined ? onData.isRefined : false,
      count: onData === undefined ? null : onData.count
    };
    const offData = find(allFacetValues, {name: offValue.toString()});
    const offFacetValue = {
      name: label,
      isRefined: offData !== undefined ? offData.isRefined : false,
      count: offData === undefined ? null : offData.count
    };

        // what will we show by default,
        // if checkbox is not checked, show: [ ] free shipping (countWhenChecked)
        // if checkbox is checked, show: [x] free shipping (countWhenNotChecked)
    const nextRefinement = isRefined ? offFacetValue : onFacetValue;

    const facetValue = {
      name: label,
      isRefined,
      count: nextRefinement === undefined ? null : nextRefinement.count,
      onFacetValue,
      offFacetValue
    };

        // Bind createURL to this specific attribute
    function _createURL() {
      return createURL(
            state
              .removeDisjunctiveFacetRefinement(attributeName, isRefined ? onValue : userValues.off)
              .addDisjunctiveFacetRefinement(attributeName, isRefined ? userValues.off : onValue)
          );
    }

    ReactDOM.render(
          <RefinementList
            collapsible={collapsible}
            createURL={_createURL}
            cssClasses={cssClasses}
            facetValues={[facetValue]}
            shouldAutoHideContainer={results.nbHits === 0}
            templateProps={this._templateProps}
            toggleRefinement={this.toggleRefinement}
          />,
          containerNode
        );
  }
});

export default currentToggle;
