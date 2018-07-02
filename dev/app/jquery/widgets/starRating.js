/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  {
    items,
    createURL,
    refine,
    widgetParams: { containerNode, title = 'Rating' },
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const markup = `
      <div class="facet-title">${title}</div>
      <ul style="list-style-type: none; margin: 0; padding: 0;"></ul>
    `;
    containerNode.append(markup);
  }

  containerNode.find('li[data-refine-value]').each(function() {
    window.$(this).off('click');
  });

  const list = items.map(
    item => `
    <li data-refine-value="${item.value}"
      ${item.isRefined ? 'style="font-weight: bold;"' : ''}
    >
      <a href="${createURL(item.value)}">
        ${item.stars
          .map(
            star =>
              `<span class="ais-star-rating--star${
                star === false ? '__empty' : ''
              }"></span>`
          )
          .join('')}

        & up (${item.count})
      </a>
    </li>
  `
  );

  containerNode.find('ul').html(list);

  containerNode.find('li[data-refine-value]').each(function() {
    window.$(this).on('click', e => {
      e.preventDefault();
      e.stopPropagation();

      refine(window.$(this).data('refine-value'));
    });
  });
};

export default instantsearch.connectors.connectStarRating(renderFn);
