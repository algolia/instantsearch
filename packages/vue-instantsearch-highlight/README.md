Vue InstantSearch Highlight
---

A component that helps you safely display highlighted attributes of your search results.

This component leverages the [highlighting feature of Algolia](https://www.algolia.com/doc/faq/searching/what-is-the-highlighting/#faq-section)
but adds some sugar on top of it to prevent XSS attacks.

This component will override the following settings of your index at query time:
- highlightPreTag
- highlightPostTag

You will then be able to choose your custom highlighting tag on a per component basis.

## Usage

Basic usage:

```html
<ais-highlight :result="result" attribute-name="description"></ais-highlight>
```

Changing the highlighting tag:

 ```html
<ais-highlight :result="result" attribute-name="description" tag-name="mark"></ais-highlight>
 ```

**Note that the tag name has to be passed without carets.**

## CSS Classes

| ClassName             | Description       |
|-----------------------|-------------------|
| ais-highlight         | Container class   |
