import PropTypes from 'prop-types';
import { isFinite as _isFinite } from 'lodash';
import {
  cleanUpValue,
  getIndex,
  refineValue,
  getCurrentRefinementValue,
  getResults,
} from '../core/indexUtils';

import createConnector from '../core/createConnector';

/**
 * connectRange connector provides the logic to create connected
 * components that will give the ability for a user to refine results using
 * a numeric range.
 * @name connectRange
 * @kind connector
 * @requirements The attribute passed to the `attributeName` prop must be holding numerical values.
 * @propType {string} attributeName - Name of the attribute for faceting
 * @propType {{min: number, max: number}} [defaultRefinement] - Default searchState of the widget containing the start and the end of the range.
 * @propType {number} [min] - Minimum value. When this isn't set, the minimum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} [max] - Maximum value. When this isn't set, the maximum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} [precision=2] - Number of digits after decimal point to use.
 * @providedPropType {function} refine - a function to select a range.
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 * @providedPropType {number} min - the minimum value available.
 * @providedPropType {number} max - the maximum value available.
 * @providedPropType {number} precision - Number of digits after decimal point to use.
 */

function getId(props) {
  return props.attributeName;
}

const namespace = 'range';

function getCurrentRange(boundaries, stats, precision) {
  const pow = Math.pow(10, precision);

  let min;
  if (_isFinite(boundaries.min)) {
    min = boundaries.min;
  } else if (_isFinite(stats.min)) {
    min = stats.min;
  } else {
    min = undefined;
  }

  let max;
  if (_isFinite(boundaries.max)) {
    max = boundaries.max;
  } else if (_isFinite(stats.max)) {
    max = stats.max;
  } else {
    max = undefined;
  }

  return {
    min: min !== undefined ? Math.floor(min * pow) / pow : min,
    max: max !== undefined ? Math.ceil(max * pow) / pow : max,
  };
}

function getCurrentRefinement(props, searchState, currentRange, context) {
  const refinement = getCurrentRefinementValue(
    props,
    searchState,
    context,
    `${namespace}.${getId(props)}`,
    {},
    currentRefinement => {
      let { min, max } = currentRefinement;
      if (typeof min === 'string') {
        min = parseInt(min, 10);
      }
      if (typeof max === 'string') {
        max = parseInt(max, 10);
      }
      return { min, max };
    }
  );

  const hasMinBound = props.min !== undefined;
  const hasMaxBound = props.max !== undefined;

  const hasMinRefinment = refinement.min !== undefined;
  const hasMaxRefinment = refinement.max !== undefined;

  if (hasMinBound && hasMinRefinment && refinement.min < currentRange.min) {
    throw Error("You can't provide min value lower than range.");
  }

  if (hasMaxBound && hasMaxRefinment && refinement.max > currentRange.max) {
    throw Error("You can't provide max value greater than range.");
  }

  if (hasMinBound && !hasMinRefinment) {
    refinement.min = currentRange.min;
  }

  if (hasMaxBound && !hasMaxRefinment) {
    refinement.max = currentRange.max;
  }

  return refinement;
}

function getCurrentRefinementWithRange(refinement, range) {
  return {
    min: refinement.min !== undefined ? refinement.min : range.min,
    max: refinement.max !== undefined ? refinement.max : range.max,
  };
}

function nextValueForRefinement(hasBound, isReset, range, value) {
  let next;
  if (!hasBound && range === value) {
    next = undefined;
  } else if (hasBound && isReset) {
    next = range;
  } else {
    next = value;
  }

  return next;
}

function refine(props, searchState, nextRefinement, currentRange, context) {
  const { min: nextMin, max: nextMax } = nextRefinement;
  const { min: currentMinRange, max: currentMaxRange } = currentRange;

  const isMinReset = nextMin === undefined || nextMin === '';
  const isMaxReset = nextMax === undefined || nextMax === '';

  const nextMinAsNumber = !isMinReset ? parseFloat(nextMin) : undefined;
  const nextMaxAsNumber = !isMaxReset ? parseFloat(nextMax) : undefined;

  const isNextMinValid = isMinReset || _isFinite(nextMinAsNumber);
  const isNextMaxValid = isMaxReset || _isFinite(nextMaxAsNumber);

  if (!isNextMinValid || !isNextMaxValid) {
    throw Error("You can't provide non finite values to the range connector.");
  }

  if (nextMinAsNumber < currentMinRange) {
    throw Error("You can't provide min value lower than range.");
  }

  if (nextMaxAsNumber > currentMaxRange) {
    throw Error("You can't provide max value greater than range.");
  }

  const id = getId(props);
  const resetPage = true;
  const nextValue = {
    [id]: {
      min: nextValueForRefinement(
        props.min !== undefined,
        isMinReset,
        currentMinRange,
        nextMinAsNumber
      ),
      max: nextValueForRefinement(
        props.max !== undefined,
        isMaxReset,
        currentMaxRange,
        nextMaxAsNumber
      ),
    },
  };

  return refineValue(searchState, nextValue, context, resetPage, namespace);
}

function cleanUp(props, searchState, context) {
  return cleanUpValue(searchState, context, `${namespace}.${getId(props)}`);
}

export default createConnector({
  displayName: 'AlgoliaRange',

  propTypes: {
    id: PropTypes.string,
    attributeName: PropTypes.string.isRequired,
    defaultRefinement: PropTypes.shape({
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
    }),
    min: PropTypes.number,
    max: PropTypes.number,
    precision: PropTypes.number,
  },

  defaultProps: {
    precision: 2,
  },

  getProvidedProps(props, searchState, searchResults) {
    const { attributeName, precision, min: minBound, max: maxBound } = props;
    const results = getResults(searchResults, this.context);
    const hasFacet = results && results.getFacetByName(attributeName);
    const stats = hasFacet ? results.getFacetStats(attributeName) || {} : {};
    const facetValues = hasFacet ? results.getFacetValues(attributeName) : [];

    const count = facetValues.map(v => ({
      value: v.name,
      count: v.count,
    }));

    const { min: rangeMin, max: rangeMax } = getCurrentRange(
      { min: minBound, max: maxBound },
      stats,
      precision
    );

    // The searchState is not always in sync with the helper state. For example
    // when we set boundaries on the first render the searchState don't have
    // the correct refinement. If this behaviour change in the upcoming version
    // we could store the range inside the searchState instead of rely on `this`.
    this._currentRange = {
      min: rangeMin,
      max: rangeMax,
    };

    const currentRefinement = getCurrentRefinement(
      props,
      searchState,
      this._currentRange,
      this.context
    );

    return {
      min: rangeMin,
      max: rangeMax,
      canRefine: count.length > 0,
      currentRefinement: getCurrentRefinementWithRange(
        currentRefinement,
        this._currentRange
      ),
      count,
      precision,
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(
      props,
      searchState,
      nextRefinement,
      this._currentRange,
      this.context
    );
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, this.context);
  },

  getSearchParameters(params, props, searchState) {
    const { attributeName } = props;
    const { min, max } = getCurrentRefinement(
      props,
      searchState,
      this._currentRange,
      this.context
    );

    params = params.addDisjunctiveFacet(attributeName);

    if (min !== undefined) {
      params = params.addNumericRefinement(attributeName, '>=', min);
    }

    if (max !== undefined) {
      params = params.addNumericRefinement(attributeName, '<=', max);
    }

    return params;
  },

  getMetadata(props, searchState) {
    const { min: minRange, max: maxRange } = this._currentRange;
    const { min: minValue, max: maxValue } = getCurrentRefinement(
      props,
      searchState,
      this._currentRange,
      this.context
    );

    const items = [];
    const hasMin = minValue !== undefined;
    const hasMax = maxValue !== undefined;
    const shouldDisplayMinLabel = hasMin && minValue !== minRange;
    const shouldDisplayMaxLabel = hasMax && maxValue !== maxRange;

    if (shouldDisplayMinLabel || shouldDisplayMaxLabel) {
      const fragments = [
        hasMin ? `${minValue} <= ` : '',
        props.attributeName,
        hasMax ? ` <= ${maxValue}` : '',
      ];

      items.push({
        label: fragments.join(''),
        attributeName: props.attributeName,
        value: nextState =>
          refine(props, nextState, {}, this._currentRange, this.context),
        currentRefinement: getCurrentRefinementWithRange(
          { min: minValue, max: maxValue },
          { min: minRange, max: maxRange }
        ),
      });
    }

    return {
      id: getId(props),
      index: getIndex(this.context),
      items,
    };
  },
});
