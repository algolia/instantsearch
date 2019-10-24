import { index, relatedHits } from 'instantsearch.js/es/widgets';

export const createRelatedProduct = ({ container, hit }) =>
  relatedHits({
    container,
    hit,
    matchingPatterns: {},
    limit: 5,
    templates: {
      item: `
<div
  class="hits-image"
  style="background-image: url({{image}})"
></div>
<article>
  <header>
    <strong>{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</strong>
  </header>
  <p>
    {{#helpers.snippet}}{ "attribute": "description" }{{/helpers.snippet}}
  </p>
  <footer>
    <p>
      <strong>{{price}}$</strong>
    </p>
  </footer>
</article>
`,
    },
  });
