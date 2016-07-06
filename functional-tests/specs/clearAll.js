import expect from 'expect';
import {clearAll, getCurrentRefinements} from '../utils.js';

describe('clearAll', () => {
  it('clears refinements', () => {
    const firstRefinement = '#hierarchical-categories .item:nth-child(2)';
    const secondRefinement = '#brands .item:nth-child(1)';

    clearAll();
    expect(getCurrentRefinements().length).toBe(0, 'No refinements at first');

    browser.click(firstRefinement);
    browser.pause(500);
    browser.click(secondRefinement);
    browser.pause(500);

    expect(getCurrentRefinements().length).toBe(2, 'Two refinements after clicking');
    clearAll();

    expect(getCurrentRefinements().length).toBe(0, 'No refinements after clearAll');
  });
});
