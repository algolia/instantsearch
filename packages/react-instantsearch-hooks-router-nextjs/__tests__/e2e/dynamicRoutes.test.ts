import { waitForUrl } from './utils';

describe('InstantSearch updates state when navigating with Next router', () => {
  it('works when not on a i18n route', async () => {
    await browser.url('/search/appliances');

    const whirlpoolRefinementListItem = await $(
      '.ais-RefinementList-checkbox[value="Whirlpool"]'
    );
    await whirlpoolRefinementListItem.waitForDisplayed();

    const audioLink = await $('[href="/search/audio"]');
    await audioLink.click();

    await waitForUrl('http://localhost:3000/search/audio');

    const yamahaRefinementListItem = await $(
      '.ais-RefinementList-checkbox[value="Yamaha"]'
    );
    expect(await yamahaRefinementListItem.waitForDisplayed()).toBe(true);
  });

  it('works when on a i18n route', async () => {
    await browser.url('/fr/search/appliances');

    const whirlpoolRefinementListItem = await $(
      '.ais-RefinementList-checkbox[value="Whirlpool"]'
    );
    await whirlpoolRefinementListItem.waitForDisplayed();

    const audioLink = await $('[href="/fr/search/audio"]');
    await audioLink.click();

    await waitForUrl('http://localhost:3000/fr/search/audio');

    const yamahaRefinementListItem = await $(
      '.ais-RefinementList-checkbox[value="Yamaha"]'
    );
    expect(await yamahaRefinementListItem.waitForDisplayed()).toBe(true);
  });
});
