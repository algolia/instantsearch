import expect from 'expect';
import {getCurrentRefinements} from '../utils.js';

describe('hierarchicalMenu', () => {
  const widget = '#hierarchical-categories';
  const firstItem = 'a*=Appliances';
  const subItem = 'a*=Freezers & Ice Makers';

  it('fails when the first level is not opened', () =>
    browser.element(widget).click(subItem).catch(err => expect(err).toBeAn(Error))
  );

  it('works when first level is opened', () =>
    browser
      .element(widget)
      .click(firstItem)
      .then(getCurrentRefinements)
      .then(refinements =>
        expect(refinements.length).toBe(1) &&
        expect(refinements[0].name).toEqual('Appliances')
      )
      .element(widget)
      .click(subItem)
      .then(getCurrentRefinements)
      .then(refinements =>
        expect(refinements.length).toBe(1) &&
        expect(refinements[0].name).toEqual('Freezers & Ice Makers')
      )
  );
});
