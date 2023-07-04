/**
 * @jest-environment jsdom
 */
import {
  createHierarchicalMenuTests,
  createBreadcrumbTests,
  createRefinementListTests,
  createPaginationTests,
  createMenuTests,
  createInfiniteHitsTests,
  createHitsTests,
  createRangeInputTests,
  createInstantSearchTests,
  createHitsPerPageTests,
  createNumericMenuTests,
  createRatingMenuTests,
  createToggleRefinementTests,
  createCurrentRefinementsTests,
} from '@instantsearch/tests';

import {
  connectBreadcrumb,
  connectCurrentRefinements,
  connectHierarchicalMenu,
  connectHitsPerPage,
  connectMenu,
  connectNumericMenu,
  connectPagination,
  connectRatingMenu,
  connectRefinementList,
  connectToggleRefinement,
} from '../connectors';
import instantsearch from '../index.es';
import {
  hierarchicalMenu,
  breadcrumb,
  menu,
  refinementList,
  pagination,
  infiniteHits,
  searchBox,
  hits,
  index,
  rangeInput,
  hitsPerPage,
  toggleRefinement,
} from '../widgets';

createHierarchicalMenuTests(({ instantSearchOptions, widgetParams }) => {
  const hierarchicalMenuURL = connectHierarchicalMenu<{
    container: HTMLElement;
  }>((renderOptions) => {
    renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="HierarchicalMenu-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
      `;
  });

  instantsearch(instantSearchOptions)
    .addWidgets([
      hierarchicalMenuURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      hierarchicalMenu({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createBreadcrumbTests(({ instantSearchOptions, widgetParams }) => {
  const { transformItems, templates, ...hierarchicalWidgetParams } =
    widgetParams;

  const breadcrumbURL = connectBreadcrumb<{ container: HTMLElement }>(
    (renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Breadcrumb-link"
          href="${renderOptions.createURL('Apple > iPhone')}"
        >
          LINK
        </a>
      `;
    }
  );

  instantsearch(instantSearchOptions)
    .addWidgets([
      breadcrumbURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      breadcrumb({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      hierarchicalMenu({
        container: document.body.appendChild(document.createElement('div')),
        ...hierarchicalWidgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createRefinementListTests(({ instantSearchOptions, widgetParams }) => {
  const refinementListURL = connectRefinementList<{ container: HTMLElement }>(
    (renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="RefinementList-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
      `;
    }
  );
  instantsearch(instantSearchOptions)
    .addWidgets([
      refinementListURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      refinementList({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createMenuTests(({ instantSearchOptions, widgetParams }) => {
  const menuURL = connectMenu<{ container: HTMLElement }>((renderOptions) => {
    renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Menu-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
      `;
  });

  instantsearch(instantSearchOptions)
    .addWidgets([
      menuURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      menu({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
  const paginationURL = connectPagination<{ container: HTMLElement }>(
    (renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Pagination-link"
          href="${renderOptions.createURL(10)}"
        >
          LINK
        </a>
      `;
    }
  );
  instantsearch(instantSearchOptions)
    .addWidgets([
      paginationURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      pagination({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createInfiniteHitsTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      searchBox({
        container: document.body.appendChild(document.createElement('div')),
      }),
      infiniteHits({
        container: document.body.appendChild(
          Object.assign(document.createElement('div'), {
            id: 'main-hits',
          })
        ),
        templates: {
          item: (hit, { html, sendEvent }) =>
            html`<div data-testid=${`main-hits-top-level-${hit.__position}`}>
              ${hit.objectID}
              <button
                data-testid=${`main-hits-convert-${hit.__position}`}
                onClick=${() => sendEvent('conversion', hit, 'Converted')}
              >
                convert
              </button>
              <button
                data-testid=${`main-hits-click-${hit.__position}`}
                onClick=${() => sendEvent('click', hit, 'Clicked')}
              >
                click
              </button>
            </div>`,
        },
        ...widgetParams,
      }),
      index({ indexName: 'nested' }).addWidgets([
        infiniteHits({
          container: document.body.appendChild(
            Object.assign(document.createElement('div'), {
              id: 'nested-hits',
            })
          ),
          templates: {
            item: (hit, { html, sendEvent }) =>
              html`<div
                data-testid=${`nested-hits-top-level-${hit.__position}`}
              >
                ${hit.objectID}
                <button
                  data-testid=${`nested-hits-click-${hit.__position}`}
                  onClick=${() => sendEvent('click', hit, 'Clicked nested')}
                >
                  click
                </button>
              </div>`,
          },
        }),
      ]),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createHitsTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      searchBox({
        container: document.body.appendChild(document.createElement('div')),
      }),
      hits({
        container: document.body.appendChild(
          Object.assign(document.createElement('div'), {
            id: 'main-hits',
          })
        ),
        templates: {
          item: (hit, { html, sendEvent }) =>
            html`<div data-testid=${`main-hits-top-level-${hit.__position}`}>
              ${hit.objectID}
              <button
                data-testid=${`main-hits-convert-${hit.__position}`}
                onClick=${() => sendEvent('conversion', hit, 'Converted')}
              >
                convert
              </button>
              <button
                data-testid=${`main-hits-click-${hit.__position}`}
                onClick=${() => sendEvent('click', hit, 'Clicked')}
              >
                click
              </button>
            </div>`,
        },
        ...widgetParams,
      }),
      index({ indexName: 'nested' }).addWidgets([
        hits({
          container: document.body.appendChild(
            Object.assign(document.createElement('div'), {
              id: 'nested-hits',
            })
          ),
          templates: {
            item: (hit, { html, sendEvent }) =>
              html`<div data-testid=${`nested-hits-${hit.__position}`}>
                ${hit.objectID}
                <button
                  data-testid=${`nested-hits-click-${hit.__position}`}
                  onClick=${() => sendEvent('click', hit, 'Clicked nested')}
                >
                  click
                </button>
              </div>`,
          },
        }),
      ]),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createRangeInputTests(({ instantSearchOptions, widgetParams }) => {
  instantsearch(instantSearchOptions)
    .addWidgets([
      rangeInput({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createCurrentRefinementsTests(({ instantSearchOptions, widgetParams }) => {
  const currentRefinementsURL = connectCurrentRefinements<{
    container: HTMLElement;
  }>((renderOptions) => {
    renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="CurrentRefinements-link"
          href="${renderOptions.createURL({
            attribute: 'brand',
            type: 'disjunctive',
            value: 'Apple',
            label: 'Apple',
          })}"
        >
          LINK
        </a>
      `;
  });

  instantsearch(instantSearchOptions)
    .addWidgets([
      currentRefinementsURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      refinementList({
        attribute: 'brand',
        container: document.body.appendChild(document.createElement('div')),
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createHitsPerPageTests(({ instantSearchOptions, widgetParams }) => {
  const hitsPerPageURL = connectHitsPerPage<{ container: HTMLElement }>(
    (renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="HitsPerPage-link"
          href="${renderOptions.createURL(12)}"
        >
          LINK
        </a>
      `;
    }
  );

  instantsearch(instantSearchOptions)
    .addWidgets([
      hitsPerPageURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      hitsPerPage({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createNumericMenuTests(({ instantSearchOptions, widgetParams }) => {
  const numericMenuURL = connectNumericMenu<{ container: HTMLElement }>(
    (renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="NumericMenu-link"
          href="${renderOptions.createURL(encodeURI('{ "start": 500 }'))}"
        >
          LINK
        </a>
      `;
    }
  );

  instantsearch(instantSearchOptions)
    .addWidgets([
      numericMenuURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createRatingMenuTests(({ instantSearchOptions, widgetParams }) => {
  const ratingMenuURL = connectRatingMenu<{ container: HTMLElement }>(
    (renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="RatingMenu-link"
          href="${renderOptions.createURL('5')}"
        >
          LINK
        </a>
      `;
    }
  );

  instantsearch(instantSearchOptions)
    .addWidgets([
      ratingMenuURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createToggleRefinementTests(({ instantSearchOptions, widgetParams }) => {
  const toggleRefinementURL = connectToggleRefinement<{
    container: HTMLElement;
  }>((renderOptions) => {
    renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="ToggleRefinement-link"
          href="${renderOptions.createURL()}"
        >
          LINK
        </a>
      `;
  });

  instantsearch(instantSearchOptions)
    .addWidgets([
      toggleRefinementURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
      toggleRefinement({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
    ])
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();
});

createInstantSearchTests(({ instantSearchOptions }) => {
  instantsearch(instantSearchOptions)
    .on('error', () => {
      /*
       * prevent rethrowing InstantSearch errors, so tests can be asserted.
       * IRL this isn't needed, as the error doesn't stop execution.
       */
    })
    .start();

  return {
    algoliaAgents: [
      `instantsearch.js (${
        require('../../../instantsearch.js/package.json').version
      })`,
    ],
  };
});
