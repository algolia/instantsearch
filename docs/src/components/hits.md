---
title: Hits
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/hits.md
---

A component to format and render the search results.

<a class="btn btn-static-theme" href="stories/?selectedKind=Hits">🕹 try out live</a>

## Usage

When you want to override how a single item looks:

```html
<ais-hits>
  <template slot="item" slot-scope="{ item }">
    <h2>
      <a :href="item.url">
        {{ item.title }}
      </a>
    </h2>
    <p>{{ item.description }}</p>
  </template>
</ais-hits>
```

When you want to override the complete hits:

```html
<ais-hits>
  <template slot="default" slot-scope="{ items }">
    <div v-for="(item, itemIndex) in items" :key="itemIndex">
      <h2>
        <a :href="item.url">
          {{ item.title }}
        </a>
      </h2>
      <p>{{ item.description }}</p>
    </div>
  </template>
</ais-hits>
```

When you want to show something custom if there are no results:

```html
<ais-hits>
  <template slot="default" slot-scope="{ items }">
    <div v-if="items.length <= 0">
      No results found.
    </div>
    <div v-else v-for="(item, itemIndex) in items" :key="itemIndex">
      <h2>
        <a :href="item.url">
          {{ item.title }}
        </a>
      </h2>
      <p>{{ item.description }}</p>
    </div>
  </template>
</ais-hits>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
escapeHTML | Boolean | true | Escape raw HTML in the hits | no

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Class name | Description
---|---
`ais-Hits` | Container class
`ais-Hits-list` | An item
`ais-Hits-item` | An item
