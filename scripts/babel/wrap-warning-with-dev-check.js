const IDENTIFIER_NAME = ['warn', 'warning'];

/**
 * Babel plugin that wraps `warn` calls with development check to be
 * completely stripped from the production bundle.
 *
 * In the development bundle, warnings get wrapped with their condition
 * and their condition becomes false to trigger them without evaluating twice.
 *
 * Input:
 *
 * ```
 * warning(condition, message);
 * ```
 *
 * Output:
 *
 * ```
 * if (__DEV__) {
 *   warning(condition, message);
 * }
 * ```
 */

function wrapWarningWithDevCheck(babel) {
  const t = babel.types;

  const DEV_EXPRESSION = t.identifier('__DEV__');
  const SEEN_SYMBOL = Symbol('expression.seen');

  return {
    visitor: {
      CallExpression: {
        exit(path) {
          const node = path.node;

          if (node[SEEN_SYMBOL]) {
            return;
          }

          if (
            IDENTIFIER_NAME.some((name) =>
              path.get('callee').isIdentifier({ name })
            )
          ) {
            node[SEEN_SYMBOL] = true;

            path.replaceWith(
              t.ifStatement(
                DEV_EXPRESSION,
                t.blockStatement([t.expressionStatement(node)])
              )
            );
          }
        },
      },
    },
  };
}

module.exports = wrapWarningWithDevCheck;
