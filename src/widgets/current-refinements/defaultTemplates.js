export default {
  // item: itemTemplate,
  item: '<span class="{{cssClasses.categoryLabel}}">{{computedLabel}}</span>',
};

// function itemTemplate({
//   label,
//   operator,
//   displayOperator,
//   exclude,
//   name,
//   cssClasses,
//   query,
// }) {
//   const computedOperator = operator ? displayOperator : '';
//   const computedLabel = label
//     ? `${label} ${computedOperator || ':'} `
//     : computedOperator;
//   const computedExclude = exclude ? '-' : '';

//   return `${computedLabel} ${computedExclude} ${name}`;
// }
