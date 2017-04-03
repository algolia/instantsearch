Vue Algolia Price Range Facet
---

A component that lets users filter results based on a given minimum and maximum price.

## Usage

Basic usage:

```html
<price-range-facet></price-range-facet>
```

## Props

| Name              | Required | Type   | Default        | Description                                                           |
|-------------------|----------|--------|----------------|-----------------------------------------------------------------------|
| fromName          | false    | string | `'price_from'` | The input name for the minimum value to return results for.           |
| fromPlaceholder   | false    | string | `'min'`        | The input placeholder for the minimum value to return results for.    |
| toName            | false    | string | `'price_from'` | The input name for the maximum value to return results for.           |
| toPlaceholder     | false    | string | `'max'`        | The input placeholder for the maximum value to return results for.    |
| attribute         | true     | string |                | The attribute to filter on.                                           |
| currency          | false    | string | `'$'`          | The currency.                                                         |
| currencyPlacement | false    | string | `'left'`       | Whether to display the currency 'left' or 'right' side of the inputs. |

## Slots

| Name    | Props | Default | Description                                                                                      |
|---------|-------|---------|--------------------------------------------------------------------------------------------------|
| header  |       |         | Allows to add content at the top of the component which will be hidden when the component is.    |
| footer  |       |         | Allows to add content at the bottom of the component which will be hidden when the component is. |
| default |       | `'to '` | Text displayed between the 'min' and 'max' inputs.                                               |

## CSS Classes

| ClassName                              | Description                                      |
|----------------------------------------|--------------------------------------------------|
| ais-price-range                  | Container class.                                 |
| ais-price-range__currency        | Wraps the currency symbol.                       |
| ais-price-range__currency--left  | When the currency is displayed before the input. |
| ais-price-range__currency--right | When the currency is displayed after the input.  |
| ais-price-range__input           | Min and max input element's class.               |
| ais-price-range__input--from     | Min input element's class.                       |
| ais-price-range__input--to       | Max input element's class.                       |
