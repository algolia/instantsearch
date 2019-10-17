import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import index from '../src/widgets/index/index';
import relatedItems from '../src/widgets/related-items/related-items';
import configure from '../src/widgets/configure/configure';
import hits from '../src/widgets/hits/hits';

storiesOf('Results|RelatedItems', module).add(
  'default',
  withHits(({ search, container }) => {
    const productContainer = document.createElement('div');
    const relatedContainer = document.createElement('div');

    container.appendChild(productContainer);
    container.appendChild(relatedContainer);

    const relatedIndex = index({ indexName: 'instant_search' });
    let isFirstRender = true;

    search.addWidgets([
      index({ indexName: 'instant_search' }).addWidgets([
        configure({
          hitsPerPage: 1,
        }),
        hits({
          container: productContainer,
          transformItems: items => {
            if (isFirstRender) {
              isFirstRender = false;

              relatedIndex.addWidgets([
                relatedItems({
                  container: relatedContainer,
                  hit: items[0],
                  limit: 5,
                  relatedAttributes: {
                    brand: [{ score: 3 }],
                    type: [{ score: 10 }],
                    categories: [{ score: 2 }],
                  },
                }),
              ]);
            }

            return items;
          },
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
          cssClasses: {
            item: 'hits-item',
          },
        }),
      ]),
      relatedIndex,
    ]);
  })
);
