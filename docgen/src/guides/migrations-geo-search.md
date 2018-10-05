---
title: Migration v3 - GeoSearch
mainTitle: Guides
layout: main.pug
category: guides
withHeadings: true
navWeight: 0
editable: true
githubSource: docgen/src/guides/migrations-geo-search.md
---

> TODO: move the content of the migration guide inside the v3 migration guide

### GeoSearch

#### Options

| Before                    | After                                                  |
| ------------------------- | ------------------------------------------------------ |
| `paddingBoundingBox`      | Removed                                                |
| `enableGeolocationWithIP` | Removed - use the Configure widget instead (see below) |
| `position`                | Removed - use the Configure widget instead (see below) |
| `radius`                  | Removed - use the Configure widget instead (see below) |
| `precision`               | Removed - use the Configure widget instead (see below) |

- `paddingBoundingBox` was in conflict with the `routing` option - so we removed it to support URLSync for the GeoSearch widget.

#### `enableGeolocationWithIP`

**Before:**

```javascript
instantsearch.widgets.geoSearch({
  googleReference: window.google,
  enableGeolocationWithIP: true,
  container,
});
```

**After:**

```javascript
instantsearch.widgets.configure({
  aroundLatLngViaIP: true,
});

instantsearch.widgets.geoSearch({
  googleReference: window.google,
  container,
});
```

#### `position`

**Before:**

```javascript
instantsearch.widgets.geoSearch({
  googleReference: window.google,
  position: { lat: 40.71, lng: -74.01 },
  container,
});
```

**After:**

```javascript
instantsearch.widgets.configure({
  aroundLatLng: '40.71, -74.01',
});

instantsearch.widgets.geoSearch({
  googleReference: window.google,
  container,
});
```

#### `radius`

**Before:**

```javascript
instantsearch.widgets.geoSearch({
  googleReference: window.google,
  radius: 1000,
  container,
});
```

**After:**

```javascript
instantsearch.widgets.configure({
  aroundRadius: 1000,
});

instantsearch.widgets.geoSearch({
  googleReference: window.google,
  container,
});
```

#### `precision`

**Before:**

```javascript
instantsearch.widgets.geoSearch({
  googleReference: window.google,
  precision: 1000,
  container,
});
```

**After:**

```javascript
instantsearch.widgets.configure({
  aroundPrecision: 1000,
});

instantsearch.widgets.geoSearch({
  googleReference: window.google,
  container,
});
```

### connectGeoSearch

#### Options

| Before                    | After                                                  |
| ------------------------- | ------------------------------------------------------ |
| `paddingBoundingBox`      | Removed                                                |
| `enableGeolocationWithIP` | Removed - use the Configure widget instead (see below) |
| `position`                | Removed - use the Configure widget instead (see below) |
| `radius`                  | Removed - use the Configure widget instead (see below) |
| `precision`               | Removed - use the Configure widget instead (see below) |

- `paddingBoundingBox` was in conflict with the `routing` option - so we removed it to support URLSync for the GeoSearch widget.

#### `enableGeolocationWithIP`

**Before:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

customGeoSearch({
  enableGeolocationWithIP: true,
});
```

**After:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

instantsearch.widgets.configure({
  aroundLatLngViaIP: true,
});

customGeoSearch();
```

#### `position`

**Before:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

customGeoSearch({
  position: { lat: 40.71, lng: -74.01 },
});
```

**After:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

instantsearch.widgets.configure({
  aroundLatLng: '40.71, -74.01',
});

customGeoSearch();
```

#### `radius`

**Before:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

customGeoSearch({
  radius: 1000,
});
```

**After:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

instantsearch.widgets.configure({
  aroundRadius: 1000,
});

customGeoSearch();
```

#### `precision`

**Before:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

customGeoSearch({
  precision: 1000,
});
```

**After:**

```javascript
const customGeoSearch = instantsearch.connectors.connectGeoSearch(() => {
  // Render implementation
});

instantsearch.widgets.configure({
  aroundPrecision: 1000,
});

customGeoSearch();
```
