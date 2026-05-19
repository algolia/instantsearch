function isIdentifier(node, name) {
  return node && node.type === 'Identifier' && node.name === name;
}

function isPropertyKeyNamed(node, name) {
  if (!node) {
    return false;
  }

  if (node.type === 'Identifier') {
    return node.name === name;
  }

  return node.type === 'Literal' && node.value === name;
}

function someDescendant(node, visitorKeys, predicate) {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (predicate(node)) {
    return true;
  }

  const keys = visitorKeys[node.type] || [];

  for (const key of keys) {
    const value = node[key];

    if (Array.isArray(value)) {
      for (const item of value) {
        if (someDescendant(item, visitorKeys, predicate)) {
          return true;
        }
      }
    } else if (someDescendant(value, visitorKeys, predicate)) {
      return true;
    }
  }

  return false;
}

function stripLeadingSigils(name) {
  return name.replace(/^[_$]+/, '');
}

function isCamelCase(name) {
  return /^[a-z][a-zA-Z0-9]*$/.test(name);
}

function isPascalCase(name) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

function isUpperCase(name) {
  return /^[A-Z][A-Z0-9_]*$/.test(name);
}

function isAllowedVariableName(name) {
  if (
    name.startsWith('EXPERIMENTAL_') ||
    name === '__DEV__' ||
    name === '__APP_INITIAL_STATE__' ||
    name === '__SERVER_STATE__' ||
    name === 'free_shipping'
  ) {
    return true;
  }

  const normalizedName = stripLeadingSigils(name);

  if (normalizedName === '') {
    return true;
  }

  return (
    isCamelCase(normalizedName) ||
    isPascalCase(normalizedName) ||
    isUpperCase(normalizedName)
  );
}

function isAllowedTypeParameterName(name) {
  return name === 'T' || name === 'K' || /^[TK][A-Z][a-zA-Z0-9]*$/.test(name);
}

function isAllowedInterfaceName(name) {
  return isPascalCase(name) && !/^I[A-Z]/.test(name);
}

const plugin = {
  meta: {
    name: 'instantsearch',
  },
  rules: {
    'naming-convention': {
      meta: {
        docs: {
          description:
            'Enforce the repo naming conventions for variables, interfaces, and type parameters.',
        },
        messages: {
          interface:
            'Interface names must be PascalCase and must not use an `I` prefix.',
          typeParameter:
            'Type parameter names must be `T`, `K`, or start with `T`/`K` followed by PascalCase.',
          variable:
            'Variable names must be camelCase, PascalCase, or UPPER_CASE. Leading underscores are allowed.',
        },
        schema: [],
        type: 'suggestion',
      },
      create(context) {
        return {
          TSInterfaceDeclaration(node) {
            if (!isAllowedInterfaceName(node.id.name)) {
              context.report({
                messageId: 'interface',
                node: node.id,
              });
            }
          },
          TSTypeParameter(node) {
            if (node.parent?.type === 'TSInferType') {
              return;
            }

            const name =
              typeof node.name === 'string' ? node.name : node.name?.name;

            if (!name || isAllowedTypeParameterName(name)) {
              return;
            }

            context.report({
              messageId: 'typeParameter',
              node,
            });
          },
          VariableDeclarator(node) {
            if (node.id.type !== 'Identifier') {
              return;
            }

            if (isAllowedVariableName(node.id.name)) {
              return;
            }

            context.report({
              messageId: 'variable',
              node: node.id,
            });
          },
        };
      },
    },
    'no-default-props-assignment': {
      meta: {
        docs: {
          description:
            'Disallow assigning to defaultProps and prefer function defaults.',
        },
        messages: {
          forbidden:
            'defaultProps are not allowed, use function defaults instead.',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        return {
          AssignmentExpression(node) {
            if (
              node.left.type === 'MemberExpression' &&
              !node.left.computed &&
              isIdentifier(node.left.property, 'defaultProps')
            ) {
              context.report({
                messageId: 'forbidden',
                node: node.left.property,
              });
            }
          },
        };
      },
    },
    'no-committed-run-test-suites-only': {
      meta: {
        docs: {
          description: 'Disallow committed runTestSuites({ only: ... }) calls.',
        },
        messages: {
          forbidden: 'Do not commit a restricted test',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        return {
          CallExpression(node) {
            if (!isIdentifier(node.callee, 'runTestSuites')) {
              return;
            }

            const firstArgument = node.arguments[0];

            if (!firstArgument || firstArgument.type !== 'ObjectExpression') {
              return;
            }

            for (const property of firstArgument.properties) {
              if (
                property.type === 'Property' &&
                isPropertyKeyNamed(property.key, 'only')
              ) {
                context.report({
                  messageId: 'forbidden',
                  node: property.key,
                });
              }
            }
          },
        };
      },
    },
    'no-async-functions': {
      meta: {
        docs: {
          description: 'Disallow async functions in package source files.',
        },
        messages: {
          forbidden:
            'The polyfill for async/await is very large, which is why we use promise chains',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        function reportIfAsync(node) {
          if (node.async) {
            context.report({
              messageId: 'forbidden',
              node,
            });
          }
        }

        return {
          ArrowFunctionExpression: reportIfAsync,
          FunctionDeclaration: reportIfAsync,
          FunctionExpression: reportIfAsync,
        };
      },
    },
    'no-for-in': {
      meta: {
        docs: {
          description: 'Disallow for..in loops in package source files.',
        },
        messages: {
          forbidden:
            'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        return {
          ForInStatement(node) {
            context.report({
              messageId: 'forbidden',
              node,
            });
          },
        };
      },
    },
    'no-for-of': {
      meta: {
        docs: {
          description: 'Disallow for..of loops in package source files.',
        },
        messages: {
          forbidden:
            'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        return {
          ForOfStatement(node) {
            context.report({
              messageId: 'forbidden',
              node,
            });
          },
        };
      },
    },
    'no-labels': {
      meta: {
        docs: {
          description: 'Disallow labeled statements in package source files.',
        },
        messages: {
          forbidden:
            'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        return {
          LabeledStatement(node) {
            context.report({
              messageId: 'forbidden',
              node,
            });
          },
        };
      },
    },
    'no-with': {
      meta: {
        docs: {
          description: 'Disallow with statements in package source files.',
        },
        messages: {
          forbidden:
            '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        return {
          WithStatement(node) {
            context.report({
              messageId: 'forbidden',
              node,
            });
          },
        };
      },
    },
    'require-get-render-state-return-type': {
      meta: {
        docs: {
          description:
            'Require an explicit return type for getRenderState when renderState is used inside a satisfies/as connector object.',
        },
        messages: {
          forbidden:
            'Connectors using `satisfies` that use `renderState` must explicitly annotate the return type of `getRenderState`.',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        const { sourceCode } = context;

        function hasRestrictedRenderStateUsage(functionExpression) {
          return someDescendant(
            functionExpression.body,
            sourceCode.visitorKeys,
            (node) => {
              if (
                node.type === 'MemberExpression' &&
                isIdentifier(node.object, 'renderState')
              ) {
                return true;
              }

              return (
                node.type === 'SpreadElement' &&
                isIdentifier(node.argument, 'renderState')
              );
            }
          );
        }

        return {
          Property(node) {
            if (
              !node.method ||
              !isPropertyKeyNamed(node.key, 'getRenderState') ||
              !node.value ||
              node.value.type !== 'FunctionExpression' ||
              node.value.returnType
            ) {
              return;
            }

            const objectExpression = node.parent;
            const wrapper = objectExpression && objectExpression.parent;

            if (
              !objectExpression ||
              objectExpression.type !== 'ObjectExpression' ||
              !wrapper ||
              (wrapper.type !== 'TSAsExpression' &&
                wrapper.type !== 'TSSatisfiesExpression')
            ) {
              return;
            }

            if (!hasRestrictedRenderStateUsage(node.value)) {
              return;
            }

            context.report({
              messageId: 'forbidden',
              node: node.value,
            });
          },
        };
      },
    },
    'no-unsafe-default-templates': {
      meta: {
        docs: {
          description:
            'Disallow JSON.stringify or raw object returns in default templates to prevent XSS.',
        },
        messages: {
          forbidden:
            'Do not use JSON.stringify() or raw objects in default templates. Wrap string output in a Fragment: `<Fragment>{dataString}</Fragment>`.',
        },
        schema: [],
        type: 'problem',
      },
      create(context) {
        function isInsideDefaultTemplatesObject(node) {
          let current = node;

          while (current) {
            if (
              current.type === 'ObjectExpression' &&
              current.parent?.type === 'VariableDeclarator' &&
              current.parent.id?.type === 'Identifier' &&
              current.parent.id.name === 'defaultTemplates'
            ) {
              return true;
            }

            current = current.parent;
          }

          return false;
        }

        return {
          ReturnStatement(node) {
            if (!node.argument) {
              return;
            }

            if (!isInsideDefaultTemplatesObject(node)) {
              return;
            }

            const arg = node.argument;

            // Allowed: JSX element or Fragment
            if (arg.type === 'JSXElement' || arg.type === 'JSXFragment') {
              return;
            }

            // Allowed: htm template literal
            if (arg.type === 'TaggedTemplateExpression') {
              if (
                arg.tag.type === 'Identifier' &&
                (arg.tag.name === 'html' || arg.tag.name === 'htm')
              ) {
                return;
              }
            }

            // Flag JSON.stringify - the key XSS vector
            if (arg.type === 'CallExpression') {
              if (
                arg.callee.type === 'MemberExpression' &&
                arg.callee.object.name === 'JSON' &&
                arg.callee.property.name === 'stringify'
              ) {
                context.report({
                  messageId: 'forbidden',
                  node,
                });
                return;
              }
            }
          },
        };
      },
    },
  },
};

export default plugin;
