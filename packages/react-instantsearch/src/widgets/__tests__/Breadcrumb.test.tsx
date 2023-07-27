/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { InstantSearchHooksTestWrapper } from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { useHierarchicalMenu } from 'react-instantsearch-core';

import { Breadcrumb } from '../Breadcrumb';

import type { UseHierarchicalMenuProps } from 'react-instantsearch-core';

describe('Breadcrumb', () => {
  const hierarchicalFacets = {
    'hierarchicalCategories.lvl0': {
      'Cameras & Camcorders': 1369,
    },
    'hierarchicalCategories.lvl1': {
      'Cameras & Camcorders > Digital Cameras': 170,
    },
  };
  const hierarchicalAttributes = Object.keys(hierarchicalFacets);

  function createMockedSearchClient() {
    return createSearchClient({
      search: jest.fn((requests) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map(() =>
              createSingleSearchResponse({
                facets: hierarchicalFacets,
              })
            )
          )
        )
      ),
    });
  }

  test('forwards custom class names and `div` props to the root element', () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb
          className="MyBreadcrumb"
          classNames={{ root: 'ROOT' }}
          title="Some custom title"
          attributes={hierarchicalAttributes}
        />
      </InstantSearchHooksTestWrapper>
    );

    const root = container.firstChild;
    expect(root).toHaveClass('MyBreadcrumb', 'ROOT');
    expect(root).toHaveAttribute('title', 'Some custom title');
  });

  test('renders with translations', async () => {
    const searchClient = createMockedSearchClient();
    const { getByRole } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb
          attributes={hierarchicalAttributes}
          translations={{ rootElementText: 'Index' }}
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(getByRole('link', { name: 'Index' })).toBeInTheDocument();
  });
});

function VirtualHierarchicalMenu(props: UseHierarchicalMenuProps) {
  useHierarchicalMenu(props);
  return null;
}
