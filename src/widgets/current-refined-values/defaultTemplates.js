export default {
  header: '',
  item: itemTemplate,
  clearAll: 'Clear all',
  footer: '',
};

function itemTemplate({
  type,
  label,
  operator,
  displayOperator,
  exclude,
  name,
  count,
  cssClasses,
}) {
  const computedOperator = operator ? displayOperator : '';
  const computedLabel = label
    ? `${label} ${computedOperator || ':'} `
    : computedOperator;
  const countValue = count === undefined ? 0 : count;
  const computedCount =
    type === 'query'
      ? ''
      : `<span class="${cssClasses.count}">${countValue}</span>`;
  const computedExclude = exclude ? '-' : '';
  const computedName = type === 'query' ? `<q>${name}</q>` : name;
  return `${computedLabel} ${computedExclude} ${computedName} ${computedCount}`;
}
