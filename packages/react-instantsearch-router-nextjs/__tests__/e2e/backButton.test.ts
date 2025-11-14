import { waitForUrl, waitForElementAttribute } from './utils';

describe('browser back/forward buttons works on routes pushed by InstantSearch', () => {
  it('works when not on a i18n route', async () => {
    await browser.url('/');

    const appleRefinementListItem = await $(
      '.ais-RefinementList-checkbox[value="Apple"]'
    );
    await appleRefinementListItem.click();

    const urlWithRefinement =
      'http://localhost:3000/?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple';
    await waitForUrl(urlWithRefinement);

    // Ensure push was done by Next.js router
    const historyState = (await browser.execute(
      'return window.history.state'
    )) as History['state'];
    expect(historyState.__N).toBe(true);

    const link = await $('.ais-Hits-item');
    await link.click();

    await waitForUrl('http://localhost:3000/other-page');

    await browser.back();

    await waitForUrl(urlWithRefinement);

    // Wait for the checkbox to be checked, which ensures the state has been restored
    await waitForElementAttribute('.ais-RefinementList-checkbox[value="Apple"]', 'checked', 'true');
  });

  it('works when on a i18n route', async () => {
    await browser.url('/fr');

    const appleRefinementListItem = await $(
      '.ais-RefinementList-checkbox[value="Apple"]'
    );
    await appleRefinementListItem.click();

    const urlWithRefinement =
      'http://localhost:3000/fr?instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple';
    await waitForUrl(urlWithRefinement);

    // Ensure push was done by Next.js router
    const historyState = (await browser.execute(
      'return window.history.state'
    )) as History['state'];
    expect(historyState.__N).toBe(true);

    const link = await $('.ais-Hits-item');
    await link.click();

    await waitForUrl('http://localhost:3000/fr/other-page');

    await browser.back();

    await waitForUrl(urlWithRefinement);

    // Wait for the checkbox to be checked, which ensures the state has been restored
    await waitForElementAttribute('.ais-RefinementList-checkbox[value="Apple"]', 'checked', 'true');
  });
});
