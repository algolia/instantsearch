/**
 * @jest-environment jsdom
 */
import { castToJestMock, wait } from '@instantsearch/testutils';

import { fetchConfiguration } from '../get-configuration';
import { setupInstantSearch } from '../setup-instantsearch';

jest.mock('../get-configuration', () => {
  const actual = jest.requireActual('../get-configuration');
  return {
    ...actual,
    fetchConfiguration: jest.fn(() => Promise.resolve([])),
  };
});

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
      <meta name="algolia-configuration" content='{"appId":"appId","apiKey":"apiKey"}'>
    `;

    setupInstantSearch();

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('search is exposed on the window', () => {
    document.head.innerHTML = `
      <meta name="algolia-configuration" content='{"appId":"appId","apiKey":"apiKey"}'>
    `;

    setupInstantSearch();

    expect(window.__search).toBeDefined();
  });

  test('styles are injected', () => {
    document.head.innerHTML = `
      <meta name="algolia-configuration" content='{"appId":"appId","apiKey":"apiKey"}'>
    `;

    setupInstantSearch();

    expect(
      document.head.querySelectorAll('[data-source=instantsearch]')
    ).toHaveLength(1);
  });

  test('configuration is fetched and rendered', async () => {
    castToJestMock(fetchConfiguration).mockImplementationOnce(() =>
      Promise.resolve([
        {
          id: 'fake-configuration',
          name: 'Fake Configuration',
          indexName: 'fake-index-name',
          blocks: [
            {
              type: 'grid',
              children: [],
            },
          ],
          createdAt: '2021-01-01',
          updatedAt: '2021-01-01',
        },
      ])
    );

    document.head.innerHTML = `
      <meta name="algolia-configuration" content='{"appId":"latency","apiKey":"6be0576ff61c053d5f9a3225e2a90f76"}'>
    `;
    document.body.innerHTML = `
      <div data-experience-id="fake-configuration"></div>
    `;

    setupInstantSearch();

    expect(
      document.querySelector('[data-experience-id="fake-configuration"]')!
        .children
    ).toHaveLength(0);

    await wait(0);

    expect(
      document.querySelector('[data-experience-id="fake-configuration"]')!
        .children
    ).not.toHaveLength(0);

    expect(
      document.querySelector('[data-experience-id="fake-configuration"]')!
        .innerHTML
    ).toMatchInlineSnapshot(`
      <div class="ais-Grid">
      </div>
    `);
  });
});
