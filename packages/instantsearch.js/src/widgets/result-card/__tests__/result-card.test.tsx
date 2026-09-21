/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createSingleSearchResponse } from '../../../../../../tests/mocks/createAPIResponse';
import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import resultCard from '../result-card';

import type { SearchResults } from 'algoliasearch-helper';

function makeResults(query = 'running shoes'): SearchResults {
  const helper = algoliasearchHelper(createSearchClient(), 'indexName');
  return new algoliasearchHelper.SearchResults(helper.state, [
    createSingleSearchResponse({
      hits: [{ objectID: '1' }] as unknown as SearchResults['hits'],
      query,
      // The Rule payload enabling the card; the client types `userData` as an object.
      userData: [{ resultCard: { enabled: true } }] as unknown as Record<
        string,
        unknown
      >,
    }),
  ]);
}

describe('resultCard', () => {
  it('throws without a `container`', () => {
    expect(() =>
      resultCard({
        // @ts-expect-error
        container: undefined,
        agentId: 'a',
      })
    ).toThrowErrorMatchingInlineSnapshot(`
      "The \`container\` option is required.

      See documentation: https://www.algolia.com/doc/api-reference/widgets/result-card/js/"
    `);
  });

  it('renders the card into the container once activated', () => {
    const container = document.createElement('div');
    const search = createInstantSearch();
    const widget = resultCard({ container, agentId: 'a' });

    widget.init!(
      createInitOptions({
        instantSearchInstance: search,
        helper: search.helper!,
      })
    );
    widget.render!(
      createRenderOptions({
        instantSearchInstance: search,
        helper: search.helper!,
        results: makeResults(),
      })
    );

    const root = container.querySelector('.ais-ResultCard');
    expect(root).toHaveAttribute('data-status', 'loading');
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(
      container.querySelector('.ais-ResultCard-headerTitle')
    ).toHaveTextContent('AI Overview');
  });

  it('renders a custom `layout` template with the render state', () => {
    const container = document.createElement('div');
    const search = createInstantSearch();
    const widget = resultCard({
      container,
      agentId: 'a',
      templates: {
        layout: ({ status, query }) => `<p>${status}: ${query}</p>`,
      },
    });

    widget.init!(
      createInitOptions({
        instantSearchInstance: search,
        helper: search.helper!,
      })
    );
    widget.render!(
      createRenderOptions({
        instantSearchInstance: search,
        helper: search.helper!,
        results: makeResults(),
      })
    );

    expect(container).toHaveTextContent('loading: running shoes');
  });
});
