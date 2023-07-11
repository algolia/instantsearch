/**
 * @jest-environment jsdom
 */
import {
  createHierarchicalMenuConnectorTests,
  createBreadcrumbConnectorTests,
  createRefinementListConnectorTests,
  createPaginationConnectorTests,
  createMenuConnectorTests,
  createHitsPerPageConnectorTests,
  createNumericMenuConnectorTests,
  createRatingMenuConnectorTests,
  createToggleRefinementConnectorTests,
  createCurrentRefinementsConnectorTests,
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
import { refinementList } from '../widgets';

createHierarchicalMenuConnectorTests(
  ({ instantSearchOptions, widgetParams }) => {
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
        <button data-testid="HierarchicalMenu-refine">
          refine
        </button>
      `;

      renderOptions.widgetParams.container
        .querySelector('[data-testid="HierarchicalMenu-refine"]')!
        .addEventListener('click', () => {
          renderOptions.refine('Apple');
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
  }
);

createBreadcrumbConnectorTests(({ instantSearchOptions, widgetParams }) => {
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
});

createRefinementListConnectorTests(({ instantSearchOptions, widgetParams }) => {
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
        <button data-testid="RefinementList-refine">
          refine
        </button>
      `;

    renderOptions.widgetParams.container
      .querySelector('[data-testid="RefinementList-refine"]')!
      .addEventListener('click', () => {
        renderOptions.refine('Apple');
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
});

createMenuConnectorTests(({ instantSearchOptions, widgetParams }) => {
  const customMenu = connectMenu<{ container: HTMLElement }>(
    (renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Menu-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
        <button data-testid="Menu-refine">
          refine
        </button>
      `;

      renderOptions.widgetParams.container
        .querySelector('[data-testid="Menu-refine"]')!
        .addEventListener('click', () => {
          renderOptions.refine('Apple');
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
});

createPaginationConnectorTests(({ instantSearchOptions, widgetParams }) => {
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
});

createCurrentRefinementsConnectorTests(
  ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createHitsPerPageConnectorTests(({ instantSearchOptions, widgetParams }) => {
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
});

createNumericMenuConnectorTests(({ instantSearchOptions, widgetParams }) => {
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
});

createRatingMenuConnectorTests(({ instantSearchOptions, widgetParams }) => {
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
});

createToggleRefinementConnectorTests(
  ({ instantSearchOptions, widgetParams }) => {
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
  }
);
