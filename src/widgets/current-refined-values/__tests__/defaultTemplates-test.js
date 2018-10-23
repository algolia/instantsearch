import defaultTemplates from '../defaultTemplates.js';

describe('current-refined-values defaultTemplates', () => {
  describe('`item` template', () => {
    it('has a `item` default template', () => {
      const item = {
        type: 'disjunction',
        label: 'Brand',
        operator: ':',
        name: 'Samsung',
        count: 4,
        cssClasses: {
          count: 'ais-current-refined-values--count',
        },
      };
      expect(defaultTemplates.item(item)).toMatchSnapshot();
    });
    it('wraps query refinements with <q>', () => {
      const item = {
        type: 'query',
        label: 'Query',
        operator: ':',
        name: 'Samsu',
        cssClasses: {
          count: 'ais-current-refined-values--count',
        },
      };
      expect(defaultTemplates.item(item)).toMatchSnapshot();
    });
    it('does not show `count` when query refinement', () => {
      const item = {
        type: 'query',
        label: 'Query',
        operator: ':',
        name: 'Samsu',
        count: 22, // should be ignored
        cssClasses: {
          count: 'ais-current-refined-values--count',
        },
      };
      expect(defaultTemplates.item(item)).toMatchSnapshot();
    });
  });
});
