import type { API, FileInfo, Options } from 'jscodeshift';

export default function transformer(
  file: FileInfo,
  { jscodeshift: j }: API,
  options: Options
) {
  const source = j(file.source);
  const printOptions = options.printOptions || {
    quote: 'single',
  };

  const replaceImports = (from: string, to: string) =>
    source
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.source.value === from ||
          (typeof path.node.source.value === 'string' &&
            path.node.source.value.startsWith(`${from}/`))
      )
      .forEach((sourceImport) => {
        const value = sourceImport.value.source.value as string;
        j(sourceImport).replaceWith(
          j.importDeclaration(
            sourceImport.node.specifiers,
            j.stringLiteral(value.replace(from, to))
          )
        );
      });

  replaceImports('react-instantsearch-hooks', 'react-instantsearch-core');
  replaceImports('react-instantsearch-hooks-web', 'react-instantsearch');

  return source.toSource(printOptions);
}
