This document helps you migrate from InstantSearch 2 to InstantSearch 3.

InstantSearch 3 introduces some breaking changes in the widget's naming, options and markup.

## Widgets

### MenuSelect

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |

#### CSS classes

| Before                    | After                   |
| ------------------------- | ----------------------- |
| `ais-menu-select`         | `ais-MenuSelect`        |
| `ais-menu-select--select` | `ais-MenuSelect-select` |
| `ais-menu-select--option` | `ais-MenuSelect-option` |
| `ais-menu-select--header` |                         |
| `ais-menu-select--footer` |                         |

#### Markup

```html
<div class="ais-MenuSelect">
  <select class="ais-MenuSelect-select">
    <option class="ais-MenuSelect-option" value="Most relevant">Appliances (4306)</option>
    <option class="ais-MenuSelect-option" value="Lowest price">Audio (1570)</option>
  </select>
</div>
```

## Connectors

### ConnectMenu

#### Options

| Before          | After       |
| --------------- | ----------- |
| `attributeName` | `attribute` |
