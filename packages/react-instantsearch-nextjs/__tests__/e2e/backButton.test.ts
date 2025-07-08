import { waitForUrl } from './utils';

describe('browser back/forward buttons', () => {
  it('works on a single page with InstantSearch', async () => {
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
    expect(historyState.__NA).toBe(true);

    const queryId = await (await $('#query-id')).getText();

    const link = await $('#link');
    await link.click();

    await waitForUrl('http://localhost:3000/layout');

    await browser.back();

    await waitForUrl(urlWithRefinement);

    const checkbox = await $('.ais-RefinementList-checkbox[value="Apple"]');
    expect(await checkbox.getAttribute('checked')).toBe('true');
    const queryIdAfterBack = await (await $('#query-id')).getText();
    expect(queryIdAfterBack).toBe(queryId);
  });

  it('works on a page wrapped with a layout containing InstantSearch', async () => {
    await browser.url('/layout');

    const link = await $$('a=Go to search page');

    // Ensure hydration works and does not double on a page without widgets
    expect(link.length).toBe(1);
    await link[0].click();

    await waitForUrl('http://localhost:3000/layout/search');

    const queryId = await (await $('#query-id')).getText();

    await browser.back();

    await waitForUrl('http://localhost:3000/layout');

    await browser.forward();

    await waitForUrl('http://localhost:3000/layout/search');

    const queryIdAfterForward = await (await $('#query-id')).getText();

    const hits = await $$('.ais-Hits-item');
    expect(hits.length).toBeGreaterThan(0);
    expect(queryIdAfterForward).toBe(queryId);
  });

  it('works on a dynamic route with links', async () => {
    await browser.url('/Appliances');

    let firstHit = await (await $('.ais-Hits-item')).getText();
    expect(firstHit).toContain('Nest - Learning Thermostat');

    const audioLink = await $('a=Audio');
    await audioLink.click();
    await waitForUrl('http://localhost:3000/Audio');

    // wait a bit for results
    await browser.pause(1000);

    firstHit = await (await $('.ais-Hits-item')).getText();
    expect(firstHit).toContain('Apple - EarPods');

    await browser.back();
    await waitForUrl('http://localhost:3000/Appliances');

    firstHit = await (await $('.ais-Hits-item')).getText();
    expect(firstHit).toContain('Nest - Learning Thermostat');
  });

  it('works on different pages with InstantSearch', async () => {
    await browser.url('/Appliances');

    let firstHit = await (await $('.ais-Hits-item')).getText();
    expect(firstHit).toContain('Nest - Learning Thermostat');

    const audioLink = await $('a=Home');
    await audioLink.click();
    await waitForUrl('http://localhost:3000/');

    // wait a bit for results
    await browser.pause(1000);

    firstHit = await (await $('.ais-Hits-item')).getText();
    expect(firstHit).toContain('Amazon');

    await browser.back();
    await waitForUrl('http://localhost:3000/Appliances');

    firstHit = await (await $('.ais-Hits-item')).getText();
    expect(firstHit).toContain('Nest - Learning Thermostat');
  });
});
