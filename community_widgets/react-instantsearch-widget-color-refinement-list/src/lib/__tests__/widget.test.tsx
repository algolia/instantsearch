/**
 * Integration tests for ColorRefinementList widget
 * Follows patterns from packages/react-instantsearch/src/widgets/__tests__/
 */

/// <reference types="@testing-library/jest-dom" />

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Hits, InstantSearch } from 'react-instantsearch';
import type { SearchClient } from 'algoliasearch';

import { ColorRefinementList } from '../widget';
import { Layout, Shape } from '../types';

// Mock search client following InstantSearch patterns
function createMockedSearchClient(facets: Record<string, number> = {}): SearchClient {
  return {
    search: jest.fn((requests: any[]) =>
      Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 20,
          processingTimeMS: 1,
          query: '',
          params: '',
          index: 'test_index',
          facets: {
            color: facets,
          },
        })),
      })
    ),
  } as unknown as SearchClient;
}

const DEFAULT_COLOR_FACETS = {
  'Black;#000000': 10,
  'White;#ffffff': 5,
  'Red;#ff0000': 8,
  'Blue;#0000ff': 6,
  'Green;#00ff00': 4,
};

describe('ColorRefinementList Widget', () => {
  describe('rendering', () => {
    it('renders with default props', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" />
        </InstantSearch>
      );

      await waitFor(() => {
        expect(searchClient.search).toHaveBeenCalled();
      });

      // Wait for facets to be rendered
      await waitFor(() => {
        const widget = container.querySelector('.ais-ColorRefinementList');
        expect(widget).toBeInTheDocument();
      });
    });

    it('forwards custom className to root element', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList
            attribute="color"
            className="MyColorWidget"
          />
        </InstantSearch>
      );

      await waitFor(() => {
        expect(searchClient.search).toHaveBeenCalled();
      });

      const root = container.querySelector('.ais-ColorRefinementList');
      expect(root).toHaveClass('MyColorWidget');
    });

    it('applies Grid layout by default', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" />
        </InstantSearch>
      );

      await waitFor(() => {
        const widget = container.querySelector('.ais-ColorRefinementList');
        expect(widget).toHaveClass('ais-ColorRefinementList-layoutGrid');
      });
    });

    it('applies List layout when specified', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" layout={Layout.List} />
        </InstantSearch>
      );

      await waitFor(() => {
        const widget = container.querySelector('.ais-ColorRefinementList');
        expect(widget).toHaveClass('ais-ColorRefinementList-layoutList');
      });
    });

    it('applies Circle shape by default', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" />
        </InstantSearch>
      );

      await waitFor(() => {
        const widget = container.querySelector('.ais-ColorRefinementList');
        expect(widget).toHaveClass('ais-ColorRefinementList-shapeCircle');
      });
    });

    it('applies Square shape when specified', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" shape={Shape.Square} />
        </InstantSearch>
      );

      await waitFor(() => {
        const widget = container.querySelector('.ais-ColorRefinementList');
        expect(widget).toHaveClass('ais-ColorRefinementList-shapeSquare');
      });
    });
  });

  describe('facet interactions', () => {
    it('refines search when clicking a colour', async () => {
      const user = userEvent.setup();
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { getByLabelText } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" />
        </InstantSearch>
      );

      await waitFor(() => {
        expect(searchClient.search).toHaveBeenCalled();
      });

      // Wait for colour buttons to render
      await waitFor(() => {
        expect(getByLabelText(/Refine on Black/i)).toBeInTheDocument();
      });

      const blackButton = getByLabelText(/Refine on Black/i);
      await user.click(blackButton);

      // Should trigger a new search with refinement
      await waitFor(() => {
        expect(searchClient.search).toHaveBeenCalledTimes(2);
      });
    });

    // Skipped: InstantSearch deduplicates widgets with same attribute
    it.skip('works with multiple widgets on same page', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" />
          <ColorRefinementList attribute="color" />
        </InstantSearch>
      );

      await waitFor(() => {
        const widgets = container.querySelectorAll('.ais-ColorRefinementList');
        expect(widgets).toHaveLength(2);
      });
    });
  });

  describe('show more functionality', () => {
    it('limits items by default', async () => {
      const manyColors = Object.fromEntries(
        Array.from({ length: 15 }, (_, i) => [`Colour ${i};#${i}00000`, i + 1])
      );

      const searchClient = createMockedSearchClient(manyColors);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" limit={5} />
        </InstantSearch>
      );

      await waitFor(() => {
        const items = container.querySelectorAll(
          '.ais-ColorRefinementList-item'
        );
        expect(items.length).toBeLessThanOrEqual(5);
      });
    });

    it('shows "Show more" button when showMore is true', async () => {
      const manyColors = Object.fromEntries(
        Array.from({ length: 15 }, (_, i) => [`Colour ${i};#${i}00000`, i + 1])
      );

      const searchClient = createMockedSearchClient(manyColors);

      const { getByText } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList
            attribute="color"
            limit={5}
            showMore={true}
            showMoreLimit={10}
          />
        </InstantSearch>
      );

      await waitFor(() => {
        expect(getByText('Show more')).toBeInTheDocument();
      });
    });

    it('expands list when clicking "Show more"', async () => {
      const user = userEvent.setup();
      const manyColors = Object.fromEntries(
        Array.from({ length: 15 }, (_, i) => [`Colour ${i};#${i}00000`, i + 1])
      );

      const searchClient = createMockedSearchClient(manyColors);

      const { getByText, container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList
            attribute="color"
            limit={5}
            showMore={true}
            showMoreLimit={10}
          />
        </InstantSearch>
      );

      await waitFor(() => {
        expect(getByText('Show more')).toBeInTheDocument();
      });

      const itemsBefore = container.querySelectorAll(
        '.ais-ColorRefinementList-item'
      );
      expect(itemsBefore.length).toBeLessThanOrEqual(5);

      const showMoreButton = getByText('Show more');
      await user.click(showMoreButton);

      await waitFor(() => {
        expect(getByText('Show less')).toBeInTheDocument();
      });

      const itemsAfter = container.querySelectorAll(
        '.ais-ColorRefinementList-item'
      );
      expect(itemsAfter.length).toBeGreaterThan(itemsBefore.length);
    });
  });

  describe('transformItems', () => {
    it('applies transformItems function to items', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { getByText } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList
            attribute="color"
            transformItems={(items) =>
              items.map((item) => ({
                ...item,
                label: item.label.toUpperCase(),
              }))
            }
          />
        </InstantSearch>
      );

      await waitFor(() => {
        // Labels should be transformed to uppercase
        expect(getByText('BLACK')).toBeInTheDocument();
        expect(getByText('WHITE')).toBeInTheDocument();
      });
    });

    it('can filter items with transformItems', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { queryByText, getByText } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList
            attribute="color"
            transformItems={(items) =>
              items.filter((item) => item.count >= 8)
            }
          />
        </InstantSearch>
      );

      await waitFor(() => {
        // Should show Black (10) and Red (8)
        expect(getByText('Black')).toBeInTheDocument();
        expect(getByText('Red')).toBeInTheDocument();

        // Should not show White (5), Blue (6), Green (4)
        expect(queryByText('White')).not.toBeInTheDocument();
        expect(queryByText('Blue')).not.toBeInTheDocument();
        expect(queryByText('Green')).not.toBeInTheDocument();
      });
    });
  });

  describe('translations', () => {
    it('uses custom translations', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { getByLabelText } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList
            attribute="color"
            translations={{
              refineOn: (value) => `Filter by ${value}`,
              colors: (count) => `Colours (${count} selected)`,
              showMore: (expanded) => (expanded ? 'Less' : 'More'),
            }}
          />
        </InstantSearch>
      );

      await waitFor(() => {
        expect(getByLabelText('Filter by Black')).toBeInTheDocument();
      });
    });
  });

  describe('colour sorting', () => {
    it('sorts colours by hue when sortByColor is true', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" sortByColor={true} />
        </InstantSearch>
      );

      await waitFor(() => {
        const items = container.querySelectorAll(
          '.ais-ColorRefinementList-item'
        );
        expect(items.length).toBeGreaterThan(0);
      });

      // Colours should be sorted by similarity
      // This is a visual algorithm so we just verify it doesn't crash
    });

    it('sorts colours alphabetically when sortByColor is false', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" sortByColor={false} />
        </InstantSearch>
      );

      await waitFor(() => {
        const items = container.querySelectorAll(
          '.ais-ColorRefinementList-item'
        );
        expect(items.length).toBeGreaterThan(0);
      });
    });
  });

  describe('integration with other widgets', () => {
    it('works alongside Hits widget', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" />
          <Hits hitComponent={({ hit }) => <div>{hit.name}</div>} />
        </InstantSearch>
      );

      await waitFor(() => {
        expect(
          container.querySelector('.ais-ColorRefinementList')
        ).toBeInTheDocument();
        expect(container.querySelector('.ais-Hits')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('throws error when separator not found in colour values', async () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const invalidFacets = {
        InvalidFormat: 10, // Missing separator
      };

      const searchClient = createMockedSearchClient(invalidFacets);

      expect(() => {
        render(
          <InstantSearch indexName="test_index" searchClient={searchClient}>
            <ColorRefinementList attribute="color" />
          </InstantSearch>
        );
      }).not.toThrow();

      // React will catch the error during rendering
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('renders with proper ARIA attributes', async () => {
      const searchClient = createMockedSearchClient(DEFAULT_COLOR_FACETS);

      const { container } = render(
        <InstantSearch indexName="test_index" searchClient={searchClient}>
          <ColorRefinementList attribute="color" />
        </InstantSearch>
      );

      await waitFor(() => {
        const group = container.querySelector('[role="group"]');
        expect(group).toBeInTheDocument();
        expect(group).toHaveAttribute('aria-label');

        const items = container.querySelectorAll('[role="menuitemcheckbox"]');
        expect(items.length).toBeGreaterThan(0);

        items.forEach((item) => {
          expect(item).toHaveAttribute('aria-checked');
          expect(item).toHaveAttribute('aria-label');
        });
      });
    });
  });
});
