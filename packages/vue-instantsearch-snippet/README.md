Vue InstantSearch Snippet
---

A functional component that helps you safely display snippeted attributes of your search results.

This component leverages the [snippeting feature of Algolia](https://www.algolia.com/doc/faq/searching/what-is-attributes-to-snippet-how-does-it-work/#faq-section)
but adds some sugar on top of it to prevent XSS attacks.

This component will override the following settings of your index at query time:
- highlightPreTag
- highlightPostTag

You will then be able to choose your custom highlighting tag on a per component basis for a given snippet.

## Usage

Basic usage:

```html
<ais-snippet :result="result" attribute-name="description"></ais-snippet>
```

Changing the highlighting tag:

 ```html
<ais-snippet :result="result" attribute-name="description" tag-name="mark"></ais-snippet>
 ```

**Note that the tag name has to be passed without carets.**

## CSS Classes

| ClassName             | Description       |
|-----------------------|-------------------|
| ais-snippet           | Container class   |
