/* eslint-disable no-shadow */

export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  // replace xxx[from](arguments) to xxx[to]([arguments])
  const replaceSingularToPlural = (from, to) => (root) =>
    root
      .find(j.CallExpression, { callee: { property: { name: from } } })
      .replaceWith((path) =>
        j.callExpression(
          j.memberExpression(path.value.callee.object, j.identifier(to), false),
          [j.arrayExpression(path.value.arguments)]
        )
      );

  const replaceAddWidget = replaceSingularToPlural('addWidget', 'addWidgets');
  const replaceRemoveWidget = replaceSingularToPlural(
    'removeWidget',
    'removeWidgets'
  );

  replaceAddWidget(root);
  replaceRemoveWidget(root);

  return root.toSource(printOptions);
}
