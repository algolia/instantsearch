import {
  checkRendering,
  escapeRefinement,
  unescapeRefinement,
} from '../../lib/utils.js';

const usage = `Usage:
var customToggle = connectToggle(function render(params) {
  // params = {
  //   isFirstRender,
  //   isFromSearch,
  //   createURL,
  //   items,
  //   refine,
  //   instantSearchInstance,
  // }
});
search.addWidget(
  customToggle({
    attributeName,
    label,
    [ values = {on: true, off: undefined} ]
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectToggle.html
`;

export const checkUsage = ({attributeName, label, usageMessage}) => {
  const noAttributeName = attributeName === undefined;
  const noLabel = label === undefined;

  if (noAttributeName || noLabel) {
    throw new Error(usageMessage);
  }
};

export default function connectToggle(renderFn) {
  checkRendering(renderFn, usage);

  return ({
    attributeName,
    label,
    values: userValues = {on: true, off: undefined},
  }) => {
    checkUsage({attributeName, label, usageMessage: usage});

    const hasAnOffValue = userValues.off !== undefined;
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

      init({state, helper, createURL, instantSearchInstance}) {
        this._instantSearchInstance = instantSearchInstance;
        this._helper = helper;

        this._createURL = isCurrentlyRefined => () => createURL(
          state
            .removeDisjunctiveFacetRefinement(attributeName, isCurrentlyRefined ? on : off)
            .addDisjunctiveFacetRefinement(attributeName, isCurrentlyRefined ? off : on)
        );

        this.toggleRefinement = this.toggleRefinement.bind(this, helper);

        const isRefined = state.isDisjunctiveFacetRefined(attributeName, on);

        // no need to refine anything at init if no custom off values
        if (hasAnOffValue) {
          // Add filtering on the 'off' value if set
          if (!isRefined) {
            helper.addDisjunctiveFacetRefinement(attributeName, off);
          }
        }

        const onFacetValue = {
          name: label,
          isRefined,
          count: 0,
        };

        const offFacetValue = {
          name: label,
          isRefined: hasAnOffValue && !isRefined,
          count: 0,
        };

        const value = {
          name: label,
          isRefined,
          count: null,
          onFacetValue,
          offFacetValue,
        };

        renderFn({
          value,
          state: helper.state,
          createURL: this._createURL,
          refine: this.toggleRefinement,
          helper,
          isFirstSearch: true,
          instantSearchInstance,
        }, true);
      },

      render({helper, results, state}) {
        const isRefined = helper.state.isDisjunctiveFacetRefined(attributeName, on);
        const offValue = off === undefined ? false : off;
        const allFacetValues = results.getFacetValues(attributeName);

        const onData = allFacetValues.find(({name}) => name === unescapeRefinement(on));
        const onFacetValue = {
          name: label,
          isRefined: onData !== undefined ? onData.isRefined : false,
          count: onData === undefined ? null : onData.count,
        };

        const offData = hasAnOffValue
          ? allFacetValues.find(({name}) => name === unescapeRefinement(offValue))
          : undefined;
        const offFacetValue = {
          name: label,
          isRefined: offData !== undefined ? offData.isRefined : false,
          count: offData === undefined ? results.nbHits : offData.count,
        };

        // what will we show by default,
        // if checkbox is not checked, show: [ ] free shipping (countWhenChecked)
        // if checkbox is checked, show: [x] free shipping (countWhenNotChecked)
        const nextRefinement = isRefined ? offFacetValue : onFacetValue;

        const value = {
          name: label,
          isRefined,
          count: nextRefinement === undefined ? null : nextRefinement.count,
          onFacetValue,
          offFacetValue,
        };

        renderFn({
          value,
          state,
          createURL: this._createURL,
          refine: this.toggleRefinement,
          helper: this._helper,
          isFirstSearch: false,
          instantSearchInstance: this._instantSearchInstance,
        }, false);
      },
    };
  };
}
