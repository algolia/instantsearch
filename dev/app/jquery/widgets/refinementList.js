/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  {
    items,
    refine,
    canRefine,
    createURL,
    widgetParams: { containerNode, title },
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

  // remove event listeners if any before attaching new ones
  window.$('li[data-refine-value]').each(function() {
    window.$(this).off();
  });

  if (canRefine) {
    const list = items.map(
      item => `
      <li
        data-refine-value="${item.value}"
        class="facet-value checkbox clearfix"
      >
        <label style="display: block;">
          <input
            type="checkbox"
            value="${item.value}"
            ${item.isRefined ? 'checked' : ''}
          />

          <a
            href="${createURL(item.value)}"
            style="text-decoration: none; color: #000;"
          >
            ${item.isRefined ? `<strong>${item.label}</strong>` : item.label}
          </a>

          <span class="facet-count pull-right">
            ${item.count}
          </span>
        </label>
      </li>
    `
    );

    containerNode.find('ul').html(list.join(''));

    containerNode.find('li[data-refine-value]').each(function() {
      window.$(this).on('click', e => {
        e.preventDefault();
        e.stopPropagation();

        refine(window.$(this).data('refine-value'));
      });
    });
  }
};

export default instantsearch.connectors.connectRefinementList(renderFn);
