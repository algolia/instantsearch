const NAMESPACE = 'ais';

export const component = (componentName: string) => ({
  descendantName,
  modifierName,
}: {
  descendantName?: string;
  modifierName?: string;
} = {}) => {
  const descendent = descendantName ? `-${descendantName}` : '';
  const modifier = modifierName ? `--${modifierName}` : '';

  return `${NAMESPACE}-${componentName}${descendent}${modifier}`;
};
