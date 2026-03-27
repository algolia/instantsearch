import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { history } from 'instantsearch.js/es/lib/routers';
import React, { useState } from 'react';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  DynamicWidgets,
  Configure,
  DynamicWidgetsV2,
  DynamicWidgetsV2Composed,
  HierarchicalMenu,
  Menu,
  ClearRefinements,
} from 'react-instantsearch';

import type { WidgetDescriptor } from 'instantsearch.js/es/connectors/dynamic-facets/connectDynamicFacets';

import 'instantsearch.css/themes/satellite.css';
import './App.css';

// ---------------------------------------------------------------------------
// Configuration — real Algolia index
// ---------------------------------------------------------------------------

// After running `node seed-index.mjs`, replace these with your own credentials.
const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '93aba0bf5908533b213d93b2410ded0c'
);

const INDEX_NAME = 'dynamic_facets_v2_poc';

// ---------------------------------------------------------------------------
// V1 Fallback component — instantiates a full <RefinementList> per facet
// ---------------------------------------------------------------------------

function V1FallbackComponent({ attribute }: { attribute: string }) {
  if (attribute.startsWith('hierarchicalCategories')) {
    if (attribute !== 'hierarchicalCategories.lvl0') {
      return null; // Only render the first level as a facet, the others are rendered as part of the hierarchical menu
    }
    return (
      <div className="facet-panel">
        <h3 className="facet-title">{attribute}</h3>
        <HierarchicalMenu
          attributes={[
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ]}
          limit={5}
          showMoreLimit={20}
        />
      </div>
    );
  }

  if (attribute === 'brand') {
    return (
      <div className="facet-panel">
        <h3 className="facet-title">{attribute}</h3>
        <Menu attribute={attribute} limit={5} showMoreLimit={20} />
      </div>
    );
  }

  return (
    <div className="facet-panel">
      <h3 className="facet-title">{attribute}</h3>
      <RefinementList attribute={attribute} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// The widgets function (the v2 public API)
// ---------------------------------------------------------------------------

const widgetsFn = (attribute: string): WidgetDescriptor | false => {
  // Everything is a refinement list for this demo
  if (attribute.startsWith('hierarchicalCategories')) {
    if (attribute !== 'hierarchicalCategories.lvl0') {
      return false; // Only render the first level as a facet, the others are rendered as part of the hierarchical menu
    }
    return {
      type: 'hierarchicalMenu',
      limit: 5,
      showMoreLimit: 20,
      attributes: [
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ],
    };
  }

  if (attribute === 'brand') {
    return { type: 'menu', limit: 5, showMoreLimit: 20 };
  }

  return { type: 'refinementList', limit: 5, showMoreLimit: 20 };
};

// Stable reference to avoid re-renders
const stableWidgetsFn = widgetsFn;

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function App() {
  const [mode, setMode] = useState<'v2' | 'v2-composed' | 'v1' | 'none'>(
    'none'
  );
  const [maxFacets, setMaxFacets] = useState(10);

  return (
    <div className="app">
      <header className="header">
        <h1>DynamicWidgets v2 — PoC</h1>
        <p>
          Compare the v2 shared-store approach vs v1 per-widget approach.
          <br />
          Using real Algolia index: <code>{INDEX_NAME}</code>
        </p>
        <div className="controls">
          <button
            className={mode === 'v2' ? 'active' : ''}
            onClick={() => setMode('v2')}
          >
            🚀 V2 (monolithic)
          </button>
          <button
            className={mode === 'v2-composed' ? 'active' : ''}
            onClick={() => setMode('v2-composed')}
          >
            🧩 V2 (composed)
          </button>
          <button
            className={mode === 'v1' ? 'active' : ''}
            onClick={() => setMode('v1')}
          >
            🐌 V1 (per-widget)
          </button>
          <button
            className={mode === 'none' ? 'active' : ''}
            onClick={() => setMode('none')}
          >
            None
          </button>
          <label style={{ marginLeft: 16 }}>
            Max facets to render:{' '}
            <select
              value={maxFacets}
              onChange={(e) => setMaxFacets(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </label>
        </div>
      </header>

      <div className="main">
        {mode === 'none' && (
          <div className="placeholder">
            <p>Select V1 or V2 above to render facets.</p>
            <p>
              <strong>V2</strong> uses a single connector for all facets (the
              RFC approach).
              <br />
              <strong>V1</strong> mounts a separate{' '}
              <code>&lt;RefinementList&gt;</code> widget per facet (current
              behavior).
            </p>
          </div>
        )}

        {mode === 'v2' && (
          <InstantSearch
            key="v2"
            searchClient={searchClient}
            indexName={INDEX_NAME}
            routing={{
              router: history({
                cleanUrlOnDispose: false,
              }),
            }}
          >
            <Configure hitsPerPage={20} />
            <div className="search-layout">
              <div className="sidebar">
                <SearchBox placeholder="Search..." />
                <div className="facets-container">
                  <ClearRefinements />
                  <DynamicWidgetsV2
                    widgets={stableWidgetsFn}
                    facets={['*']}
                    maxValuesPerFacet={20}
                    transformItems={(items) => items.slice(0, maxFacets)}
                  />
                  {/* Zero-config: no fallbackComponent needed! Built-in
                      renderers handle refinementList, menu, hierarchicalMenu
                      automatically based on descriptor types. */}
                </div>
              </div>
              <div className="results">
                <Hits
                  hitComponent={({ hit }: any) => (
                    <div className="hit-item">
                      <strong>{hit.name || hit.title || hit.objectID}</strong>
                      {hit.description && <p>{hit.description}</p>}
                    </div>
                  )}
                />
              </div>
            </div>
          </InstantSearch>
        )}

        {mode === 'v2-composed' && (
          <InstantSearch
            key="v2-composed"
            searchClient={searchClient}
            indexName={INDEX_NAME}
            routing={{
              router: history({
                cleanUrlOnDispose: false,
              }),
            }}
          >
            <Configure hitsPerPage={20} />
            <div className="search-layout">
              <div className="sidebar">
                <SearchBox placeholder="Search..." />
                <div className="facets-container">
                  <ClearRefinements />
                  <DynamicWidgetsV2Composed
                    widgets={stableWidgetsFn}
                    facets={['*']}
                    maxValuesPerFacet={20}
                    transformItems={(items) => items.slice(0, maxFacets)}
                  />
                </div>
              </div>
              <div className="results">
                <Hits
                  hitComponent={({ hit }: any) => (
                    <div className="hit-item">
                      <strong>{hit.name || hit.title || hit.objectID}</strong>
                      {hit.description && <p>{hit.description}</p>}
                    </div>
                  )}
                />
              </div>
            </div>
          </InstantSearch>
        )}

        {mode === 'v1' && (
          <InstantSearch
            key="v1"
            searchClient={searchClient}
            indexName={INDEX_NAME}
            routing={{
              router: history({
                cleanUrlOnDispose: false,
              }),
            }}
          >
            <Configure hitsPerPage={20} />
            <div className="search-layout">
              <div className="sidebar">
                <SearchBox placeholder="Search..." />
                <div className="facets-container">
                  <ClearRefinements />
                  <DynamicWidgets
                    facets={['*']}
                    maxValuesPerFacet={20}
                    fallbackComponent={V1FallbackComponent}
                    transformItems={(items) => items.slice(0, maxFacets)}
                  />
                </div>
              </div>
              <div className="results">
                <Hits
                  hitComponent={({ hit }: any) => (
                    <div className="hit-item">
                      <strong>{hit.name || hit.title || hit.objectID}</strong>
                      {hit.description && <p>{hit.description}</p>}
                    </div>
                  )}
                />
              </div>
            </div>
          </InstantSearch>
        )}
      </div>
    </div>
  );
}
