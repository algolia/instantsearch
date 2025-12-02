/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/connectors';

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
  connectRelatedProducts,
  connectFrequentlyBoughtTogether,
  connectTrendingItems,
  connectLookingSimilar,
  connectChat,
} from '../connectors';
import instantsearch from '../index.es';
import { refinementList } from '../widgets';

import type { InstantSearch, Widget } from '../index.es';
import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites, 'javascript'> = {
  createHierarchicalMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    const customHierarchicalMenu = connectHierarchicalMenu<{
      container: HTMLElement;
    }>((renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="HierarchicalMenu-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
        <form data-testid="HierarchicalMenu-refine-form">
          <input type="text" data-testid="HierarchicalMenu-refine-input" />
        </form>
      `;

      renderOptions.widgetParams.container
        .querySelector('[data-testid="HierarchicalMenu-refine-form"]')!
        .addEventListener('submit', (event) => {
          renderOptions.refine(
            (
              (event.currentTarget as HTMLFormElement).elements.item(
                0
              ) as HTMLInputElement
            ).value
          );
        });
    });

    instantsearch(instantSearchOptions)
      .addWidgets([
        customHierarchicalMenu({
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
  },
  createBreadcrumbConnectorTests({ instantSearchOptions, widgetParams }) {
    const customBreadcrumb = connectBreadcrumb<{ container: HTMLElement }>(
      (renderOptions) => {
        renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Breadcrumb-link"
          href="${renderOptions.createURL('Apple > iPhone')}"
        >
          LINK
        </a>
        <button data-testid="Breadcrumb-refine">
          refine
        </button>
      `;

        renderOptions.widgetParams.container
          .querySelector('[data-testid="Breadcrumb-refine"]')!
          .addEventListener('click', () => {
            renderOptions.refine('Apple');
          });
      }
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        customBreadcrumb({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .start();
  },
  createRefinementListConnectorTests({ instantSearchOptions, widgetParams }) {
    const customRefinementList = connectRefinementList<{
      container: HTMLElement;
    }>((renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="RefinementList-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
        <form data-testid="RefinementList-refine-form">
          <input type="text" data-testid="RefinementList-refine-input" />
        </form>
      `;

      renderOptions.widgetParams.container
        .querySelector('[data-testid="RefinementList-refine-form"]')!
        .addEventListener('submit', (event) => {
          renderOptions.refine(
            (
              (event.currentTarget as HTMLFormElement).elements.item(
                0
              ) as HTMLInputElement
            ).value
          );
        });
    });

    instantsearch(instantSearchOptions)
      .addWidgets([
        customRefinementList({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .start();
  },
  createMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    const customMenu = connectMenu<{ container: HTMLElement }>(
      (renderOptions) => {
        renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Menu-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
        <form data-testid="Menu-refine-form">
          <input type="text" data-testid="Menu-refine-input" />
        </form>
      `;

        renderOptions.widgetParams.container
          .querySelector('[data-testid="Menu-refine-form"]')!
          .addEventListener('submit', (event) => {
            renderOptions.refine(
              (
                (event.currentTarget as HTMLFormElement).elements.item(
                  0
                ) as HTMLInputElement
              ).value
            );
          });
      }
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        customMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .start();
  },
  createPaginationConnectorTests({ instantSearchOptions, widgetParams }) {
    const customPagination = connectPagination<{ container: HTMLElement }>(
      (renderOptions) => {
        renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Pagination-link"
          href="${renderOptions.createURL(10)}"
        >
          LINK
        </a>
        <button data-testid="Pagination-refine">
          refine
        </button>
      `;

        renderOptions.widgetParams.container
          .querySelector('[data-testid="Pagination-refine"]')!
          .addEventListener('click', () => {
            renderOptions.refine(10);
          });
      }
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        customPagination({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .start();
  },
  createCurrentRefinementsConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const customCurrentRefinements = connectCurrentRefinements<{
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
        <button data-testid="CurrentRefinements-refine">
          refine
        </button>
      `;

      renderOptions.widgetParams.container
        .querySelector('[data-testid="CurrentRefinements-refine"]')!
        .addEventListener('click', () => {
          renderOptions.refine({
            attribute: 'brand',
            type: 'disjunctive',
            value: 'Apple',
            label: 'Apple',
          });
        });
    });

    instantsearch(instantSearchOptions)
      .addWidgets([
        customCurrentRefinements({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
        refinementList({
          attribute: 'brand',
          container: document.body.appendChild(document.createElement('div')),
        }),
      ])
      .start();
  },
  createHitsPerPageConnectorTests({ instantSearchOptions, widgetParams }) {
    const customHitsPerPage = connectHitsPerPage<{ container: HTMLElement }>(
      (renderOptions) => {
        renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="HitsPerPage-link"
          href="${renderOptions.createURL(12)}"
        >
          LINK
        </a>
        <button data-testid="HitsPerPage-refine">
          refine
        </button>
      `;

        renderOptions.widgetParams.container
          .querySelector('[data-testid="HitsPerPage-refine"]')!
          .addEventListener('click', () => {
            renderOptions.refine(12);
          });
      }
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        customHitsPerPage({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .start();
  },
  createNumericMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    const customNumericMenu = connectNumericMenu<{ container: HTMLElement }>(
      (renderOptions) => {
        renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="NumericMenu-link"
          href="${renderOptions.createURL(encodeURI('{ "start": 500 }'))}"
        >
          LINK
        </a>
        <button data-testid="NumericMenu-refine">
          refine
        </button>
      `;

        renderOptions.widgetParams.container
          .querySelector('[data-testid="NumericMenu-refine"]')!
          .addEventListener('click', () => {
            renderOptions.refine('500');
          });
      }
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        customNumericMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .start();
  },
  createRatingMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    const customRatingMenu = connectRatingMenu<{ container: HTMLElement }>(
      (renderOptions) => {
        renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="RatingMenu-link"
          href="${renderOptions.createURL('5')}"
        >
          LINK
        </a>
        <button data-testid="RatingMenu-refine">
          refine
        </button>
      `;

        renderOptions.widgetParams.container
          .querySelector('[data-testid="RatingMenu-refine"]')!
          .addEventListener('click', () => {
            renderOptions.refine('5');
          });
      }
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        customRatingMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .start();
  },
  createToggleRefinementConnectorTests({ instantSearchOptions, widgetParams }) {
    const customToggleRefinement = connectToggleRefinement<{
      container: HTMLElement;
    }>((renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="ToggleRefinement-link"
          href="${renderOptions.createURL()}"
        >
          LINK
        </a>
        <button data-testid="ToggleRefinement-refine">
          refine
        </button>
      `;

      renderOptions.widgetParams.container
        .querySelector('[data-testid="ToggleRefinement-refine"]')!
        .addEventListener('click', () => {
          renderOptions.refine(renderOptions.value);
        });
    });

    instantsearch(instantSearchOptions)
      .addWidgets([
        customToggleRefinement({
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
  },
  createRelatedProductsConnectorTests({ instantSearchOptions, widgetParams }) {
    const customRelatedProducts = connectRelatedProducts<{
      container: HTMLElement;
    }>((renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <ul>${renderOptions.items
          .map((item) => `<li>${item.objectID}</li>`)
          .join('')}</ul>`;
    });

    const widget = customRelatedProducts({
      container: document.body.appendChild(document.createElement('div')),
      ...widgetParams,
    });

    const search = instantsearch(instantSearchOptions)
      .addWidgets([
        customRelatedProducts({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      });

    addWidgetToggleUi(search, widget);

    search.start();
  },
  createFrequentlyBoughtTogetherConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const customFrequentlyBoughtTogether = connectFrequentlyBoughtTogether<{
      container: HTMLElement;
    }>((renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <ul>${renderOptions.items
          .map((item) => `<li>${item.objectID}</li>`)
          .join('')}</ul>
      `;
    });

    const widget = customFrequentlyBoughtTogether({
      container: document.body.appendChild(document.createElement('div')),
      ...widgetParams,
    });

    const search = instantsearch(instantSearchOptions)
      .addWidgets([
        customFrequentlyBoughtTogether({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      });

    addWidgetToggleUi(search, widget);

    search.start();
  },
  createTrendingItemsConnectorTests({ instantSearchOptions, widgetParams }) {
    const customTrendingItems = connectTrendingItems<{
      container: HTMLElement;
    }>((renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <ul>${renderOptions.items
          .map((item) => `<li>${item.objectID}</li>`)
          .join('')}</ul>
      `;
    });

    const widget = customTrendingItems({
      container: document.body.appendChild(document.createElement('div')),
      ...widgetParams,
    });

    const search = instantsearch(instantSearchOptions)
      .addWidgets([
        customTrendingItems({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      });

    addWidgetToggleUi(search, widget);

    search.start();
  },
  createLookingSimilarConnectorTests({ instantSearchOptions, widgetParams }) {
    const customLookingSimilar = connectLookingSimilar<{
      container: HTMLElement;
    }>((renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <ul>${renderOptions.items
          .map((item) => `<li>${item.objectID}</li>`)
          .join('')}</ul>
      `;
    });

    const widget = customLookingSimilar({
      container: document.body.appendChild(document.createElement('div')),
      ...widgetParams,
    });

    const search = instantsearch(instantSearchOptions)
      .addWidgets([widget])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      });

    addWidgetToggleUi(search, widget);

    search.start();
  },
  createChatConnectorTests({ instantSearchOptions, widgetParams }) {
    const customChat = connectChat<{
      container: HTMLElement;
    }>((renderOptions) => {
      const { input, setInput, open, setOpen } = renderOptions;
      renderOptions.widgetParams.container.innerHTML = `
        <div data-testid="Chat-root" style="display: ${
          open ? 'block' : 'none'
        }">
          <input data-testid="Chat-input" type="text" value="${input}" />
          <button data-testid="Chat-updateInput">update input</button>
        </div>
        <button data-testid="Chat-toggleButton">
          toggle chat
        </button>
      `;

      renderOptions.widgetParams.container
        .querySelector('[data-testid="Chat-toggleButton"]')!
        .addEventListener('click', () => {
          setOpen(!open);
        });

      renderOptions.widgetParams.container
        .querySelector('[data-testid="Chat-updateInput"]')!
        .addEventListener('click', () => {
          setInput('hello world');
        });
    });

    instantsearch(instantSearchOptions)
      .addWidgets([
        customChat({
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
  },
};

function addWidgetToggleUi(search: InstantSearch, widget: Widget) {
  const button = document.createElement('button');
  button.addEventListener('click', () => {
    const hasWidget = search.mainIndex.getWidgets().includes(widget);
    if (hasWidget) {
      search.removeWidgets([widget]);
    } else {
      search.addWidgets([widget]);
    }
  });

  document.body.appendChild(button);
}

const testOptions: TestOptionsMap<TestSuites> = {
  createHierarchicalMenuConnectorTests: undefined,
  createBreadcrumbConnectorTests: undefined,
  createRefinementListConnectorTests: undefined,
  createMenuConnectorTests: undefined,
  createPaginationConnectorTests: undefined,
  createCurrentRefinementsConnectorTests: undefined,
  createHitsPerPageConnectorTests: undefined,
  createNumericMenuConnectorTests: undefined,
  createRatingMenuConnectorTests: undefined,
  createToggleRefinementConnectorTests: undefined,
  createRelatedProductsConnectorTests: undefined,
  createFrequentlyBoughtTogetherConnectorTests: undefined,
  createTrendingItemsConnectorTests: undefined,
  createLookingSimilarConnectorTests: undefined,
  createChatConnectorTests: undefined,
};

describe('Common connector tests (InstantSearch.js)', () => {
  runTestSuites({
    flavor: 'javascript',
    testSuites,
    testSetups,
    testOptions,
  });
});
