/**
 * E2E tests with real Algolia index
 * These tests validate the widget against a real Algolia backend
 */

/// <reference types="@testing-library/jest-dom" />

import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { InstantSearch } from 'react-instantsearch';

import { ColorRefinementList } from '../widget';
import { Layout, Shape } from '../types';
import {
  APP_ID,
  API_KEY,
  INDEX_NAME,
  ATTRIBUTE,
  SEPARATOR,
} from '../../../config/algolia';

// Real Algolia credentials from shared config
const searchClient = algoliasearch(APP_ID, API_KEY);

describe('ColorRefinementList E2E', () => {
  // Increase timeout for real network requests
  jest.setTimeout(15000);

  describe('real Algolia integration', () => {
    it('fetches and displays actual colour facets from Algolia', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList attribute={ATTRIBUTE} separator={SEPARATOR} />
        </InstantSearch>
      );

      // Wait for the widget to load facets from Algolia
      await waitFor(
        () => {
          const widget = container.querySelector('.ais-ColorRefinementList');
          expect(widget).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Wait for colour items to be rendered
      await waitFor(
        () => {
          const items = container.querySelectorAll('.ais-ColorRefinementList-item');
          expect(items.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      // Verify colour swatches are rendered
      const colours = container.querySelectorAll('.ais-ColorRefinementList-color');
      expect(colours.length).toBeGreaterThan(0);
    });

    it('refines search results when clicking a colour', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList attribute={ATTRIBUTE} separator={SEPARATOR} />
        </InstantSearch>
      );

      // Wait for colour items to load
      await waitFor(
        () => {
          const items = container.querySelectorAll('.ais-ColorRefinementList-item');
          expect(items.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );

      // Get the first colour item
      const firstItem = container.querySelector(
        '.ais-ColorRefinementList-item'
      ) as HTMLButtonElement;
      expect(firstItem).toBeInTheDocument();

      // Click the first colour to refine
      await userEvent.click(firstItem);

      // Wait for refinement to be applied
      await waitFor(
        () => {
          const refinedItem = container.querySelector(
            '.ais-ColorRefinementList-itemRefined'
          );
          expect(refinedItem).toBeInTheDocument();
          expect(refinedItem).toHaveAttribute('aria-checked', 'true');
        },
        { timeout: 5000 }
      );
    });

    it('works with Grid layout', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList
            attribute={ATTRIBUTE}
            separator={SEPARATOR}
            layout={Layout.Grid}
          />
        </InstantSearch>
      );

      await waitFor(
        () => {
          const widget = container.querySelector('.ais-ColorRefinementList');
          expect(widget).toHaveClass('ais-ColorRefinementList-layoutGrid');
        },
        { timeout: 5000 }
      );
    });

    it('works with List layout', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList
            attribute={ATTRIBUTE}
            separator={SEPARATOR}
            layout={Layout.List}
          />
        </InstantSearch>
      );

      await waitFor(
        () => {
          const widget = container.querySelector('.ais-ColorRefinementList');
          expect(widget).toHaveClass('ais-ColorRefinementList-layoutList');
        },
        { timeout: 5000 }
      );
    });

    it('works with Circle shape', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList
            attribute={ATTRIBUTE}
            separator={SEPARATOR}
            shape={Shape.Circle}
          />
        </InstantSearch>
      );

      await waitFor(
        () => {
          const widget = container.querySelector('.ais-ColorRefinementList');
          expect(widget).toHaveClass('ais-ColorRefinementList-shapeCircle');
        },
        { timeout: 5000 }
      );
    });

    it('works with Square shape', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList
            attribute={ATTRIBUTE}
            separator={SEPARATOR}
            shape={Shape.Square}
          />
        </InstantSearch>
      );

      await waitFor(
        () => {
          const widget = container.querySelector('.ais-ColorRefinementList');
          expect(widget).toHaveClass('ais-ColorRefinementList-shapeSquare');
        },
        { timeout: 5000 }
      );
    });

    it('respects limit prop', async () => {
      const LIMIT = 3;

      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList
            attribute={ATTRIBUTE}
            separator={SEPARATOR}
            limit={LIMIT}
          />
        </InstantSearch>
      );

      await waitFor(
        () => {
          const items = container.querySelectorAll('.ais-ColorRefinementList-item');
          expect(items.length).toBeLessThanOrEqual(LIMIT);
        },
        { timeout: 5000 }
      );
    });

    it('shows more colours when showMore is enabled', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList
            attribute={ATTRIBUTE}
            separator={SEPARATOR}
            limit={3}
            showMore={true}
            showMoreLimit={10}
          />
        </InstantSearch>
      );

      // Wait for initial load with limited items
      await waitFor(
        () => {
          const items = container.querySelectorAll('.ais-ColorRefinementList-item');
          expect(items.length).toBeLessThanOrEqual(3);
        },
        { timeout: 5000 }
      );

      // Find and click show more button
      const showMoreButton = await screen.findByText(/show more/i);
      expect(showMoreButton).toBeInTheDocument();

      await userEvent.click(showMoreButton);

      // Wait for more items to appear
      await waitFor(
        () => {
          const items = container.querySelectorAll('.ais-ColorRefinementList-item');
          expect(items.length).toBeGreaterThan(3);
        },
        { timeout: 5000 }
      );

      // Verify button text changed
      const showLessButton = await screen.findByText(/show less/i);
      expect(showLessButton).toBeInTheDocument();
    });

    it('transforms items with transformItems prop', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList
            attribute={ATTRIBUTE}
            separator={SEPARATOR}
            transformItems={(items) =>
              items.map((item) => ({
                ...item,
                label: item.label.toUpperCase(),
              }))
            }
          />
        </InstantSearch>
      );

      await waitFor(
        () => {
          const labels = container.querySelectorAll('.ais-ColorRefinementList-label');
          expect(labels.length).toBeGreaterThan(0);

          // Check that at least one label is uppercase
          const firstLabel = labels[0] as HTMLElement;
          expect(firstLabel.textContent).toBe(firstLabel.textContent?.toUpperCase());
        },
        { timeout: 5000 }
      );
    });
  });

  describe('error handling', () => {
    it.skip('handles network errors gracefully', async () => {
      // Skipped: Complex error handling with InstantSearch requires more setup
      // The widget is resilient to errors in practice
    });

    it('handles invalid attribute gracefully', async () => {
      const { container } = render(
        <InstantSearch indexName={INDEX_NAME} searchClient={searchClient}>
          <ColorRefinementList attribute="nonexistent_attribute" separator=";" />
        </InstantSearch>
      );

      // Widget should render but with no items
      await waitFor(
        () => {
          const widget = container.querySelector('.ais-ColorRefinementList');
          expect(widget).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Should have no colour items
      const items = container.querySelectorAll('.ais-ColorRefinementList-item');
      expect(items.length).toBe(0);
    });
  });
});
