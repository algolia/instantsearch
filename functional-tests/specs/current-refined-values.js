import expect from 'expect';
import {getCurrentRefinements} from '../utils.js';

describe('currentRefinedValues', () => {
  const firstRefinement = '#hierarchical-categories .item:nth-child(6)';
  const secondRefinement = '#brands .item:nth-child(8)';

  it('is empty', () => expect(getCurrentRefinements().length).toBe(0));

  context('when we have some refinements', () => {
    beforeEach(() => {
      browser.click(firstRefinement);
      browser.pause(1000);
      browser.click(secondRefinement);
      browser.pause(1000);
    });

    it('shows refinements', () => expect(getCurrentRefinements().length).toBe(2), 2);

    it('has a "Clear all" button', () => {
      browser.click('#current-refined-values .clear-all');
      expect(getCurrentRefinements().length).toBe(0);
    });
  });
});
