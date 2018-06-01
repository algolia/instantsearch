const NAMESPACE = 'ais';

export const component = componentName => ({
  modifierName,
  descendantName,
} = {}) => {
  const d = descendantName ? `-${descendantName}` : '';
  const m = modifierName ? `--${modifierName}` : '';
  return `${NAMESPACE}-${componentName}${d}${m}`;
};
