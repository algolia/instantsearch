import expect from 'expect';
import {getCurrentRefinements} from '../utils.js';

describe('priceRanges', () => {
  const widget = '#price-ranges';
  const item = '.item';
  const priceRange = 'a*=$80';

  it('has some default ranges', () =>
    browser
      .element(widget)
      .elements(item)
      .then(items =>
        expect(items.value.length)
          .toBe(7)
      )
  );

  it('can refine by clicking a range', () =>
    browser
      .element(widget)
      .click(priceRange)
      .then(getCurrentRefinements)
      .then(refinements =>
        expect(refinements.length).toBe(2) &&
        expect(refinements[0].name).toBe('Price ≤ 160') &&
        expect(refinements[1].name).toBe('Price ≥ 80')
      )
  );

  context('the form', () => {
    beforeEach(() =>
      browser
        .element(widget)
        .setValue('label:nth-of-type(1) input', '94')
        .setValue('label:nth-of-type(2) input', '113')
    );

    it('can be submitted with ENTER key', () =>
      browser
        .element(widget)
        .addValue('label:nth-of-type(2) input', 'Enter')
        .then(getCurrentRefinements)
        .then(refinements => expect(refinements.length).toBe(2) &&
          expect(refinements[0].name).toBe('Price ≤ 113') &&
          expect(refinements[1].name).toBe('Price ≥ 94')
        )
    );

    it('can be submitted by using the submit button', () =>
      browser
        .element(widget)
        .click('button')
        .then(getCurrentRefinements)
        .then(refinements => expect(refinements.length).toBe(2) &&
          expect(refinements[0].name).toBe('Price ≤ 113') &&
          expect(refinements[1].name).toBe('Price ≥ 94')
        )
    );
  });
});
