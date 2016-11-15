import find from 'lodash/find';
import React from 'react';
import ReactDOM from 'react-dom';
import defaultTemplates from '../defaultTemplates.js';
import {
  prepareTemplateProps,
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
  cssClasses,
} = {}) => {
  const on = userValues ? escapeRefinement(userValues.on) : undefined;
  const off = userValues ? escapeRefinement(userValues.off) : undefined;

  return {
    getConfiguration() {
      return {
        disjunctiveFacets: [attributeName],
      };
    },
    toggleRefinement(helper, facetValue, isRefined) {
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
        templates,
      });

      this.toggleRefinement = this.toggleRefinement.bind(this, helper);

      // no need to refine anything at init if no custom off values
      if (!hasAnOffValue) {
        return;
      }

      // Add filtering on the 'off' value if set
      const isRefined = state.isDisjunctiveFacetRefined(attributeName, on);
      if (!isRefined) {
        helper.addDisjunctiveFacetRefinement(attributeName, off);
      }
    },
    render({helper, results, state, createURL}) {
      const isRefined = helper.state.isDisjunctiveFacetRefined(attributeName, on);
      const onValue = on;
      const offValue = off === undefined ? false : off;
      const allFacetValues = results.getFacetValues(attributeName);
      const onData = find(allFacetValues, {name: unescapeRefinement(onValue)});
      const onFacetValue = {
        name: label,
        isRefined: onData !== undefined ? onData.isRefined : false,
        count: onData === undefined ? null : onData.count,
      };
      const offData = hasAnOffValue ? find(allFacetValues, {name: unescapeRefinement(offValue)}) : undefined;
      const offFacetValue = {
        name: label,
        isRefined: offData !== undefined ? offData.isRefined : false,
        count: offData === undefined ? results.nbHits : offData.count,
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
        offFacetValue,
      };

      // Bind createURL to this specific attribute
      function _createURL() {
        return createURL(
          state
            .removeDisjunctiveFacetRefinement(attributeName, isRefined ? onValue : off)
            .addDisjunctiveFacetRefinement(attributeName, isRefined ? off : onValue)
        );
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
    },
  };
};

function escapeRefinement(value) {
  if (typeof value === 'number' && value < 0) {
    value = String(value).replace('-', '\\-');
  }

  return value;
}

function unescapeRefinement(value) {
  return String(value).replace(/^\\-/, '-');
}

export default currentToggle;
