/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = ({
  items,
  createURL,
  refine,
  currentRefinement,
  widgetParams: {
    containerNode,
    title = 'Rating',
  },
}, isFirstRendering) => {
  if (isFirstRendering) {
    const markup = `
      <div class="facet-title">${title}</div>
      <ul style="list-style-type: none; margin: 0; padding: 0;"></ul>
    `;
    containerNode.append(markup);
  }

  containerNode
    .find('li')
    .each(function() { window.$(this).off('click'); });

  const list = items.map(item => `
    <li ${item.isRefined ? 'style="font-weight: bold;"' : ''}>
      <a href="${createURL(item)}">
        ${item.stars
            .map(star => `<span class="ais-star-rating--star${star === false ? '__empty' : ''}"></span>`)
            .join('')}

        & up (${item.count})
      </a>
    </li>
  `);

  containerNode
    .find('ul')
    .html(list);

  containerNode
    .find('li')
    .each(function(index) {
      window.$(this).on('click', e => {
        e.preventDefault();
        e.stopPropagation();

        refine(items[index].name);
      });
    });
};

export default instantsearch.connectors.connectStarRating(renderFn);
