/**
 * @jest-environment jsdom
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useHierarchicalMenu } from 'react-instantsearch-hooks';

import { InstantSearchHooksTestWrapper } from '../../../../../tests/utils';
import { Breadcrumb } from '../Breadcrumb';

import type { UseHierarchicalMenuProps } from 'react-instantsearch-hooks';

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

  test('renders with props', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper searchClient={searchClient}>
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb attributes={hierarchicalAttributes} />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb ais-Breadcrumb--noRefinement"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Home
              </a>
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('renders with initial refinements', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
        initialUiState={{
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        }}
      >
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb attributes={hierarchicalAttributes} />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Home
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Cameras & Camcorders
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              Digital Cameras
            </li>
          </ul>
        </div>
      </div>
    `);
  });

  test('transforms the items', async () => {
    const searchClient = createMockedSearchClient();
    const { container } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
        initialUiState={{
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        }}
      >
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb
          attributes={hierarchicalAttributes}
          transformItems={(items) =>
            items.map((item) => ({ ...item, label: item.label.toUpperCase() }))
          }
        />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(
      [...container.querySelectorAll('.ais-Breadcrumb-item')].map(
        (item) => item.textContent
      )
    ).toMatchInlineSnapshot(`
      [
        "Home",
        ">CAMERAS & CAMCORDERS",
        ">DIGITAL CAMERAS",
      ]
    `);
  });

  test('navigates to a parent category', async () => {
    const searchClient = createMockedSearchClient();
    const { container, getByText } = render(
      <InstantSearchHooksTestWrapper
        searchClient={searchClient}
        initialUiState={{
          indexName: {
            hierarchicalMenu: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          },
        }}
      >
        <VirtualHierarchicalMenu attributes={hierarchicalAttributes} />
        <Breadcrumb attributes={hierarchicalAttributes} />
      </InstantSearchHooksTestWrapper>
    );

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Breadcrumb"
        >
          <ul
            class="ais-Breadcrumb-list"
          >
            <li
              class="ais-Breadcrumb-item"
            >
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Home
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              <a
                class="ais-Breadcrumb-link"
                href="#"
              >
                Cameras & Camcorders
              </a>
            </li>
            <li
              class="ais-Breadcrumb-item ais-Breadcrumb-item--selected"
            >
              <span
                aria-hidden="true"
                class="ais-Breadcrumb-separator"
              >
                &gt;
              </span>
              Digital Cameras
            </li>
          </ul>
        </div>
      </div>
    `);

    userEvent.click(getByText('Cameras & Camcorders'));

    expect(searchClient.search).toHaveBeenCalledTimes(2);
    expect(searchClient.search).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          params: expect.objectContaining({
            facetFilters: [
              ['hierarchicalCategories.lvl0:Cameras & Camcorders'],
            ],
          }),
        }),
      ])
    );
  });

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
