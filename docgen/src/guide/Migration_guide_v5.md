---
title: Migration Guide - From v4 to v5
mainTitle: Guides
layout: main.pug
category: guide
navWeight: 10
---

React V5 introduces **a complete revamp of the HTML output of most widgets**. The goal of this release is to provide improved semantics to our users.

This release also introduces a **new CSS naming convention** which will be reused across all InstantSearch libraries. This will enable the possibility to develop cross-libraries CSS themes easily.

This guide will provide step-by-step migration information for each widget & connector.

## Table of contents

* [Migration steps](guide/Migration_guide_v5.html#migration-steps)
  * [Updating widget & connector names](guide/Migration_guide_v5.html#updating-widget-connector-names)
  * [Updating prop names](guide/Migration_guide_v5.html#updating-prop-names)
  * [Removing deprecation](guide/Migration_guide_v5.html#removing-deprecation)
  * [Updating styles](guide/Migration_guide_v5.html#updating-styles)
  * [Adding className](guide/Migration_guide_v5.html#adding-classname)
* [Widgets changes](guide/Migration_guide_v5.html#widgets-changes)
  * [InstantSearch](guide/Migration_guide_v5.html#instantsearch)
  * [Breadcrumb](guide/Migration_guide_v5.html#breadcrumb)
  * [ClearAll](guide/Migration_guide_v5.html#clearall)
  * [CurrentRefinements](guide/Migration_guide_v5.html#currentrefinements)
  * [HierarchicalMenu](guide/Migration_guide_v5.html#hierarchicalmenu)
  * [Highlight](guide/Migration_guide_v5.html#highlight)
  * [Hits](guide/Migration_guide_v5.html#hits)
  * [HitsPerPage](guide/Migration_guide_v5.html#hitsperpage)
  * [InfiniteHits](guide/Migration_guide_v5.html#infinitehits)
  * [Menu](guide/Migration_guide_v5.html#menu)
  * [MenuSelect](guide/Migration_guide_v5.html#menuselect)
  * [MultiRange](guide/Migration_guide_v5.html#multirange)
  * [Pagination](guide/Migration_guide_v5.html#pagination)
  * [Panel](guide/Migration_guide_v5.html#panel)
  * [PoweredBy](guide/Migration_guide_v5.html#poweredby)
  * [RangeInput](guide/Migration_guide_v5.html#rangeinput)
  * [RefinementList](guide/Migration_guide_v5.html#refinementlist)
  * [SearchBox](guide/Migration_guide_v5.html#searchBox)
  * [SortBy](guide/Migration_guide_v5.html#sortby)
  * [StarRating](guide/Migration_guide_v5.html#starrating)
  * [Stats](guide/Migration_guide_v5.html#stats)
  * [Toggle](guide/Migration_guide_v5.html#toggle)
* [Connectors changes](guide/Migration_guide_v5.html#connectors-changes)
  * [createConnector](guide/Migration_guide_v5.html#createconnector)
  * [connectCurrentRefinements](guide/Migration_guide_v5.html#connectcurrentrefinements)
  * [connectHierarchicalMenu](guide/Migration_guide_v5.html#connecthierarchicalmenu)
  * [connectHighlight](guide/Migration_guide_v5.html#connecthighlight)
  * [connectMenu](guide/Migration_guide_v5.html#connectmenu)
  * [connectMultiRange](guide/Migration_guide_v5.html#connectmultirange)
  * [connectPagination](guide/Migration_guide_v5.html#connectpagination)
  * [connectRange](guide/Migration_guide_v5.html#connectrange)
  * [connectRefinementList](guide/Migration_guide_v5.html#connectrefinementlist)
  * [connectToggle](guide/Migration_guide_v5.html#connecttoggle)

## Migration steps

### Updating widget & connector names

A few widgets & connectors have been renamed in order to improve the meaning as well as consistency between each InstantSearch library. You will need to **update your imports** to match new names.

Complete list of changes:

| Old name          | New name                |
| ----------------- | ----------------------- |
| ClearAll          | ClearRefinements        |
| MultiRange        | NumericMenu             |
| StarRating        | RatingMenu              |
| Toggle            | ToggleRefinement        |
| connectMultiRange | connectNumericMenu      |
| connectToggle     | connectToggleRefinement |

### Updating prop names

Some of the props has been renamed for a better consistency across the library. See below the list of all of them:

* `attributeName` → `attribute` (multiple widgets)
* `limitMin` → `limit` (HierarchicalMenu, Menu, RefinementList)
* `limitMax` → `showMoreLimit` (HierarchicalMenu, Menu, RefinementList)
* `maxPages` → `totalPages` (Pagination)
* `pagesPadding` → `padding` (Pagination)
* `title` → `header` (Panel)
* `submitComponent` → `submit` (SearchBox)
* `resetComponent` → `reset` (SearchBox)
* `loadingIndicatorComponent` → `loadingIndicator` (SearchBox)
* `withSearchBox` → `searchable` (Menu, RefinementList)

Please refer to [Widgets changes](guide/Migration_guide_v5.html#widgets-changes) & [Connectors changes](guide/Migration_guide_v5.html#connectors-changes) sections for more detail informations.

### Removing deprecation

We introduced a couple of months ago [a warning](https://github.com/algolia/react-instantsearch/commit/59d1cc41f0dc739c658c413a4310d72e64b6832e) about the usage of `searchForFacetValues` in favour of `searchForItems` & `withSearchBox` (now renamed `searchable`). This warning has been removed and so is the legacy API.Update your code if it's not already the case. See below for the list of changes:

* `searchForFacetValues` → `withSearchBox` → `searchable` (RefinementList, Menu)
* `searchForFacetValues` → `searchForItems` (createConnector, connectRefinementList, connectMenu)
* `searchParameters` → **removed** on `<InstantSearch>` in favour of `<Configure />`

Please refer to [Widgets changes](guide/Migration_guide_v5.html#widgets-changes) & [Connectors changes](guide/Migration_guide_v5.html#connectors-changes) sections for more detail informations.

### Updating styles

We are now making a unified theme for all InstantSearch versions, and React InstantSearch is the first to use it.
It's published as [instantsearch.css](https://yarn.pm/instansearch.css), and causes the deprecation and removal of `react-instantsearch-theme-algolia`.

Here is the new jsDelivr links for the theme:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/reset-min.css">

<!-- or -->

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@7.0.0/themes/algolia-min.css">
```

The `reset` theme is ship with the `algolia` one, so no need to import it when you are using the `algolia` theme.

You can also use `npm` to install it, please refer to the [Styling Widgets guide](guide/Styling_widgets.html#via-npm-webpack) for more informations.

The CSS naming convention used for widgets has been changed in favour of the [SUIT CSS](https://suitcss.github.io/) methodology.

In order to fix broken stylings, please refer to the **CSS naming equivalency table** of each widget in the [Widgets changes](guide/Migration_guide_v5.html#widgets-changes) section.

Two new CSS themes have also been written:

* reset.css
* algolia.css

We **strongly recommend** to use at least **reset.css** in order to neglect the visual side effects induced by the new semantic changes made on most widgets.

Please refer to the [Styling Widgets guide](guide/Styling_widgets.html) for more information on how to install and use those CSS themes.

### Adding className

All the built-in widgets now accept a prop `className` that will be forwarded to the root element of the widgets.

```js
<RefinementList
  className="MyCustomRefinementList"
  attribute="category"
/>

// Will produce a DOM with
<div className="ais-RefinementList MyCustomRefinementList">
  // content of the RefinementList
</div>
```

## Widgets changes

**Note**: the equivalency table only shows the replacement classes for existing classes. New CSS classes are also available. For more details, please refer to the [Widgets guide](widgets).

### InstantSearch

See [the widget](widgets/<InstantSearch>.html) documentation page.

#### Naming

No change.

#### Behaviour

* `searchParameters` → **removed** in favour of `<Configure />`

#### CSS classes equivalency table

No change.

### Breadcrumb

See [the widget](widgets/Breadcrumb.html) documentation page.

#### Naming

No change.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                  | New class name                                   |
| ------------------------------- | ------------------------------------------------ |
| `.ais-Breadcrumb__root`         | `.ais-Breadcrumb`                                |
| `.ais-Breadcrumb__itemLinkRoot` | **Removed**. Target with `:first-child` instead. |
| `.ais-Breadcrumb__rootLabel`    | **Removed**. Target with `:first-child` instead. |
| `.ais-Breadcrumb__item`         | `.ais-Breadcrumb-item`                           |
| `.ais-Breadcrumb__itemLink`     | `.ais-Breadcrumb-link`                           |
| `.ais-Breadcrumb__itemLabel`    | **Removed**. Use `.ais-Breadcrumb-link` instead. |
| `.ais-Breadcrumb__itemDisabled` | `.ais-Breadcrumb-item--selected`                 |
| `.ais-Breadcrumb__separator`    | `.ais-Breadcrumb-separator`                      |
| `.ais-Breadcrumb__noRefinement` | `.ais-Breadcrumb--noRefinement`                  |

### ClearAll

See [the widget](widgets/ClearRefinements.html) documentation page.

#### Naming

Renamed to **ClearRefinements**.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name        | New class name                 |
| --------------------- | ------------------------------ |
| `.ais-ClearAll__root` | `.ais-ClearRefinements-button` |

### CurrentRefinements

See [the widget](widgets/CurrentRefinements.html) documentation page.

#### Naming

No change.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                          | New class name                          |
| --------------------------------------- | --------------------------------------- |
| `.ais-CurrentRefinements__root`         | `.ais-CurrentRefinements`               |
| `.ais-CurrentRefinements__items`        | `.ais-CurrentRefinements-list`          |
| `.ais-CurrentRefinements__item`         | `.ais-CurrentRefinements-item`          |
| `.ais-CurrentRefinements__itemLabel`    | `.ais-CurrentRefinements-label`         |
| `.ais-CurrentRefinements__itemClear`    | `.ais-CurrentRefinements-delete`        |
| `.ais-CurrentRefinements__noRefinement` | `.ais-CurrentRefinements--noRefinement` |

### HierarchicalMenu

See [the widget](widgets/HierarchicalMenu.html) documentation page.

#### Naming

* `limitMin` → `limit`
* `limitMax` → `showMoreLimit`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                              | New class name                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `.ais-HierarchicalMenu__root`               | `.ais-HierarchicalMenu`                                                                            |
| `.ais-HierarchicalMenu__items`              | `.ais-HierarchicalMenu-list`                                                                       |
| `.ais-HierarchicalMenu__item`               | `.ais-HierarchicalMenu-item`                                                                       |
| `.ais-HierarchicalMenu__itemSelected`       | `.ais-HierarchicalMenu-item--selected`                                                             |
| `.ais-HierarchicalMenu__itemParent`         | `.ais-HierarchicalMenu-item--parent`                                                               |
| `.ais-HierarchicalMenu__itemSelectedParent` | **Removed**. Use `.ais-HierarchicalMenu-item--selected.ais-HierarchicalMenu-item--parent` instead. |
| `.ais-HierarchicalMenu__itemLink`           | `.ais-HierarchicalMenu-link`                                                                       |
| `.ais-HierarchicalMenu__itemLabel`          | `.ais-HierarchicalMenu-label`                                                                      |
| `.ais-HierarchicalMenu__itemCount`          | `.ais-HierarchicalMenu-count`                                                                      |
| `.ais-HierarchicalMenu__itemItems`          | `.ais-HierarchicalMenu-list--child`                                                                |
| `.ais-HierarchicalMenu__showMore`           | `.ais-HierarchicalMenu-showMore`                                                                   |
| `.ais-HierarchicalMenu__noRefinement`       | `.ais-HierarchicalMenu--noRefinement`                                                              |

### Highlight

See [the widget](widgets/Highlight.html) documentation page.

#### Naming

* `attributeName` → `attribute`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                   | New class name                  |
| -------------------------------- | ------------------------------- |
| `.ais-Highlight`                 | **No change**.                  |
| `.ais-Highlight__highlighted`    | `.ais-Highlight-highlighted`    |
| `.ais-Highlight__nonHighlighted` | `.ais-Highlight-nonHighlighted` |

### Hits

See [the widget](widgets/Hits.html) documentation page.

#### Naming

No change.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name    | New class name |
| ----------------- | -------------- |
| `.ais-Hits__root` | `.ais-Hits`    |

### HitsPerPage

See [the widget](widgets/HitsPerPage.html) documentation page.

#### Naming

No change.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name           | New class name     |
| ------------------------ | ------------------ |
| `.ais-HitsPerPage__root` | `.ais-HitsPerPage` |

### InfiniteHits

See [the widget](widgets/InfiniteHits.html) documentation page.

#### Naming

No change.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name            | New class name      |
| ------------------------- | ------------------- |
| `.ais-InfiniteHits__root` | `.ais-InfiniteHits` |

### Menu

See [the widget](widgets/Menu.html) documentation page.

#### Naming

* `attributeName` → `attribute`
* `limitMin` → `limit`
* `limitMax` → `showMoreLimit`
* `withSearchBox` → `searchable`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                 | New class name                                                       |
| ------------------------------ | -------------------------------------------------------------------- |
| `.ais-Menu__root`              | `.ais-Menu`                                                          |
| `.ais-Menu__items`             | `.ais-Menu-list`                                                     |
| `.ais-Menu__item`              | `.ais-Menu-item`                                                     |
| `.ais-Menu__itemLinkSelected`  | **Removed**. Use `.ais-Menu-item--selected .ais-Menu-link` instead.  |
| `.ais-Menu__itemLink`          | `.ais-Menu-link`                                                     |
| `.ais-Menu__itemLabelSelected` | **Removed**. Use `.ais-Menu-item--selected .ais-Menu-label` instead. |
| `.ais-Menu__itemLabel`         | `.ais-Menu-label`                                                    |
| `.ais-Menu__itemCount`         | `.ais-Menu-count`                                                    |
| `.ais-Menu__itemCountSelected` | **Removed**. Use `.ais-Menu-item--selected .ais-Menu-count` instead. |
| `.ais-Menu__showMore`          | `.ais-Menu-showMore`                                                 |
| `.ais-Menu__SearchBox`         | `.ais-Menu-searchBox`                                                |
| `.ais-Menu__noRefinement`      | `.ais-Menu--noRefinement`                                            |

### MenuSelect

See [the widget](widgets/MenuSelect.html) documentation page.

#### Naming

* `attributeName` → `attribute`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name            | New class name           |
| ------------------------- | ------------------------ |
| `.ais-MenuSelect__select` | `.ais-MenuSelect-select` |
| `.ais-MenuSelect__option` | `.ais-MenuSelect-option` |

### MultiRange

See [the widget](widgets/NumericMenu.html) documentation page.

#### Naming

Renamed to **NumericMenu**.

* `attributeName` → `attribute`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                       | New class name                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `.ais-MultiRange__root`              | `.ais-NumericMenu`                                                                 |
| `.ais-MultiRange__items`             | `.ais-NumericMenu-list`                                                            |
| `.ais-MultiRange__item`              | `.ais-NumericMenu-item`                                                            |
| `.ais-MultiRange__itemSelected`      | `.ais-NumericMenu-item--selected`                                                  |
| `.ais-MultiRange__itemLabel`         | `.ais-NumericMenu-label`                                                           |
| `.ais-MultiRange__itemLabelSelected` | **Removed**. Use `.ais-NumericMenu-item--selected .ais-NumericMenu-label` instead. |
| `.ais-MultiRange__itemRadio`         | `.ais-NumericMenu-radio`                                                           |
| `.ais-MultiRange__itemRadioSelected` | **Removed**. Use `.ais-NumericMenu-item--selected .ais-NumericMenu-radio` instead. |
| `.ais-MultiRange__noRefinement`      | `.ais-NumericMenu--noRefinement`                                                   |
| `.ais-MultiRange__itemNoRefinement`  | `.ais-NumericMenu-item--noRefinement`                                              |
| `.ais-MultiRange__itemAll`           | **Removed**.                                                                       |

### Pagination

See [the widget](widgets/Pagination.html) documentation page.

#### Naming

* `maxPages` → `totalPages`
* `pagesPadding` → `padding`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                  | New class name                       |
| ------------------------------- | ------------------------------------ |
| `.ais-Pagination__root`         | `.ais-Pagination`                    |
| `.ais-Pagination__item`         | `.ais-Pagination-item`               |
| `.ais-Pagination__itemFirst`    | `.ais-Pagination-item--firstPage`    |
| `.ais-Pagination__itemPrevious` | `.ais-Pagination-item--previousPage` |
| `.ais-Pagination__itemPage`     | `.ais-Pagination-item--page`         |
| `.ais-Pagination__itemNext`     | `.ais-Pagination-item--nextPage`     |
| `.ais-Pagination__itemLast`     | `.ais-Pagination-item--lastPage`     |
| `.ais-Pagination__itemDisabled` | `.ais-Pagination-item--disabled`     |
| `.ais-Pagination__itemSelected` | `.ais-Pagination-item--selected`     |
| `.ais-Pagination__itemLink`     | `.ais-Pagination-link`               |
| `.ais-Pagination__noRefinement` | `.ais-Pagination--noRefinement`      |

### Panel

See [the widget](widgets/Panel.html) documentation page.

#### Naming

* `title` → `header`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name             | New class name             |
| -------------------------- | -------------------------- |
| `.ais-Panel__root`         | `.ais-Panel`               |
| `.ais-Panel__title`        | **Removed**.               |
| `.ais-Panel__noRefinement` | `.ais-Panel--noRefinement` |

### PoweredBy

See [the widget](widgets/PoweredBy.html) documentation page.

#### Naming

No change.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                | New class name        |
| ----------------------------- | --------------------- |
| `.ais-PoweredBy__root`        | `.ais-PoweredBy`      |
| `.ais-PoweredBy__searchBy`    | `.ais-PoweredBy-text` |
| `.ais-PoweredBy__algoliaLink` | `.ais-PoweredBy-link` |

### RangeInput

See [the widget](widgets/RangeInput.html) documentation page.

#### Naming

* `attributeName` → `attribute`

#### Behaviour

The default `precision` previously `2` has been updated to `0`.

#### CSS classes equivalency table

| Old class name                  | New class name                  |
| ------------------------------- | ------------------------------- |
| `.ais-RangeInput__root`         | `.ais-RangeInput`               |
| `.ais-RangeInput__labelMin`     | **Removed**.                    |
| `.ais-RangeInput__inputMin`     | `.ais-RangeInput-input--min`    |
| `.ais-RangeInput__separator`    | `.ais-RangeInput-separator`     |
| `.ais-RangeInput__labelMax`     | **Removed**.                    |
| `.ais-RangeInput__inputMax`     | `.ais-RangeInput-input--max`    |
| `.ais-RangeInput__submit`       | `.ais-RangeInput-submit`        |
| `.ais-RangeInput__noRefinement` | `.ais-RangeInput--noRefinement` |

### RefinementList

See [the widget](widgets/RefinementList.html) documentation page.

#### Naming

* `attributeName` → `attribute`
* `limitMin` → `limit`
* `limitMax` → `showMoreLimit`
* `withSearchBox` → `searchable`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                              | New class name                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `.ais-RefinementList__root`                 | `.ais-RefinementList`                                                                       |
| `.ais-RefinementList__items`                | `.ais-RefinementList-list`                                                                  |
| `.ais-RefinementList__item`                 | `.ais-RefinementList-item`                                                                  |
| `.ais-RefinementList__itemSelected`         | `.ais-RefinementList-item--selected`                                                        |
| `.ais-RefinementList__itemCheckbox`         | `.ais-RefinementList-checkbox`                                                              |
| `.ais-RefinementList__itemCheckboxSelected` | **Removed**. Use `.ais-RefinementList-item--selected .ais-RefinementList-checkbox` instead. |
| `.ais-RefinementList__itemLabel`            | `.ais-RefinementList-label`                                                                 |
| `.ais-RefinementList__itemLabelSelected`    | **Removed**. Use `.ais-RefinementList-item--selected .ais-RefinementList-label` instead.    |
| `.ais-RefinementList__itemCount`            | `.ais-RefinementList-count`                                                                 |
| `.ais-RefinementList__itemCountSelected`    | **Removed**. Use `.ais-RefinementList-item--selected .ais-RefinementList-count` instead.    |
| `.ais-RefinementList__showMore`             | `.ais-RefinementList-showMore`                                                              |
| `.ais-RefinementList__SearchBox`            | `.ais-RefinementList-searchBox`                                                             |
| `.ais-RefinementList__noRefinement`         | `.ais-RefinementList--noRefinement`                                                         |

<h3 id="searchBox">
  <!-- Avoid conflict with docsearch id -->
  SearchBox <a class="anchor" href="guide/Migration_guide_v5.html#searchBox" aria-hidden="true"></a>
</h3>

See [the widget](widgets/SearchBox.html) documentation page.

#### Naming

* `submitComponent` → `submit`
* `resetComponent` → `reset`
* `loadingIndicatorComponent` → `loadingIndicator`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                      | New class name                    |
| ----------------------------------- | --------------------------------- |
| `.ais-SearchBox__root`              | `.ais-SearchBox`                  |
| `.ais-SearchBox__wrapper`           | `.ais-SearchBox-form`             |
| `.ais-SearchBox__input`             | `.ais-SearchBox-input`            |
| `.ais-SearchBox__submit`            | `.ais-SearchBox-submit`           |
| `.ais-SearchBox__reset`             | `.ais-SearchBox-reset`            |
| `.ais-SearchBox__loading-indicator` | `.ais-SearchBox-loadingIndicator` |

### SortBy

See [the widget](widgets/SortBy.html) documentation page.

#### Naming

No change.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name      | New class name |
| ------------------- | -------------- |
| `.ais-SortBy__root` | `.ais-SortBy`  |

### StarRating

See [the widget](widgets/RatingMenu.html) documentation page.

#### Naming

Renamed to **RatingMenu**.

* `attributeName` → `attribute`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name                             | New class name                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `.ais-StarRating__root`                    | `.ais-RatingMenu`                                                                          |
| `.ais-StarRating__ratingLink`              | `.ais-RatingMenu-link`                                                                     |
| `.ais-StarRating__ratingLinkSelected`      | **Removed**. Use `.ais-RatingMenu-item--selected .ais-RatingMenu-link` instead.            |
| `.ais-StarRating__ratingLinkDisabled`      | **Removed**. Use `.ais-RatingMenu-item--disabled .ais-RatingMenu-link` instead.            |
| `.ais-StarRating__ratingIcon`              | `.ais-RatingMenu-starIcon`                                                                 |
| `.ais-StarRating__ratingIconSelected`      | **Removed**. Use `.ais-RatingMenu-item--selected .ais-RatingMenu-starIcon` instead.        |
| `.ais-StarRating__ratingIconDisabled`      | **Removed**. Use `.ais-RatingMenu-item--disabled .ais-RatingMenu-starIcon` instead.        |
| `.ais-StarRating__ratingIconEmpty`         | `.ais-RatingMenu-starIcon--empty`                                                          |
| `.ais-StarRating__ratingIconEmptySelected` | **Removed**. Use `.ais-RatingMenu-item--selected .ais-RatingMenu-starIcon--empty` instead. |
| `.ais-StarRating__ratingIconEmptyDisabled` | **Removed**. Use `.ais-RatingMenu-item--disabled .ais-RatingMenu-starIcon--empty` instead. |
| `.ais-StarRating__ratingLabel`             | `.ais-RatingMenu-label`                                                                    |
| `.ais-StarRating__ratingLabelSelected`     | **Removed**. Use `.ais-RatingMenu-item--selected .ais-RatingMenu-label` instead.           |
| `.ais-StarRating__ratingLabelDisabled`     | **Removed**. Use `.ais-RatingMenu-item--disabled .ais-RatingMenu-label` instead.           |
| `.ais-StarRating__ratingCount`             | `.ais-RatingMenu-count`                                                                    |
| `.ais-StarRating__ratingCountSelected`     | **Removed**. Use `.ais-RatingMenu-item--selected .ais-RatingMenu-count` instead.           |
| `.ais-StarRating__ratingCountDisabled`     | **Removed**. Use `.ais-RatingMenu-item--disabled .ais-RatingMenu-count` instead.           |

### Stats

See [the widget](widgets/Stats.html) documentation page.

#### Naming

No change.

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name     | New class name    |
| ------------------ | ----------------- |
| `.ais-Stats__root` | `.ais-Stats-text` |

### Toggle

See [the widget](widgets/ToggleRefinement.html) documentation page.

#### Naming

Renamed to **ToggleRefinement**.

* `attributeName` → `attribute`

#### Behaviour

No change.

#### CSS classes equivalency table

| Old class name          | New class name         |
| ----------------------- | ---------------------- |
| `.ais-Toggle__root`     | `.ais-Toggle`          |
| `.ais-Toggle__checkbox` | `.ais-Toggle-checkbox` |
| `.ais-Toggle__label`    | `.ais-Toggle-label`    |

## Connectors changes

### createConnector

See [the connector](guide/Custom_connectors.html) documentation page.

#### Naming

* `searchForFacetValues` → `searchForItems`

#### Behaviour

No change.

### connectCurrentRefinements

See [the connector](connectors/connectCurrentRefinements.html) documentation page.

#### Naming

The property `attributeName` in the provided props `items` has been renamed `attribute`.

#### Behaviour

No change.

### connectHierarchicalMenu

See [the connector](connectors/connectHierarchicalMenu.html) documentation page.

#### Naming

* `limitMin` → `limit`
* `limitMax` → `showMoreLimit`

#### Behaviour

No change.

### connectHighlight

See [the connector](connectors/connectHighlight.html) documentation page.

#### Naming

The property `attributeName` in the provided props `highlight` has been renamed `attribute`.

#### Behaviour

No change.

### connectMenu

See [the connector](connectors/connectMenu.html) documentation page.

#### Naming

* `attributeName` → `attribute`
* `limitMin` → `limit`
* `limitMax` → `showMoreLimit`
* `withSearchBox` → `searchable`
* `searchForFacetValues` → `searchForItems`

#### Behaviour

No change.

### connectMultiRange

See [the connector](connectors/connectNumericMenu.html) documentation page.

#### Naming

Renamed to **connectNumericMenu**.

* `attributeName` → `attribute`

#### Behaviour

No change.

### connectPagination

See [the connector](connectors/connectPagination.html) documentation page.

#### Naming

* `maxPages` → `totalPages`
* `pagesPadding` → `padding`

#### Behaviour

No change.

### connectRange

See [the connector](connectors/connectRange.html) documentation page.

#### Naming

* `attributeName` → `attribute`

#### Behaviour

The default `precision` previously `2` has been updated to `0`.

### connectRefinementList

See [the connector](connectors/connectRefinementList.html) documentation page.

#### Naming

* `attributeName` → `attribute`
* `limitMin` → `limit`
* `limitMax` → `showMoreLimit`
* `withSearchBox` → `searchable`
* `searchForFacetValues` → `searchForItems`

#### Behaviour

No change.

### connectToggle

See [the connector](connectors/connectToggleRefinement.html) documentation page.

#### Naming

Renamed to **connectToggleRefinement**.

* `attributeName` → `attribute`

#### Behaviour

No change.

<div class="guide-nav">
    <div class="guide-nav-left">
        Previous: <a href="guide/Migration_guide_v4.html">← Migration Guide - From v3 to v4</a>
    </div>
</div>
