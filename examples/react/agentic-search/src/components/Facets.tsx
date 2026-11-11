import React from 'react';
import {
  ClearRefinements,
  RefinementList,
  useRefinementList,
} from 'react-instantsearch';

import { FACET_TITLES, PRESET } from '../backend';

import { colorValue } from './ProductArt';

function FacetPanel({
  attribute,
  children,
}: {
  attribute: string;
  children: React.ReactNode;
}) {
  return (
    <section className="facet">
      <h2 className="facet-title">{FACET_TITLES[attribute] ?? attribute}</h2>
      {children}
    </section>
  );
}

function ColorFacet({ attribute }: { attribute: string }) {
  const { items, refine } = useRefinementList({
    attribute,
    sortBy: ['name:asc'],
  });

  return (
    <FacetPanel attribute={attribute}>
      <ul className="swatches">
        {items.map((item) => (
          <li key={item.value}>
            <button
              type="button"
              className={`swatch${item.isRefined ? ' is-refined' : ''}`}
              aria-pressed={item.isRefined}
              onClick={() => refine(item.value)}
            >
              <span
                className="swatch-dot"
                style={{ background: colorValue(item.value) }}
                aria-hidden="true"
              />
              <span className="swatch-label">{item.label}</span>
              <span className="swatch-count">{item.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </FacetPanel>
  );
}

const byLowerBound = (a: { name: string }, b: { name: string }) =>
  parseFloat(a.name) - parseFloat(b.name);

// Module-level on purpose: widget props are compared by value, and a new
// function on every render would re-create the widget, which searches again,
// which renders again: an infinite search loop.
const formatPriceRanges = <TItem extends { label: string }>(items: TItem[]) =>
  items.map((item) => ({
    ...item,
    label: item.label.replace(/(\d+)\s*-\s*(\d+)/, '$$$1 – $$$2'),
  }));

function Facet({ attribute }: { attribute: string }) {
  const isPrice = attribute === 'price_range';
  return (
    <FacetPanel attribute={attribute}>
      <RefinementList
        attribute={attribute}
        limit={8}
        showMore
        showMoreLimit={20}
        sortBy={isPrice ? byLowerBound : ['count:desc', 'name:asc']}
        transformItems={isPrice ? formatPriceRanges : undefined}
        classNames={{ showMore: 'link-button' }}
      />
    </FacetPanel>
  );
}

/**
 * Facets always come from the broad (regular) query, also in agentic mode:
 * the agent doesn't change them, it only reads them as a filters snapshot.
 * Which facets, and in which order, is set per backend in `backend.ts`.
 */
export function Facets() {
  return (
    <aside className="facets" aria-label="Filters">
      <div className="facets-header">
        <span>Filters</span>
        <ClearRefinements
          translations={{ resetButtonText: 'Clear all' }}
          classNames={{ button: 'link-button', disabledButton: 'is-hidden' }}
        />
      </div>
      {PRESET.facets.map((attribute) =>
        attribute === 'color' ? (
          <ColorFacet key={attribute} attribute={attribute} />
        ) : (
          <Facet key={attribute} attribute={attribute} />
        )
      )}
    </aside>
  );
}
