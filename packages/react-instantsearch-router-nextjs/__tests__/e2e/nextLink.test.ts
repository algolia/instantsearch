import { waitForUrl } from './utils';

describe('clicking on a Next.js link within the same page updates InstantSearch', () => {
  it('works when not on a i18n route', async () => {
    await browser.url('/');

    const navigationLink = await $('a=Prefilled query');
    await navigationLink.click();

    await waitForUrl('http://localhost:3000/?instant_search%5Bquery%5D=apple');

    const searchInput = await $('.ais-SearchBox-input');
    await browser.waitUntil(async () => {
      return (await searchInput.getValue()) === 'apple';
    });
    expect(await searchInput.getValue()).toBe('apple');
  });

  it('works when on a i18n route', async () => {
    await browser.url('/fr');

    const navigationLink = await $('a=Prefilled query');
    await navigationLink.click();

    await waitForUrl(
      'http://localhost:3000/fr?instant_search%5Bquery%5D=apple'
    );

    const searchInput = await $('.ais-SearchBox-input');
    await browser.waitUntil(async () => {
      return (await searchInput.getValue()) === 'apple';
    });
    expect(await searchInput.getValue()).toBe('apple');
  });
});
