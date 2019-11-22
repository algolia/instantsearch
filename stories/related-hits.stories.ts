import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import index from '../src/widgets/index/index';
import relatedHits from '../src/widgets/related-hits/related-hits';
import configure from '../src/widgets/configure/configure';
import hits from '../src/widgets/hits/hits';
import { connectRelatedHits, connectHits } from '../src/connectors';

storiesOf('Results|RelatedHits', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      const productContainer = document.createElement('div');
      const relatedContainer = document.createElement('div');

      container.appendChild(productContainer);
      container.appendChild(relatedContainer);

      const state = {
        relatedIndex: null,
        lastObjectID: null,
      };

      const customRelatedHits = connectHits(
        ({ hits, widgetParams, instantSearchInstance }) => {
          const hit = hits[0];

          if (hits.length === 0 || hit.objectID === state.lastObjectID) {
            return;
          }

          state.lastObjectID = hit.objectID;

          if (state.relatedIndex) {
            // This throws in the widget index because `derivedHelper` becomes `null`.
            state.relatedIndex.dispose();
            // instantSearchInstance.mainIndex.removeWidgets([state.relatedIndex]);
            state.relatedIndex = null;
          }

          state.relatedIndex = index({
            indexName: instantSearchInstance.indexName,
          }).addWidgets([
            configure({
              hitsPerPage: 5,
            }),
            relatedHits({
              container: widgetParams.container,
              hit,
              transformSearchParameters(searchParameters) {
                return {
                  ...searchParameters,
                  optionalWords: hit.name.split(' '),
                };
              },
              matchingPatterns: {
                brand: { score: 3 },
                type: { score: 10 },
                categories: { score: 2 },
              },
              templates: {
                default({ items }) {
                  return `
                  <ul>${items
                    .map(
                      item => `
                    <li>
                      <strong>${item.name}</strong>

                      <ul>
                        <li>price: ${item.price}</li>
                        <li>rating: ${item.rating}</li>
                        <li>categories: [${item.categories.join(', ')}]</li>
                      </ul>
                    </li>`
                    )
                    .join('')}
                  </ul>
                    `;
                },
              },
            }),
          ]);

          instantSearchInstance.mainIndex.addWidgets([state.relatedIndex]);
        }
      );

      search.addWidgets([
        configure({
          hitsPerPage: 1,
        }),
        hits({
          container: productContainer,
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
        customRelatedHits({
          container: relatedContainer,
        }),
      ]);
    })
  )
  .add(
    'connector',
    withHits(({ search, container }) => {
      const hitsContainer = document.createElement('div');
      const relatedHitsContainer = document.createElement('div');
      relatedHitsContainer.classList.add('ais-RelatedHits');

      container.appendChild(hitsContainer);
      container.appendChild(relatedHitsContainer);

      const relatedHitsWidget = connectRelatedHits(
        ({
          items,
          widgetParams,
          showPrevious,
          showNext,
          isFirstPage,
          isLastPage,
        }) => {
          const { container } = widgetParams;
          container.innerHTML = '';

          const itemsRender = items
            .map(item => {
              return `
<li class="ais-RelatedHits-item">
  <div class="ais-RelatedHits-item-image">
    <img src="${item.image}" alt="${item.name}">
  </div>

  <div class="ais-RelatedHits-item-title">
    <h4>${item.name}</h4>
  </div>
</li>
            `;
            })
            .join('');

          const relatedlist = document.createElement('ul');
          relatedlist.classList.add('ais-RelatedHits-list');
          relatedlist.innerHTML = `<ul class="ais-RelatedHits-list">${itemsRender}</ul>`;

          const previousButton = document.createElement('button');
          previousButton.classList.add('ais-RelatedHits-button');
          previousButton.textContent = '←';
          previousButton.disabled = isFirstPage;
          previousButton.addEventListener('click', () => showPrevious());

          const nextButton = document.createElement('button');
          nextButton.classList.add('ais-RelatedHits-button');
          nextButton.textContent = '→';
          nextButton.disabled = isLastPage;
          nextButton.addEventListener('click', () => showNext());

          container.appendChild(previousButton);
          container.appendChild(relatedlist);
          container.appendChild(nextButton);
        }
      );

      const state = {
        relatedIndex: null,
        lastObjectID: null,
      };

      const customRelatedHits = connectHits(
        ({ hits, widgetParams, instantSearchInstance }) => {
          const hit = hits[0];

          if (hits.length === 0 || hit.objectID === state.lastObjectID) {
            return;
          }

          state.lastObjectID = hit.objectID;

          if (state.relatedIndex) {
            // This throws in the widget index because `derivedHelper` becomes `null`.
            // state.relatedIndex.dispose();
            // instantSearchInstance.mainIndex.removeWidgets([state.relatedIndex]);
            state.relatedIndex = null;
          }

          state.relatedIndex = index({
            indexName: instantSearchInstance.indexName,
          }).addWidgets([
            configure({
              hitsPerPage: 5,
            }),
            relatedHitsWidget({
              container: widgetParams.container,
              hit,
              transformSearchParameters(searchParameters) {
                return {
                  ...searchParameters,
                  optionalWords: hit.name.split(' '),
                };
              },
              matchingPatterns: {
                brand: { score: 3 },
                type: { score: 10 },
                categories: { score: 2 },
              },
              templates: {
                default({ items }) {
                  return `
            <ul>${items
              .map(
                item => `
              <li>
                <strong>${item.name}</strong>

                <ul>
                  <li>price: ${item.price}</li>
                  <li>rating: ${item.rating}</li>
                  <li>categories: [${item.categories.join(', ')}]</li>
                </ul>
              </li>`
              )
              .join('')}
            </ul>
              `;
                },
              },
            }),
          ]);

          instantSearchInstance.mainIndex.addWidgets([state.relatedIndex]);
        }
      );

      search.addWidgets([
        index({ indexName: 'instant_search' }).addWidgets([
          configure({
            hitsPerPage: 1,
          }),
          hits({
            container: hitsContainer,
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
          customRelatedHits({
            container: relatedHitsContainer,
          }),
        ]),
      ]);
    })
  );
