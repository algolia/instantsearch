/**
 * @jest-environment jsdom
 */
import { wait } from '@instantsearch/testutils';

import { setupInstantSearch } from '../setup-instantsearch';

describe('setup of InstantSearch', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  beforeEach(() => {
    errorSpy.mockReset();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  test('error logged if no meta tag found', () => {
    document.head.innerHTML = '';

    setupInstantSearch();

    expect(errorSpy).toHaveBeenCalledWith(
      '[Algolia Experiences] No meta tag found'
    );
  });

  test('no error logged if no elements found', () => {
    document.head.innerHTML = `
      <meta name="instantsearch-configuration" content='{"appId":"appId","apiKey":"apiKey"}'>
    `;

    setupInstantSearch();

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('search is exposed on the window', () => {
    document.head.innerHTML = `
      <meta name="instantsearch-configuration" content='{"appId":"appId","apiKey":"apiKey"}'>
    `;

    setupInstantSearch();

    expect(window.__search).toBeDefined();
  });

  test('styles are injected', () => {
    document.head.innerHTML = `
      <meta name="instantsearch-configuration" content='{"appId":"appId","apiKey":"apiKey"}'>
    `;

    setupInstantSearch();

    expect(
      document.head.querySelectorAll('[data-source=instantsearch]')
    ).toHaveLength(1);
  });

  test('configuration is fetched and rendered', async () => {
    document.head.innerHTML = `
      <meta name="instantsearch-configuration" content='{"appId":"latency","apiKey":"6be0576ff61c053d5f9a3225e2a90f76"}'>
    `;
    document.body.innerHTML = `
      <div data-instantsearch-id="qsdfqsdf"></div>
    `;

    setupInstantSearch();

    expect(
      document.querySelector('[data-instantsearch-id="qsdfqsdf"]')!.children
    ).toHaveLength(0);

    await wait(2000);

    expect(
      document.querySelector('[data-instantsearch-id="qsdfqsdf"]')!.children
    ).not.toHaveLength(0);
  });
});
