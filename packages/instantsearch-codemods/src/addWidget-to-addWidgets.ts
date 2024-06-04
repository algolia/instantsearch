/* eslint-disable no-shadow */

import type { FileInfo, API, Options, Collection } from 'jscodeshift';

export default function transform(
  file: FileInfo,
  { jscodeshift: j }: API,
  options: Options
) {
  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  // replace xxx[from](arguments) to xxx[to]([arguments])
  const replaceSingularToPlural =
    (from: string, to: string) => (root: Collection) =>
      root
        .find(j.CallExpression, {
          callee: { property: { name: from } },
        })
        .replaceWith((path) => {
          if (path.value.callee.type !== 'MemberExpression') {
            return path.value;
          }
          return j.callExpression(
            j.memberExpression(
              path.value.callee.object,
              j.identifier(to),
              false
            ),
            [j.arrayExpression(path.value.arguments)]
          );
        });

  const replaceAddWidget = replaceSingularToPlural('addWidget', 'addWidgets');
  const replaceRemoveWidget = replaceSingularToPlural(
    'removeWidget',
    'removeWidgets'
  );

  replaceAddWidget(root);
  replaceRemoveWidget(root);

  return root.toSource(printOptions);
}
