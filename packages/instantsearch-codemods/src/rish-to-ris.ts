import { replaceImports } from './replaceImports';

import type {
  API,
  FileInfo,
  Identifier,
  MemberExpression,
  ObjectProperty,
  Options,
} from 'jscodeshift';

export default function transformer(
  file: FileInfo,
  { jscodeshift: j }: API,
  options: Options
) {
  const source = j(file.source);
  const printOptions = options.printOptions || {
    quote: 'single',
  };

  const replaceUse = () => {
    // destructured
    source
      .find(j.VariableDeclarator, {
        id: {
          type: 'ObjectPattern',
          properties: [
            {
              key: {
                name: 'use',
              },
            },
          ],
        },
        init: {
          type: 'CallExpression',
          callee: {
            name: 'useInstantSearch',
          },
        },
      })
      .forEach((path) => {
        const useProperty =
          path.value.id.type === 'ObjectPattern' &&
          (path.value.id.properties.find((prop) => {
            return (
              prop.type === 'Property' &&
              prop.key.type === 'Identifier' &&
              prop.key.name === 'use'
            );
          }) as ObjectProperty);

        if (!useProperty) {
          return;
        }

        const originalKeyValue = (useProperty.value as Identifier).name;
        (useProperty.key as Identifier).name = 'addMiddlewares';

        // If the property is reassigned to another variable we don't have to transform it
        if (originalKeyValue !== 'use') {
          return;
        }

        useProperty.shorthand = false;
        (useProperty.value as Identifier).name = 'use';
      });

    // dot property
    source
      .find(j.VariableDeclarator, {
        init: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              name: 'useInstantSearch',
            },
          },
          property: {
            type: 'Identifier',
            name: 'use',
          },
        },
      })
      .forEach((path) => {
        ((path.value.init as MemberExpression).property as Identifier).name =
          'addMiddlewares';
      });
  };

  const addRenderToStringIfMissing = () => {
    const importDeclaration = source
      .find(j.ImportDeclaration)
      .filter(
        (path) => path.node.source.value === 'react-instantsearch-hooks-server'
      );

    const importSpecifier = importDeclaration
      .find(j.ImportSpecifier)
      .filter((path) => path.node.imported.name === 'getServerState');

    const callExpression = source.find(j.CallExpression, {
      callee: { name: 'getServerState' },
    });

    if (importSpecifier.size() === 0 || callExpression.length === 0) {
      return;
    }

    const hasRenderToString =
      source
        .find(j.ImportDeclaration)
        .filter((path) => path.node.source.value === 'react-dom/server')
        .find(j.ImportSpecifier)
        .filter((path) => path.node.imported.name === 'renderToString')
        .size() > 0;

    if (!hasRenderToString) {
      importDeclaration.insertAfter(
        j.importDeclaration(
          [j.importSpecifier(j.identifier('renderToString'))],
          j.literal('react-dom/server')
        )
      );
    }

    callExpression.forEach((path) => {
      if (
        path.value.arguments.length === 2 &&
        j(path)
          .find(j.Property, { key: { name: 'renderToString' } })
          .size()
      ) {
        return;
      }

      const expression = j.template.expression`{ renderToString }`;

      path.value.arguments.length === 2
        ? (path.value.arguments[1] = expression)
        : path.value.arguments.push(expression);
    });
  };

  addRenderToStringIfMissing();

  replaceImports(
    j,
    source,
    'react-instantsearch-hooks',
    'react-instantsearch-core'
  );
  replaceImports(
    j,
    source,
    'react-instantsearch-hooks-web',
    'react-instantsearch'
  );

  replaceImports(
    j,
    source,
    'react-instantsearch-hooks-router-nextjs',
    'react-instantsearch-router-nextjs'
  );

  replaceImports(
    j,
    source,
    'react-instantsearch-hooks-server',
    'react-instantsearch'
  );

  replaceUse();

  return source.toSource(printOptions);
}
