---
title: RefinementList
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 6
editable: true
githubSource: docs/src/components/RefinementList.md
---

A refinement list takes all possible values for a certain attribute and puts them in a list. A user is then able to pick one or multiple refinements for this attribute. It's also possible to search within the possible values of this attribute. Make sure that your attribute of choice is set up in `attributesForFaceting`, `searchable` if you want so.

<a class="btn btn-static-theme" href="stories/?selectedKind=RefinementList">🕹 try out live</a>

## Usage

```html
<ais-refinement-list :attribute="brands"></ais-refinement-list>
```

## Props

Name | Type | Default | Description | Required
---|---|---|---|---
attribute | string | | The attribute to refine on click | yes
searchable | boolean | `false` | You can also search within the options of this | no
operator | "or" / "and" | "or" | How to apply refinements | no
limit | number | 10 | Number of items to show | no
showMoreLimit | number | 20 | Number of items to show when the user clicked on “show more items” | no
showMore | boolean | false | Whether or not to have the option to load more values | no
sortBy | array / sort function | `['isRefined:desc', 'count:desc', 'name:asc']` | array or function to sort the results by | no
transformItems | `(items: object[]) => object[]` | | Function which receives the items, which will be called before displaying them. Should return a new array with the same shape as the original array. Useful for mapping over the items to transform, remove or reorder them | no
classNames | Object | | Override class names | no

## Slots

Name | Scope | Description
---|---|---
default | `{ items: Array, refine: Function, searchable: Boolean, searchForItems: Function, isFromSearch: Boolean, toggleShowMore: Function, isShowingMore: Boolean, createURL: Function, canRefine: Boolean, noRefinement: Boolean }` | Slot to override the DOM output
item | `{ value: String, label: String, count: Number, isRefined: Boolean, highlighted }` | Slot to override the DOM of a single item in the list
showMoreLabel | `{ isShowingMore: Boolean }` | Slot to override the text shown in the "show more" button
noResults | `{ query: String }` | Slot to override the text shown when "searchable" is true and there are no results

Note that if you override the default or item slot, and you still want highlighting when `searchable` is enabled, you should use [ais-highlight](./highlight) to have this feature: 

```html
<ais-refinement-list attribute="brand" searchable>
  <template name="item" slot-scope="{ item }">
    <ais-highlight attribute="item" :hit="item"/>
  </template>
<ais-refinement-list>
```

## CSS classes

Here's a list of CSS classes exposed by this widget. To better understand the underlying
DOM structure, have a look at the generated DOM in your browser.

Note that you can pass the prop `class-names`, with an object of class names and their replacement to override this.

Class name | Description
---|---
`ais-RefinementList` | Container class
`ais-RefinementList--noRefinement` | Container, if no refinement is possible
`ais-RefinementList-list` | The list of possible refinements
`ais-RefinementList-item` | A refinement item
`ais-RefinementList-label` | A refinement item's label
`ais-RefinementList-labelText` | A refinement item's label text
`ais-RefinementList-checkbox` | A refinement item's checkbox
`ais-RefinementList-count` | A refinement item's number of matches
`ais-RefinementList-item--selected` | Selected item
`ais-RefinementList-searchBox` | The search box when `searchable` is true
`ais-RefinementList-noResults` | In place of the refinement options when the search for facet values didn't return any values
`ais-RefinementList-showMore` | The show more button when `show-more` is true
`ais-RefinementList-showMore--disabled` | The show more button when `show-more` is true and it's not possible to be clicked

