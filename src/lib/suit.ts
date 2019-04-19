const NAMESPACE = 'ais';

interface SuitNames {
  descendantName?: string;
  modifierName?: string;
}

type SuitSelector = (names?: SuitNames) => string;

export const component = (componentName: string): SuitSelector => ({
  descendantName,
  modifierName,
}: SuitNames = {}) => {
  const descendent = descendantName ? `-${descendantName}` : '';
  const modifier = modifierName ? `--${modifierName}` : '';

  return `${NAMESPACE}-${componentName}${descendent}${modifier}`;
};
