---
title: StateResults
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/StateResults.md
---

The StateResults widget allows you reach into the current search state, for example for conditional rendering or other rendering that depends on what the current refinement or results are.

<a class="btn btn-static-theme" href="stories/?selectedKind=ais-state-results">🕹 try out live</a>

## Usage

### custom "autocomplete"

StateResults can be used to put a conditional statement around the hits if there's a query.

```html
<div>
  <ais-search-box />
  <ais-state-results>
    <template slot-scope="{ query }">
      <ais-hits v-if="query">
        <h3
          slot="item"
          slot-scope="{ item }"
          :tabindex="0"
          @click="alert(item)"
          @keyup.enter="alert(item)"
        >
          <ais-highlight :hit="item" attribute="title"/>
        </h3>
      </ais-hits>
    </template>
  </ais-state-results>
</div>
```

### No results

StateResults can be used to put a conditional statement around a message to show if there are no results.

```html
<div>
  <ais-search-box />
  <ais-hits />
  <ais-state-results>
    <template slot-scope="{ query, hits }">
      <p v-if="hits.length === 0">
        No results found for the query: <q>{{ query }}</q>
      </p>
    </template>
  </ais-state-results>
</div>
```

## Banner from query rules

If you have a [query rule with userData](https://www.algolia.com/doc/guides/query-rules/query-rules-usage/#return-user-data) in it, you can use StateResults to get this user data as a banner.

```html
<div>
  <ais-search-box />
  <p>type "documentary"</p>
  <ais-state-results>
    <template slot-scope="{ userData }">
      <div>
        <img
          v-for="{ img } in userData"
          :key="img"
          :src="'https://example.com/images/' + img"
        />
      </div>
    </template>
  </ais-state-results>
</div>
```

## Props

This component does not accept any props.

## Slots

Name | Scope | Description
---|---|---
default | `{ "_rawResults", "query", "parsedQuery", "hits", "index", "hitsPerPage", "nbHits", "nbPages", "page", "processingTimeMS", "aroundLatLng", "automaticRadius", "serverUsed", "timeoutCounts", "timeoutHits", "exhaustiveFacetsCount", "exhaustiveNbHits", "userData", "queryID", "disjunctiveFacets", "hierarchicalFacets", "facets" }` | Slot to override the DOM output

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-StateResults` | The root div of the widget
