import { waitForUrl, waitForInputValue, waitForElementText } from './utils';

describe('refining InstantSearch causes only one onStateChange', () => {
  describe('Next.js Link', () => {
    it('works when not on a i18n route', async () => {
      await browser.url('/test');

      const navigationLink = await $('a=Prefilled query');
      await navigationLink.click();

      await waitForUrl(
        'http://localhost:3000/test?instant_search%5Bquery%5D=apple'
      );

      // Wait for both URL and input value to be consistent
      await waitForInputValue('.ais-SearchBox-input', 'apple');
      
      // Wait for the onStateChange counter to be updated
      await waitForElementText('output#onStateChange', '1');
    });

    it('works when on a i18n route', async () => {
      await browser.url('/fr/test');

      const navigationLink = await $('a=Prefilled query');
      await navigationLink.click();

      await waitForUrl(
        'http://localhost:3000/fr/test?instant_search%5Bquery%5D=apple'
      );

      // Wait for both URL and input value to be consistent
      await waitForInputValue('.ais-SearchBox-input', 'apple');
      
      // Wait for the onStateChange counter to be updated
      await waitForElementText('output#onStateChange', '1');
    });
  });

  describe('InstantSearch', () => {
    it('works when not on a i18n route', async () => {
      await browser.url('/test');

      const refinementLink = await $('.ais-RefinementList-labelText=Apple');
      await refinementLink.click();

      await waitForUrl(
        'http://localhost:3000/test?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple'
      );

      // Wait for the onStateChange counter to be updated
      await waitForElementText('output#onStateChange', '1');
    });

    it('works when on a i18n route', async () => {
      await browser.url('/fr/test');

      const refinementLink = await $('.ais-RefinementList-labelText=Apple');
      await refinementLink.click();

      await waitForUrl(
        'http://localhost:3000/fr/test?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple'
      );

      // Wait for the onStateChange counter to be updated
      await waitForElementText('output#onStateChange', '1');
    });
  });
});
