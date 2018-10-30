---
title: Hits
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/Hits.md
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
transformItems | `(items: object[]) => object[]` | `x => x` | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | -
class-names | Object | `{}` | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ items: Array<Item> }` | Slot to override the DOM output
item | `{ item: Item, index: Number }` | Slot to override the DOM output.

Where `Item` is a single hit with all its attribute, and `index` is the relative position on this page.

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-Hits` | Container class
`ais-Hits-list` | An item
`ais-Hits-item` | An item
