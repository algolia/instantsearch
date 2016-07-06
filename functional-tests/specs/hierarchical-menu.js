import expect from 'expect';
import {getCurrentRefinements} from '../utils.js';

describe('hierarchicalMenu', () => {
  const widget = '#hierarchical-categories';
  const firstItem = '*=Appliances';
  const subItem = '*=Freezers & Ice Makers';

  it('fails when the first level is not opened', () => {
    try {
      browser.element(widget).click(subItem);
      expect(false).toBe(true); // if we reach that point, we managed to click: bad
    } catch (err) {
      expect(err).toBeAn(Error);
    }
  });

  it('works when first level is opened', () => {
    browser
      .element(widget)
      .click(firstItem);

    const firstLevelRefinements = getCurrentRefinements();
    expect(firstLevelRefinements.length).toBe(1);
    expect(firstLevelRefinements[0].name).toEqual('Appliances');

    browser
      .element(widget)
      .click(subItem);

    const subLevelRefinements = getCurrentRefinements();
    expect(subLevelRefinements.length).toBe(1);
    expect(subLevelRefinements[0].name).toEqual('Freezers & Ice Makers');
  });
});
