import queryRuleContext from '../query-rule-context';

describe('queryRuleContext', () => {
  describe('Usage', () => {
    test('throws trackedFilters error without options', () => {
      expect(() => {
        // @ts-ignore
        queryRuleContext();
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`trackedFilters\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-context/js/"
`);
    });

    test('throws trackedFilters error with empty options', () => {
      expect(() => {
        // @ts-ignore
        queryRuleContext({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`trackedFilters\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-context/js/"
`);
    });
  });
});
