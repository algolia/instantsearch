/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  {
    nbPages,
    pages,
    createURL,
    refine,
    currentRefinement,
    widgetParams: { containerNode },
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const markup = `
      <div class="facet-title">Custom pagination</div>
      <ul class="pagination"></ul>
    `;
    containerNode.append(markup);
  }

  // remove event listeners before replacing markup
  containerNode.find('a[data-page]').each(function() {
    window.$(this).off('click');
  });

  if (nbPages > 0) {
    containerNode.find('ul.pagination').html(
      pages
        .map(
          page => `
            <li ${page === currentRefinement ? 'class="active"' : ''}>
              <a
                href="${createURL(page)}"
                data-page=${page}
              >
                ${page + 1}
              </a>
            </li>
          `
        )
        .join('')
    );

    containerNode.find('a[data-page]').each(function() {
      window.$(this).on('click', e => {
        e.preventDefault();
        refine(window.$(this).data('page'));
      });
    });
  }
};

export default instantsearch.connectors.connectPagination(renderFn);
