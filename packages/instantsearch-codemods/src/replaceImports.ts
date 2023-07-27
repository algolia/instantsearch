import type { Collection, JSCodeshift } from 'jscodeshift';

export const replaceImports = (
  j: JSCodeshift,
  source: Collection,
  from: string,
  to: string
) =>
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
