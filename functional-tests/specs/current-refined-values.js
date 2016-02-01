import expect from 'expect';
import {getCurrentRefinements} from '../utils.js';

describe('currentRefinedValues', () => {
  const firstRefinement = '#hierarchical-categories .item:nth-child(6)';
  const secondRefinement = '#brands .item:nth-child(8)';

  it('is empty', () => getCurrentRefinements()
    .then(refinements => expect(refinements.length).toBe(0))
  );

  context('when we have some refinements', () => {
    beforeEach(() => browser.click(firstRefinement).pause(500).click(secondRefinement).pause(500));

    it('shows refinements', () =>
      getCurrentRefinements().then(refinements => expect(refinements.length).toBe(2))
    );

    it('has a "Clear all" button', () =>
      browser
        .click('#current-refined-values .clear-all')
        .then(getCurrentRefinements)
        .then(refinements => expect(refinements.length).toBe(0))
    );
  });
});
