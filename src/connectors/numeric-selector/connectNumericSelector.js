const connectNumericSelector = numericSelectorRendering => ({
    operator = '=',
    attributeName,
    options,
  }) => ({
    getConfiguration(currentSearchParameters, searchParametersFromUrl) {
      return {
        numericRefinements: {
          [attributeName]: {
            [operator]: [this._getRefinedValue(searchParametersFromUrl)],
          },
        },
      };
    },
    init({helper, instantSearchInstance}) {
      this._refine = value => {
        helper.clearRefinements(attributeName);
        if (value !== undefined) {
          helper.addNumericRefinement(attributeName, operator, value);
        }
        helper.search();
      };

      numericSelectorRendering({
        currentValue: this._getRefinedValue(helper.state),
        options,
        setValue: this._refine,
        noResults: true,
        instantSearchInstance,
      }, true);
    },

    render({helper, results, instantSearchInstance}) {
      const noResults = results.nbHits === 0;
      numericSelectorRendering({
        currentValue: this._getRefinedValue(helper.state),
        options,
        setValue: this._refine,
        noResults,
        instantSearchInstance,
      }, false);
    },

    _getRefinedValue(state) {
      // This is reimplementing state.getNumericRefinement
      // But searchParametersFromUrl is not an actual SearchParameters object
      // It's only the object structure without the methods, because getStateFromQueryString
      // is not sending a SearchParameters. There's no way given how we built the helper
      // to initialize a true partial state where only the refinements are present
      return state &&
        state.numericRefinements &&
        state.numericRefinements[attributeName] !== undefined &&
        state.numericRefinements[attributeName][operator] !== undefined &&
        state.numericRefinements[attributeName][operator][0] !== undefined ? // could be 0
        state.numericRefinements[attributeName][operator][0] :
        options[0].value;
    },
  });

export default connectNumericSelector;
