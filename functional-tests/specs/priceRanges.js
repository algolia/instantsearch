import expect from 'expect';
import {getCurrentRefinements} from '../utils.js';

describe('priceRanges', () => {
  const widget = '#price-ranges';
  const item = '.item';
  const priceRange = '*=$80';
  const firstInput = 'label:nth-of-type(1) input';
  const secondInput = 'label:nth-of-type(2) input';

  it('has some default ranges', () =>
    expect(browser
      .element(widget)
      .elements(item)
      .value.length
    ).toBe(7)
  );

  it('can refine by clicking a range', () => {
    browser
      .element(widget)
      .click(priceRange);

    const refinements = getCurrentRefinements();
    expect(refinements.length).toBe(2);
    expect(refinements[0].name).toBe('Price ≤ 160');
    expect(refinements[1].name).toBe('Price ≥ 80');
  });

  context('the form', () => {
    beforeEach(() => {
      const element = browser.element(widget);

      element.setValue(firstInput, '9');
      // there should be no need to use setValue + addValue
      // and just use .setValue(..., value)
      // but it seems like there is a timing issue in preact
      // https://github.com/developit/preact/issues/263
      element.addValue(firstInput, '4');

      element.setValue(secondInput, '1');
      element.addValue(secondInput, '1');
      element.addValue(secondInput, '3');
    });

    it('can be submitted with ENTER key', () => {
      browser
        .element(widget)
        .addValue(secondInput, 'Enter');

      const refinements = getCurrentRefinements();
      expect(refinements.length).toBe(2);
      expect(refinements[0].name).toBe('Price ≤ 113');
      expect(refinements[1].name).toBe('Price ≥ 94');
    });

    it('can be submitted by using the submit button', () => {
      browser
        .element(widget)
        .click('button');

      const refinements = getCurrentRefinements();
      expect(refinements.length).toBe(2);
      expect(refinements[0].name).toBe('Price ≤ 113');
      expect(refinements[1].name).toBe('Price ≥ 94');
    });
  });
});
