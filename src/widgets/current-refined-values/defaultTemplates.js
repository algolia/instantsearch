export default {
  header: '',
  item: itemTemplate,
  clearAll: 'Clear all',
  footer: '',
};

function itemTemplate({
  label,
  operator,
  displayOperator,
  exclude,
  name,
  count,
  cssClasses,
  query,
}) {
  const computedOperator = operator ? displayOperator : '';
  const computedLabel = label
    ? `${label} ${computedOperator || ':'} `
    : computedOperator;
  const computedCount = query
    ? ''
    : `<span class="${cssClasses.count}">${count === undefined
        ? 0
        : count}</span>`;
  const computedExclude = exclude ? '-' : '';
  return `${computedLabel} ${computedExclude} ${name} ${computedCount}`;
}
