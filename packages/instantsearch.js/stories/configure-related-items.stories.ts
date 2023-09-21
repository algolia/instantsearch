import { storiesOf } from '@storybook/html';

import { withHits } from '../.storybook/decorators';

import type { AlgoliaHit } from '../src/types';
import type { HitsWidgetParams } from '../src/widgets/hits/hits';

storiesOf('Basics/ConfigureRelatedItems', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
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

    const pagination = instantsearch.connectors.connectPagination<{
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

    const relatedHits = instantsearch.connectors.connectHits<HitsWidgetParams>(
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
          instantsearch.widgets
            .index({
              indexName: instantSearchInstance.mainIndex.getIndexName(),
            })
            .addWidgets([
              instantsearch.widgets.configure({
                hitsPerPage: 4,
              }),
              instantsearch.widgets.EXPERIMENTAL_configureRelatedItems({
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
              instantsearch.widgets.hits({
                container: widgetParams.container,
                templates: {
                  item: (item, { html }) => html`
                    <li class="ais-RelatedHits-item">
                      <div class="ais-RelatedHits-item-image">
                        <img src="${item.image}" alt="${item.name}" />
                      </div>

                      <div class="ais-RelatedHits-item-title">
                        <h4>${item.name}</h4>
                      </div>
                    </li>
                  `,
                  empty: () => '',
                },
              }),
            ]),
        ]);
      }
    );

    search.addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 1,
      }),
      instantsearch.widgets.hits({
        container: productContainer,
        templates: {
          item: (hit, { html, components }) => html`
            <div
              class="hits-image"
              style="background-image: url(${hit.image})"
            ></div>
            <article>
              <header>
                <strong>
                  ${components.Highlight({ attribute: 'name', hit })})}
                </strong>
              </header>
              <p>${components.Snippet({ attribute: 'description', hit })})}</p>
              <footer>
                <p>
                  <strong>${hit.price}$</strong>
                </p>
              </footer>
            </article>
          `,
          empty: () => '',
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
