type FacetValue = string | number | boolean | undefined;

export function unescapeFacetValue<TFacetValue extends FacetValue>(
  value: TFacetValue
): TFacetValue {
  if (typeof value === 'string') {
    return value.replace(/^\\-/, '-') as TFacetValue;
  }

  return value;
}

export function escapeFacetValue<TFacetValue extends FacetValue>(
  value: TFacetValue
): TFacetValue {
  if ((typeof value === 'number' && value < 0) || typeof value === 'string') {
    return String(value).replace(/^-/, '\\-') as TFacetValue;
  }

  return value;
}
