/* eslint-disable no-console */
/* eslint-disable no-shadow */

export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  // replace xxx[from](arguments) to xxx[to]([arguments])
  const replaceSingularToPlural = (from, to) => root =>
    root
      .find(j.CallExpression, { callee: { property: { name: from } } })
      .forEach(path => {
        j(path).replaceWith(
          j.callExpression(
            j.memberExpression(
              path.value.callee.object,
              j.identifier(to),
              false
            ),
            [j.arrayExpression(path.value.arguments)]
          )
        );
      });

  const replaceAddWidget = replaceSingularToPlural('addWidget', 'addWidgets');
  const replaceRemoveWidget = replaceSingularToPlural(
    'removeWidget',
    'removeWidgets'
  );

  return replaceRemoveWidget(replaceAddWidget(root)).toSource(printOptions);
}

export const parser = 'ts';
