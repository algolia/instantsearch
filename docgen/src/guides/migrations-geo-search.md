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

| Before               | After    |
| -------------------- | -------- |
| `paddingBoundingBox` | Removed  |

- `paddingBoundingBox` was in conflit with the `routing` option - so we removed it to support URLSync for the GeoSearch widget.

### connectGeoSearch

#### Options

| Before               | After    |
| -------------------- | -------- |
| `paddingBoundingBox` | Removed  |

- `paddingBoundingBox` was in conflit with the `routing` option - so we removed it to support URLSync for the GeoSearch widget.
