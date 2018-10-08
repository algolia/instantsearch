export default {
  item: itemTemplate,
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
  const countValue = count === undefined ? 0 : count;
  const computedCount = query
    ? ''
    : `<span class="${cssClasses.count}">${countValue}</span>`;
  const computedExclude = exclude ? '-' : '';

  return `${computedLabel} ${computedExclude} ${name} ${computedCount}`;
}
