---
title: Input
mainTitle: Components
layout: main.pug
category: Components
withHeadings: true
navWeight: 2
editable: true
githubSource: docs/docgen/src/components/input.md
---

A simple text input that will update the search store query as its value changes.

If you need fully featured search input, with a reset and submit button, please
checkout the [SearchBox component](components/search-box.html).

## Usage

Basic usage:

```html
<ais-input placeholder="Find products..."></ais-input>
```

## Props

The root element of the Input component is a native HTML input element.
As a result, you can use any valid `<input />` attribute as a property.

i.e.

```html
<ais-input placeholder="Find products..." autofocus></ais-input>
```

## CSS Classes

| ClassName | Description     |
|:----------|:----------------|
| ais-input | Container class |
