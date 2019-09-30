/**
 * Babel plugin that wraps `warning` calls with development check to be
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
 *   if (!condition) {
 *     warning(false, message);
 *   }
 * }
 * ```
 */

function wrapWarningInDevCheck(babel) {
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

          if (path.get('callee').isIdentifier({ name: 'warning' })) {
            const [condition, message] = node.arguments;
            const newNode = t.callExpression(
              node.callee,
              [t.booleanLiteral(false)].concat(message)
            );

            newNode[SEEN_SYMBOL] = true;

            path.replaceWith(
              t.ifStatement(
                DEV_EXPRESSION,
                t.blockStatement([
                  t.ifStatement(
                    t.unaryExpression('!', condition),
                    t.expressionStatement(newNode)
                  ),
                ])
              )
            );
          }
        },
      },
    },
  };
}

export default wrapWarningInDevCheck;
