import queryRuleContext from '../query-rule-context';

describe('queryRuleContext', () => {
  describe('Usage', () => {
    test('does not throw without options', () => {
      expect(() => {
        // @ts-ignore
        queryRuleContext();
      }).not.toThrow();
    });

    test('does not throw with empty options', () => {
      expect(() => {
        queryRuleContext({});
      }).not.toThrow();
    });
  });
});
