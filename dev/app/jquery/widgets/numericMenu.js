/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = (
  {
    items,
    refine,
    widgetParams: { containerNode, attribute, title = 'Numeric menu' },
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

  // remove event listeners if any before attachign new ones
  containerNode.find('li[data-refine-value]').each(function() {
    window.$(this).off();
  });

  const list = items.map(
    item => `
    <li
      class="facet-value clearfix"
      data-refine-value="${item.value}"
    >
      <label
        style="display: block;"
        class="ais-refinement-list--label"
      >
        <input
          type="radio"
          name="${attribute}"
          ${item.isRefined ? 'checked' : ''}
        />
        ${item.label}
      </label>
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

export default instantsearch.connectors.connectNumericMenu(renderFn);
