const NAMESPACE = 'ais';

type SuitOptions = {
  descendantName?: string;
  modifierName?: string;
};

type SuitSelector = (names?: SuitOptions) => string;

export const component = (componentName: string): SuitSelector => ({
  descendantName,
  modifierName,
}: SuitOptions = {}) => {
  const descendent = descendantName ? `-${descendantName}` : '';
  const modifier = modifierName ? `--${modifierName}` : '';

  return `${NAMESPACE}-${componentName}${descendent}${modifier}`;
};
