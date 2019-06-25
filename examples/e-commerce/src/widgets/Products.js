import { hits } from 'instantsearch.js/es/widgets';

const products = hits({
  container: '[data-widget="hits"]',
  templates: {
    item: `
<article class="hit">
  <header class="hit-image-container">
    <img src="{{image}}" alt="{{name}}" class="hit-image">
  </header>

  <main class="hit-info-container">
    <p class="hit-category">{{categories.0}}</p>
    <h1>{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</h1>
    <p class="hit-description">{{#helpers.snippet}}{ "attribute": "description" }{{/helpers.snippet}}</p>

    <footer>
      <p>
        <span class="hit-em">$</span> <strong>{{#helpers.formatNumber}}{{price}}{{/helpers.formatNumber}}</strong>
        <span class="hit-em hit-rating">
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
          <path fill="#e2a400" fill-rule="evenodd" d="M10.472 5.008L16 5.816l-4 3.896.944 5.504L8 12.616l-4.944 2.6L4 9.712 0 5.816l5.528-.808L8 0z"/>
        </svg>
          {{rating}}
        </span>
      </p>
    </footer>
  </main>
</article>
`,
  },
});

export default products;
