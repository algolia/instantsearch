import { queryByText, wait, fireEvent } from '@testing-library/dom';

// eslint-disable-next-line import/extensions, import/no-unresolved
import instantsearch from 'instantsearch.js';

import apiResultsEmptyQuery from '../../../../__fixtures__/empty-query.json';
import apiResultsHelloQuery from '../../../../__fixtures__/hello-query.json';

const searchClient = {
  search: jest.fn(([request]) => {
    let apiResults;
    if (request.params.query === '') {
      apiResults = apiResultsEmptyQuery;
    } else if (request.params.query === 'hello') {
      apiResults = apiResultsHelloQuery;
    } else {
      throw new Error(`No matching API result for ${JSON.stringify(request)}`);
    }
    return Promise.resolve(apiResults);
  }),
};

describe('searchBox', () => {
  let container;
  let search;

  beforeEach(() => {
    container = document.createElement('div');

    search = instantsearch({
      indexName: 'instant_search',
      searchClient,
    });
  });

  afterEach(() => {
    try {
      search.dispose();
    } catch (e) {
      // Fail if the search was never started, ignoring
    }
  });

  it('must be focused by default when autofocus option is enabled', async () => {
    search.addWidget(
      instantsearch.widgets.searchBox({
        container,
        autofocus: true,
      })
    );

    search.start();

    await wait();

    const searchInput = container.querySelector('[type=search]');

    // Check autofocus property
    expect(searchInput.autofocus).toBeTruthy();
  });

  it('must update the hits results when typing in the search box', async () => {
    const hitsContainer = document.createElement('div');

    search.addWidget(
      instantsearch.widgets.searchBox({
        container,
      })
    );

    search.addWidget(
      instantsearch.widgets.hits({
        container: hitsContainer,
        templates: {
          item: `{{name}}`,
        },
      })
    );

    search.start();

    await wait();

    const searchInput = container.querySelector('[type=search]');

    // Type in search box
    fireEvent.input(searchInput, {
      target: { value: 'hello' },
    });

    await wait();

    // Check results
    expect(
      queryByText(
        hitsContainer,
        'eKids - On-Ear Headphones - White, Pink, Blue'
      )
    ).toBeTruthy();
    expect(
      queryByText(
        hitsContainer,
        'Hello Kitty - Polycarbonate Cover for Apple® iPhone® 5 - Black/Pink'
      )
    ).toBeTruthy();
    expect(
      queryByText(hitsContainer, 'hello - Sense Sleep Tracker - Cotton')
    ).toBeTruthy();
    expect(
      queryByText(hitsContainer, 'hello - Sense Sleep Tracker - Charcoal')
    ).toBeTruthy();
  });

  it('must clear the search box when reseting the form', async () => {
    search.addWidget(
      instantsearch.widgets.searchBox({
        container,
      })
    );

    search.start();

    await wait();

    const searchInput = container.querySelector('[type=search]');

    // Type in search box
    fireEvent.input(searchInput, {
      target: { value: 'hello' },
    });

    await wait();

    // Check search box value
    expect(searchInput.value).toEqual('hello');

    // Reset form
    fireEvent(
      searchInput,
      new Event('reset', {
        bubbles: true,
        cancelable: true,
      })
    );

    await wait();

    // Check search box value
    expect(searchInput.value).toEqual('');
  });
});
