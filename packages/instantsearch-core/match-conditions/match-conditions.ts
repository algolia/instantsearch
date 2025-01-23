export function matchConditions(
  target: AlgoliaRecord,
  conditions: Conditions
): boolean {
  return (
    matchFacetFilters(target, conditions.facetFilters) &&
    matchNumericFilters(target, conditions.numericFilters)
  );
}

//#region facetFilters

export function matchFacetFilters(
  target: AlgoliaRecord,
  facetFilters: Conditions['facetFilters']
): boolean {
  if (!facetFilters) return true;
  return facetFilters.every((condition) =>
    Array.isArray(condition)
      ? condition.some((c) => matchFilter(target, c))
      : matchFilter(target, condition)
  );
}

function matchFilter(target: AlgoliaRecord, condition: filter): boolean {
  const { attribute, value, negated } = splitFilter(condition);
  const targetValue = get(target, attribute);
  if (Array.isArray(targetValue)) {
    return targetValue.some((v) => equals(v, value, negated));
  }
  return equals(targetValue, value, negated);
}

function splitFilter(filter: filter): {
  attribute: attribute;
  value: Value;
  negated: boolean;
} {
  const [attribute, value] = split(filter, ':') as [attribute, string];
  const negated = value[0] === '-';
  const normalizedValue = normalize(value);
  const removedNegation = negated
    ? removeNegation(normalizedValue)
    : normalizedValue;
  return {
    attribute,
    value: removedNegation,
    negated,
  };
}

//#endregion
//#region numericFilters

function matchNumericFilters(
  target: AlgoliaRecord,
  numericFilters: Conditions['numericFilters']
): boolean {
  if (!numericFilters) return true;
  return numericFilters.every((condition) =>
    Array.isArray(condition)
      ? condition.some((c) => matchNumericFilter(target, c))
      : matchNumericFilter(target, condition)
  );
}

function matchNumericFilter(
  target: AlgoliaRecord,
  condition: numericFilter
): boolean {
  const conditions = splitNumericFilter(condition);

  return conditions.every(({ attribute, operator, value }) => {
    const targetValue = get(target, attribute);
    if (Array.isArray(targetValue)) {
      return targetValue.some((v) => compareNumeric(v, operator, value));
    }
    return compareNumeric(targetValue, operator, value);
  });
}

function splitNumericFilter(
  condition: numericFilter
): Array<{ attribute: string; operator: numericOperator; value: number }> {
  if (condition.match(/(?<!\\):/)) {
    const [attribute, range] = split(condition, ':') as [attribute, string];
    const [min, max] = range.split('TO');
    return [
      {
        attribute,
        operator: '>=',
        value: normalize(min) as number,
      },
      {
        attribute,
        operator: '<=',
        value: normalize(max) as number,
      },
    ];
  }
  const [attribute, operator, value] = split(condition, '(<=|>=|=|<|>)');
  return [
    {
      attribute,
      operator: operator as numericOperator,
      value: normalize(value) as number,
    },
  ];
}

function compareNumeric(
  a: Value | undefined,
  operator: numericOperator,
  b: number
): boolean {
  if (typeof a !== 'number') return false;
  switch (operator) {
    case '<': {
      return a < b;
    }
    case '<=': {
      return a <= b;
    }
    case '=': {
      return a === b;
    }
    case '>=': {
      return a >= b;
    }
    case '>': {
      return a > b;
    }
  }
}

//#endregion
//#region helpers

/**
 * Compare two values and return whether they are equal. If the condition is negated, the result is inverted.
 */
function equals(a: Value | undefined, b: Value, negated: boolean): boolean {
  return negated ? a !== b : a === b;
}

function get(target: AlgoliaRecord, attribute: attribute): Value | undefined {
  const path = split(attribute, '\\.');
  // @ts-expect-error - too JavaScripty
  const value = path.reduce((current, key) => current && current[key], target);
  return normalize(value);
}

function normalize(value: Value): Value {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value))) return Number(value);
  if (typeof value === 'string')
    return removeLeadingEscape(normalizeString(value));
  return value;
}

function normalizeString(value: string): string {
  return value.toLocaleLowerCase().normalize('NFC');
}

function removeLeadingEscape(value: string | `\\${string}`): string {
  return value[0] === '\\' ? value.slice(1) : value;
}

function removeNegation(value: Value): Value {
  switch (typeof value) {
    case 'string': {
      return value[0] === '-' ? value.slice(1) : value;
    }
    case 'number': {
      return -value;
    }
    default: {
      return !value;
    }
  }
}

/**
 * Split a string by a separator, unless it is escaped.
 */
function split(value: string, separator: string): string[] {
  return value.split(new RegExp(`(?<!\\\\)${separator}`));
}

//#endregion
//#region types

type attribute = string;
type value = string | number | boolean;
type filter = `${attribute}:${value}`;
type numericOperator = '<' | '<=' | '=' | '>=' | '>';
type numericFilter =
  | `${attribute}:${number} TO ${number}`
  | `${attribute}${numericOperator}${number}`;

export type Conditions = {
  /**
   * List of filters to match. Conditions are combined with AND.
   * If you want to combine filters with OR, you can use an array of filters as an item.
   */
  facetFilters?: Array<filter | filter[]>;
  /**
   * List of numeric filters to match. Conditions are combined with AND.
   * If you want to combine filters with OR, you can use an array of filters as an item.
   */
  numericFilters?: Array<numericFilter | numericFilter[]>;
};

type Value = string | number | boolean | undefined;

type AlgoliaRecord = {
  objectID: string;
  [key: string]: Value | Value[] | Record<string, Value>;
};

//#endregion
