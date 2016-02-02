import expect from 'expect';
import {clearAll, getCurrentRefinements} from '../utils.js';

describe('clearAll', () => {
  it('clears refinements', () => {
    const firstRefinement = '#hierarchical-categories .item:nth-child(2)';
    const secondRefinement = '#brands .item:nth-child(1)';

    return clearAll()
      .then(getCurrentRefinements)
      .then(refinements => expect(refinements.length).toBe(0, 'No refinements at first'))
      .click(firstRefinement)
      .pause(500)
      .click(secondRefinement)
      .pause(500)
      .then(getCurrentRefinements)
      .then(refinements => expect(refinements.length).toBe(2, 'Two refinements after clicking'))
      .then(clearAll)
      .then(getCurrentRefinements)
      .then(refinements => expect(refinements.length).toBe(0, 'No refinements after clearAll'));
  });
});
