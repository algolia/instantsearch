/* eslint-disable no-shadow */

export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  const replaceImports = (from, to) => (root) =>
    root
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.source.value === from ||
          path.node.source.value.startsWith(`${from}/`)
      )
      .forEach((sourceImport) => {
        j(sourceImport).replaceWith(
          j.importDeclaration(
            sourceImport.node.specifiers,
            j.stringLiteral(sourceImport.value.source.value.replace(from, to))
          )
        );
      });

  const replaceHooks = replaceImports(
    'react-instantsearch-hooks',
    'react-instantsearch-core'
  );
  const replaceHooksWeb = replaceImports(
    'react-instantsearch-hooks-web',
    'react-instantsearch'
  );

  replaceHooks(root);
  replaceHooksWeb(root);

  return root.toSource(printOptions);
}
