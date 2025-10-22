# Migration Guide: v1.x to v2.x

This guide will help you migrate from version 1.x (React InstantSearch v6) to version 2.x (React InstantSearch v7).

## Overview

Version 2.0.0 migrates the widget to React InstantSearch v7, which introduces breaking changes in the underlying framework. However, the widget API itself remains unchanged, making the migration straightforward.

## Breaking Changes

- **React InstantSearch**: Now requires `react-instantsearch` v7.x (previously `react-instantsearch-dom` v6.x)
- **React Version**: Minimum version is now 16.8.0 (previously 16.3.0) due to Hooks requirement
- **Peer Dependencies**: `react-instantsearch-dom` is replaced by `react-instantsearch`

## Migration Steps

### Step 1: Update Dependencies

Update your project dependencies to use React InstantSearch v7:

```bash
npm install react-instantsearch@^7.0.0 @algolia/react-instantsearch-widget-color-refinement-list@^2.0.0
# or
yarn add react-instantsearch@^7.0.0 @algolia/react-instantsearch-widget-color-refinement-list@^2.0.0
```

### Step 2: Update Imports

Update all imports from `react-instantsearch-dom` to `react-instantsearch`:

**Before (v1.x):**
```tsx
import { InstantSearch, SearchBox, Hits, Panel } from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';
```

**After (v2.x):**
```tsx
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
```

### Step 3: Update Search Client Initialisation

The search client initialisation pattern has changed slightly:

**Before (v1.x):**
```tsx
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch('YourApplicationID', 'YourSearchOnlyAPIKey');
```

**After (v2.x):**
```tsx
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const searchClient = algoliasearch('YourApplicationID', 'YourSearchOnlyAPIKey');
```

### Step 4: Widget Usage (No Changes Required)

Good news! The `ColorRefinementList` widget API remains completely unchanged:

```tsx
<ColorRefinementList
  attribute="color"
  separator=";"
  layout={Layout.Grid}
  shape={Shape.Circle}
  sortByColor={true}
  limit={10}
  showMore={true}
  showMoreLimit={20}
  translations={{
    refineOn: (value: string) => `Refine on ${value}`,
    colors: (refinedCount: number) => `Colors${refinedCount ? `, ${refinedCount} selected` : ''}`,
    showMore: (expanded: boolean) => expanded ? 'Show less' : 'Show more',
  }}
/>
```

## Complete Example

Here's a complete before/after comparison:

### Before (v1.x with React InstantSearch v6)

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { InstantSearch, SearchBox, Hits, Panel } from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';
import {
  ColorRefinementList,
  Layout,
  Shape,
} from '@algolia/react-instantsearch-widget-color-refinement-list';

const searchClient = algoliasearch('appId', 'apiKey');

function App() {
  return (
    <InstantSearch indexName="products" searchClient={searchClient}>
      <Panel header="Colors">
        <ColorRefinementList
          attribute="color"
          separator=";"
          layout={Layout.Grid}
          shape={Shape.Circle}
        />
      </Panel>
      <SearchBox />
      <Hits />
    </InstantSearch>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

### After (v2.x with React InstantSearch v7)

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  ColorRefinementList,
  Layout,
  Shape,
} from '@algolia/react-instantsearch-widget-color-refinement-list';

const searchClient = algoliasearch('appId', 'apiKey');

function App() {
  return (
    <InstantSearch indexName="products" searchClient={searchClient}>
      <div>
        <h3>Colors</h3>
        <ColorRefinementList
          attribute="color"
          separator=";"
          layout={Layout.Grid}
          shape={Shape.Circle}
        />
      </div>
      <SearchBox />
      <Hits />
    </InstantSearch>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
```

## Notes

- **Panel Component**: React InstantSearch v7 doesn't include a `Panel` component. You can create a simple wrapper component or use a `div` with styling.
- **React 18**: The example uses `createRoot` from React 18. If you're using React 16 or 17, continue using `ReactDOM.render`.

## Troubleshooting

### Type Errors with `algoliasearch`

If you encounter TypeScript errors with the import:

```tsx
// Use this import pattern
import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Not this
import algoliasearch from 'algoliasearch/lite';
```

### Missing Components

Some components from `react-instantsearch-dom` may not be available in `react-instantsearch`. Refer to the [React InstantSearch v7 documentation](https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/) for alternatives.

## Additional Resources

- [React InstantSearch v7 Migration Guide](https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/)
- [React InstantSearch v7 Documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)
- [Widget API Reference](https://github.com/algolia/react-instantsearch-widget-color-refinement-list#options)

## Need Help?

If you encounter issues during migration:

1. Check the [FAQ](https://www.algolia.com/doc/guides/building-search-ui/troubleshooting/faq/react/)
2. Review [existing issues](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues)
3. [Open a new issue](https://github.com/algolia/react-instantsearch-widget-color-refinement-list/issues/new) with details about your problem
