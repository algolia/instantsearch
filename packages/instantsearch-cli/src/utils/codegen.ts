const IDENTIFIER = /^[$A-Z_a-z][$\w]*$/;

export function jsString(value: string): string {
  return JSON.stringify(value);
}

export function propertyAccess(
  objectExpression: string,
  property: string
): string {
  return IDENTIFIER.test(property)
    ? `${objectExpression}.${property}`
    : `${objectExpression}[${jsString(property)}]`;
}

export function propertyKey(property: string): string {
  return IDENTIFIER.test(property) ? property : jsString(property);
}
