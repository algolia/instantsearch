type attribute = string;
type value = string | number | boolean;
type filter = `${attribute}:${value}`;

export type Conditions = {
  /**
   * List of filters to match. Conditions are combined with AND.
   * If you want to combine filters with OR, you can use an array of filters as an item.
   */
  facetFilters?: Array<filter | filter[]>;
  filters?: string;
};

type Value = string | number | boolean | undefined;

type AlgoliaRecord = {
  objectID: string;
  [key: string]: Value | Value[] | Record<string, Value>;
};

export function matchConditions(
  target: AlgoliaRecord,
  conditions: Conditions
): boolean {
  return (
    matchFacetFilters(target, conditions.facetFilters) &&
    matchFilters(target, conditions.filters)
  );
}

function matchFacetFilters(
  target: AlgoliaRecord,
  facetFilters: Conditions['facetFilters']
): boolean {
  if (!facetFilters) return true;
  return facetFilters.every((condition) =>
    Array.isArray(condition)
      ? condition.some((c) => matchCondition(target, c))
      : matchCondition(target, condition)
  );
}

function matchFilters(
  target: AlgoliaRecord,
  filters: Conditions['filters']
): boolean {
  if (!filters) return true;
  // TODO: implement the filter matching logic
  return true;
}

function matchCondition(target: AlgoliaRecord, condition: filter): boolean {
  const { attribute, value, negated } = splitFilter(condition);
  const targetValue = get(target, attribute);
  if (Array.isArray(targetValue)) {
    return targetValue.some((v) => equals(v, value, negated));
  }
  return equals(targetValue, value, negated);
}

/**
 * Compare two values and return whether they are equal. If the condition is negated, the result is inverted.
 */
function equals(a: Value | undefined, b: Value, negated: boolean): boolean {
  return negated ? a !== b : a === b;
}

function get(target: AlgoliaRecord, attribute: attribute): Value | undefined {
  const path = attribute.split(/(?<!\\)\./);
  // @ts-expect-error - too JavaScripty
  const value = path.reduce((current, key) => current && current[key], target);
  return normalize(value);
}

function splitFilter(filter: filter): {
  attribute: attribute;
  value: Value;
  negated: boolean;
} {
  const [attribute, value] = filter.split(/(?<!\\):/) as [attribute, string];
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

function normalize(value: Value): Value {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value))) return Number(value);
  if (typeof value === 'string')
    return removeLeadingEscape(value.toLocaleLowerCase().normalize('NFC'));
  return value;
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
