import { Conditions, matchConditions } from '../match-filters';

describe('matchConditions', () => {
  describe('facetFilters', () => {
    test.each([
      {
        title: 'a single facet filter',
        target: { objectID: '1', color: 'red' },
        conditions: { facetFilters: ['color:red'] } as Conditions,
        expected: true,
      },
      {
        title: 'a single facet filter with different casing',
        target: { objectID: '1', color: 'RED' },
        conditions: { facetFilters: ['color:red'] } as Conditions,
        expected: true,
      },
      {
        title: 'a single facet filter with different accent',
        target: { objectID: '1', color: 'Am\u00e9lie' },
        conditions: { facetFilters: ['color:Am\u0065\u0301lie'] } as Conditions,
        expected: true,
      },
      {
        title: 'a single facet filter with a negation',
        target: { objectID: '1', color: 'red' },
        conditions: { facetFilters: ['color:-red'] } as Conditions,
        expected: false,
      },
      {
        title: 'a single facet filter with an escaped negation',
        target: { objectID: '1', color: '-red' },
        conditions: { facetFilters: ['color:\\-red'] } as Conditions,
        expected: true,
      },
      {
        title: 'multiple filters',
        target: { objectID: '1', color: 'red', size: 'm' },
        conditions: { facetFilters: ['color:red', 'size:m'] } as Conditions,
        expected: true,
      },
      {
        title: 'disjunctive filters (all match)',
        target: { objectID: '1', color: 'red', size: 'm' },
        conditions: { facetFilters: [['color:red', 'size:m']] } as Conditions,
        expected: true,
      },
      {
        title: 'disjunctive filters (one matches)',
        target: { objectID: '1', color: 'red', size: 's' },
        conditions: { facetFilters: [['color:red', 'size:m']] } as Conditions,
        expected: true,
      },
      {
        title: 'disjunctive filters (none match)',
        target: { objectID: '1', color: 'blue', size: 's' },
        conditions: { facetFilters: [['color:red', 'size:m']] } as Conditions,
        expected: false,
      },
      {
        title: 'disjunctive filters (negated)',
        target: { objectID: '1', color: 'red', size: 'm' },
        conditions: { facetFilters: [['color:red', '-size:m']] } as Conditions,
        expected: true,
      },
      {
        title: 'numeric filters',
        target: { objectID: '1', price: 42 },
        conditions: { facetFilters: ['price:42'] } as Conditions,
        expected: true,
      },
      {
        title: 'numeric filters with negation',
        target: { objectID: '1', price: 42 },
        conditions: { facetFilters: ['price:-42'] } as Conditions,
        expected: false,
      },
      {
        title: 'numeric filters with negation (different value)',
        target: { objectID: '1', price: 42 },
        conditions: { facetFilters: ['price:-43'] } as Conditions,
        expected: true,
      },
      {
        title: 'numeric filters with negation (multiple conditions)',
        target: { objectID: '1', price: 43 },
        conditions: { facetFilters: ['price:-42', 'price:43'] } as Conditions,
        expected: true,
      },
    ])('returns $expected with $title', ({ target, conditions, expected }) => {
      expect(matchConditions(target, conditions)).toBe(expected);
    });
  });
});
