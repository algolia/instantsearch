---
title: Infinite scroll
mainTitle: Examples
layout: main.pug
category: Examples
withHeadings: true
navWeight: 100
editable: true
githubSource: docs/docgen/src/examples/infinite-scroll.md
---

In this example, we use a [third party library](https://github.com/Akryum/vue-observe-visibility) that allows us to detect when an element becomes available.

**Important: you need a polyfill for some browsers. Make sure you check out the [explanations here](https://github.com/Akryum/vue-observe-visibility).**

For this to work we do 2 things:

1. We ask the results component to `stack` results
1. We introduce a _dummy_ div at the bottom that will increase the page number when it becomes visible

<p data-height="900" data-theme-id="0" data-slug-hash="dWBMje" data-default-tab="result" data-user="rayrutjes" data-embed-version="2" data-pen-title="Vue InstantSearch - Infinite Scroll example" class="codepen">See the Pen <a href="https://codepen.io/rayrutjes/pen/dWBMje/">Vue InstantSearch - Infinite Scroll example</a> by Raymond Rutjes (<a href="https://codepen.io/rayrutjes">@rayrutjes</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
