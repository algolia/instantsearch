import { waitForUrl } from './utils';

describe('refining InstantSearch causes only one onStateChange', () => {
  describe('Next.js Link', () => {
    it('works when not on a i18n route', async () => {
      await browser.url('/');

      const navigationLink = await $('a=Prefilled query');
      await navigationLink.click();

      await waitForUrl(
        'http://localhost:3000/?instant_search%5Bquery%5D=apple'
      );

      const output = await $('output#onStateChange');
      expect(await output.getText()).toBe('1');
    });

    it('works when on a i18n route', async () => {
      await browser.url('/fr');

      const navigationLink = await $('a=Prefilled query');
      await navigationLink.click();

      await waitForUrl(
        'http://localhost:3000/fr?instant_search%5Bquery%5D=apple'
      );

      const output = await $('output#onStateChange');
      expect(await output.getText()).toBe('1');
    });
  });

  describe('InstantSearch', () => {
    it('works when not on a i18n route', async () => {
      await browser.url('/');

      const refinementLink = await $('.ais-RefinementList-labelText=Apple');
      await refinementLink.click();

      await waitForUrl(
        'http://localhost:3000/?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple'
      );

      const output = await $('output#onStateChange');
      expect(await output.getText()).toBe('1');
    });

    it('works when on a i18n route', async () => {
      await browser.url('/fr');

      const refinementLink = await $('.ais-RefinementList-labelText=Apple');
      await refinementLink.click();

      await waitForUrl(
        'http://localhost:3000/fr?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple'
      );

      const output = await $('output#onStateChange');
      expect(await output.getValue()).toBe('1');
    });
  });
});
