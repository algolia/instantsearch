type ClassName = {
  descendantName?: string;
  modifierName?: string;
};

const NAMESPACE = 'ais';

export const component = (componentName: string) => ({
  descendantName,
  modifierName,
}: ClassName = {}) => {
  const descendant = descendantName ? `-${descendantName}` : '';
  const modifier = modifierName ? `--${modifierName}` : '';

  return `${NAMESPACE}-${componentName}${descendant}${modifier}`;
};
