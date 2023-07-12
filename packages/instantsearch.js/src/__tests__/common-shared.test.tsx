/**
 * @jest-environment jsdom
 */
import { createSharedTests } from '@instantsearch/tests';

import { connectMenu, connectPagination } from '../connectors';
import instantsearch from '../index.es';
import { menu, pagination, hits } from '../widgets';

createSharedTests(({ instantSearchOptions, widgetParams }) => {
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
      menuURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams.menu,
      }),
      menu({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams.menu,
      }),
      hits({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams.hits,
      }),
      paginationURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams.pagination,
      }),
      pagination({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams.pagination,
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
