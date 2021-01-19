import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import {
  EXPERIMENTAL_configureRelatedItems,
  configure,
  hits,
  index,
} from '../src/widgets';
import { connectHits, connectPagination } from '../src/connectors';
import { HitsWidgetParams } from '../src/widgets/hits/hits';
import { AlgoliaHit } from '../src/types';

storiesOf('Basics/ConfigureRelatedItems', module).add(
  'default',
  withHits(({ search, container }) => {
    const productContainer = document.createElement('div');
    const itemsContainer = document.createElement('div');
    const previousPageContainer = document.createElement('div');
    const nextPageContainer = document.createElement('div');
    const relatedContainer = document.createElement('div');
    relatedContainer.classList.add('related-items');

    container.appendChild(productContainer);
    relatedContainer.append(
      previousPageContainer,
      itemsContainer,
      nextPageContainer
    );
    container.appendChild(relatedContainer);

    const pagination = connectPagination<{
      previousPageContainer: HTMLElement;
      nextPageContainer: HTMLElement;
    }>(
      ({
        currentRefinement,
        refine,
        isFirstPage,
        isLastPage,
        nbPages,
        widgetParams,
      }) => {
        widgetParams.previousPageContainer.innerHTML = '';
        widgetParams.nextPageContainer.innerHTML = '';

        if (nbPages === 0) {
          return;
        }

        const previousButton = document.createElement('button');
        previousButton.classList.add('ais-RelatedHits-button');
        previousButton.textContent = '←';
        previousButton.disabled = isFirstPage;
        previousButton.addEventListener('click', () => {
          refine(Math.max(0, currentRefinement - 1));
        });

        const nextButton = document.createElement('button');
        nextButton.classList.add('ais-RelatedHits-button');
        nextButton.textContent = '→';
        nextButton.disabled = isLastPage;
        nextButton.addEventListener('click', () => {
          refine(Math.min(currentRefinement + 1, nbPages));
        });

        widgetParams.previousPageContainer.appendChild(previousButton);
        widgetParams.nextPageContainer.appendChild(nextButton);
      }
    );

    const state: { referenceHit: AlgoliaHit | null } = {
      referenceHit: null,
    };

    const relatedHits = connectHits<HitsWidgetParams>(
      ({ hits: items, widgetParams, instantSearchInstance }) => {
        const [hit] = items;

        if (!hit || state.referenceHit) {
          return;
        }

        state.referenceHit = hit;

        if (items.length === 0) {
          (widgetParams.container as HTMLElement).innerHTML = '';
        }

        instantSearchInstance.addWidgets([
          index({
            indexName: instantSearchInstance.mainIndex.getIndexName(),
          }).addWidgets([
            configure({
              hitsPerPage: 4,
            }),
            EXPERIMENTAL_configureRelatedItems({
              hit,
              matchingPatterns: {
                brand: { score: 3 },
                type: { score: 10 },
                categories: { score: 2 },
              },
            }),
            pagination({
              previousPageContainer,
              nextPageContainer,
              totalPages: 3,
            }),
            hits({
              container: widgetParams.container,
              templates: {
                item(item) {
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
                },
                empty: '',
              },
            }),
          ]),
        ]);
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
          empty: '',
        },
        cssClasses: {
          item: 'hits-item',
        },
      }),
      relatedHits({
        container: itemsContainer,
      }),
    ]);
  })
);
