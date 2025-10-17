import { waitForUrl, waitForInputValue } from './utils';

describe('clicking on a Next.js link within the same page updates InstantSearch', () => {
  it('works when not on a i18n route', async () => {
    await browser.url('/');

    const navigationLink = await $('a=Prefilled query');
    await navigationLink.click();

    await waitForUrl('http://localhost:3000/?instant_search%5Bquery%5D=apple');

    // Wait for the input value to be updated, which ensures the page has fully loaded
    await waitForInputValue('.ais-SearchBox-input', 'apple');
  });

  it('works when on a i18n route', async () => {
    await browser.url('/fr');

    const navigationLink = await $('a=Prefilled query');
    await navigationLink.click();

    await waitForUrl(
      'http://localhost:3000/fr?instant_search%5Bquery%5D=apple'
    );

    // Wait for the input value to be updated, which ensures the page has fully loaded
    await waitForInputValue('.ais-SearchBox-input', 'apple');
  });
});
