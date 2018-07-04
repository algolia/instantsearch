/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  {
    items,
    refine,
    createURL,
    isShowingMore,
    toggleShowMore,
    widgetParams: { containerNode },
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    containerNode.html(`
      <div class="facet-title">Categories (menu with showmore)</div>
      <ul style="list-style-type: none; margin: 0; padding: 0;" />
      <button class="btn btn-sm btn-default btn-block" style="margin-top: 10px" />
    `);
    containerNode.find('button').on('click', e => {
      e.preventDefault();
      toggleShowMore();
    });
  }

  // remove event listeners before re-render
  containerNode.find('li[data-refine-value]').each(function() {
    window.$(this).off('click');
  });

  containerNode.find('button').text(isShowingMore ? 'Show less' : 'Show more');

  const itemsHTML = items.map(
    item => `
    <li data-refine-value="${item.value}">
      <a href="${createURL(item.value)}" class="facet-value clearfix">
        ${item.isRefined ? `<strong>${item.label}</strong>` : item.label}
        <span class="facet-count pull-right">${item.count}</span>
      </a>
    </li>
  `
  );

  containerNode.find('ul').html(itemsHTML);

  containerNode.find('li[data-refine-value]').each(function() {
    window.$(this).on('click', e => {
      e.preventDefault();
      e.stopPropagation();
      refine(window.$(this).data('refine-value'));
    });
  });
};

export default instantsearch.connectors.connectMenu(renderFn);
