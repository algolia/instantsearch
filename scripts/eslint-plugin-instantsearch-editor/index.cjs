module.exports = {
  rules: {
    'prefer-prettier-ignore-comment': {
      meta: {
        type: 'problem',
        fixable: 'code',
        docs: {
          description:
            'Use `// prettier-ignore` instead of `eslint-disable prettier/prettier`.',
        },
        schema: [],
        messages: {
          forbidden:
            "`eslint-disable prettier/prettier` only silences the editor rule; CI's standalone `prettier --check` does not honor it. Use `// prettier-ignore` on the line above instead.",
        },
      },
      create(context) {
        const triggerPattern = /eslint-disable[^\n]*\bprettier\/prettier\b/;
        // Auto-fix only when `prettier/prettier` is the sole rule in an
        // `eslint-disable-next-line` directive. Compound or block-scope
        // disables carry extra semantics; leave those to manual fixes.
        const soleNextLinePattern =
          /^\s*eslint-disable-next-line\s+prettier\/prettier\s*$/;
        const source = context.getSourceCode();

        return {
          Program() {
            for (const comment of source.getAllComments()) {
              if (!triggerPattern.test(comment.value)) continue;

              const canFix = soleNextLinePattern.test(comment.value);

              context.report({
                node: comment,
                messageId: 'forbidden',
                fix: canFix
                  ? (fixer) => {
                      const replacement =
                        comment.type === 'Block'
                          ? '/* prettier-ignore */'
                          : '// prettier-ignore';
                      return fixer.replaceTextRange(comment.range, replacement);
                    }
                  : null,
              });
            }
          },
        };
      },
    },
  },
};
