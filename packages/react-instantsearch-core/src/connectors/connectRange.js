import PropTypes from 'prop-types';

import createConnector from '../core/createConnector';
import {
  cleanUpValue,
  getIndexId,
  refineValue,
  getCurrentRefinementValue,
  getResults,
} from '../core/indexUtils';

/**
 * connectRange connector provides the logic to create connected
 * components that will give the ability for a user to refine results using
 * a numeric range.
 * @name connectRange
 * @kind connector
 * @requirements The attribute passed to the `attribute` prop must be present in “attributes for faceting”
 * on the Algolia dashboard or configured as `attributesForFaceting` via a set settings call to the Algolia API.
 * The values inside the attribute must be JavaScript numbers (not strings).
 * @propType {string} attribute - Name of the attribute for faceting
 * @propType {{min?: number, max?: number}} [defaultRefinement] - Default searchState of the widget containing the start and the end of the range.
 * @propType {number} [min] - Minimum value. When this isn't set, the minimum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} [max] - Maximum value. When this isn't set, the maximum value will be automatically computed by Algolia using the data in the index.
 * @propType {number} [precision=0] - Number of digits after decimal point to use.
 * @providedPropType {function} refine - a function to select a range.
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {string} currentRefinement - the refinement currently applied
 * @providedPropType {number} min - the minimum value available.
 * @providedPropType {number} max - the maximum value available.
 * @providedPropType {number} precision - Number of digits after decimal point to use.
 */

function getId(props) {
  return props.attribute;
}

const namespace = 'range';

function getCurrentRange(boundaries, stats, precision) {
  const pow = Math.pow(10, precision);

  let min;
  if (typeof boundaries.min === 'number' && isFinite(boundaries.min)) {
    min = boundaries.min;
  } else if (typeof stats.min === 'number' && isFinite(stats.min)) {
    min = stats.min;
  } else {
    min = undefined;
  }

  let max;
  if (typeof boundaries.max === 'number' && isFinite(boundaries.max)) {
    max = boundaries.max;
  } else if (typeof stats.max === 'number' && isFinite(stats.max)) {
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
  const { min, max } = getCurrentRefinementValue(
    props,
    searchState,
    context,
    `${namespace}.${getId(props)}`,
    {}
  );

  const isFloatPrecision = Boolean(props.precision);

  let nextMin = min;
  if (typeof nextMin === 'string') {
    nextMin = isFloatPrecision ? parseFloat(nextMin) : parseInt(nextMin, 10);
  }

  let nextMax = max;
  if (typeof nextMax === 'string') {
    nextMax = isFloatPrecision ? parseFloat(nextMax) : parseInt(nextMax, 10);
  }

  const refinement = {
    min: nextMin,
    max: nextMax,
  };

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

  const isNextMinValid = isMinReset || isFinite(nextMinAsNumber);
  const isNextMaxValid = isMaxReset || isFinite(nextMaxAsNumber);

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
  $$type: 'ais.range',

  propTypes: {
    id: PropTypes.string,
    attribute: PropTypes.string.isRequired,
    defaultRefinement: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    min: PropTypes.number,
    max: PropTypes.number,
    precision: PropTypes.number,
    header: PropTypes.node,
    footer: PropTypes.node,
  },

  defaultProps: {
    precision: 0,
  },

  getProvidedProps(props, searchState, searchResults) {
    const { attribute, precision, min: minBound, max: maxBound } = props;
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
    const hasFacet = results && results.getFacetByName(attribute);
    const stats = hasFacet ? results.getFacetStats(attribute) || {} : {};
    const facetValues = hasFacet ? results.getFacetValues(attribute) : [];

    const count = facetValues.map((v) => ({
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
    // the correct refinement. If this behavior change in the upcoming version
    // we could store the range inside the searchState instead of rely on `this`.
    this._currentRange = {
      min: rangeMin,
      max: rangeMax,
    };

    const currentRefinement = getCurrentRefinement(
      props,
      searchState,
      this._currentRange,
      { ais: props.contextValue, multiIndexContext: props.indexContextValue }
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
    return refine(props, searchState, nextRefinement, this._currentRange, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });
  },

  getSearchParameters(params, props, searchState) {
    const { attribute } = props;
    const { min, max } = getCurrentRefinement(
      props,
      searchState,
      this._currentRange,
      { ais: props.contextValue, multiIndexContext: props.indexContextValue }
    );

    params = params.addDisjunctiveFacet(attribute);

    if (min !== undefined) {
      params = params.addNumericRefinement(attribute, '>=', min);
    }

    if (max !== undefined) {
      params = params.addNumericRefinement(attribute, '<=', max);
    }

    return params;
  },

  getMetadata(props, searchState) {
    const { min: minRange, max: maxRange } = this._currentRange;
    const { min: minValue, max: maxValue } = getCurrentRefinement(
      props,
      searchState,
      this._currentRange,
      { ais: props.contextValue, multiIndexContext: props.indexContextValue }
    );

    const items = [];
    const hasMin = minValue !== undefined;
    const hasMax = maxValue !== undefined;
    const shouldDisplayMinLabel = hasMin && minValue !== minRange;
    const shouldDisplayMaxLabel = hasMax && maxValue !== maxRange;

    if (shouldDisplayMinLabel || shouldDisplayMaxLabel) {
      const fragments = [
        hasMin ? `${minValue} <= ` : '',
        props.attribute,
        hasMax ? ` <= ${maxValue}` : '',
      ];

      items.push({
        label: fragments.join(''),
        attribute: props.attribute,
        value: (nextState) =>
          refine(props, nextState, {}, this._currentRange, {
            ais: props.contextValue,
            multiIndexContext: props.indexContextValue,
          }),
        currentRefinement: getCurrentRefinementWithRange(
          { min: minValue, max: maxValue },
          { min: minRange, max: maxRange }
        ),
      });
    }

    return {
      id: getId(props),
      index: getIndexId({
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }),
      items,
    };
  },
});
