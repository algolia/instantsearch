/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  {
    value,
    createURL,
    refine,
    widgetParams: { title = 'Toggle', containerNode },
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const markup = `
      <div class="facet-title">${title}</div>
      <div class="facet-value checkbox"></div>
    `;

    containerNode.append(markup);
  }

  const $facetValue = containerNode.find('.facet-value');

  $facetValue.off('click');
  $facetValue.html(`
    <a
      href="${createURL()}"
      style="text-decoration: none; color: #000"
    >
      <label
        style="display: block;"
        class="clearfix"
      >
        <input
          type="checkbox"
          value="${value.name}"
          ${value.isRefined ? 'checked' : ''}
        />
        ${value.name}
        <span class="facet-count pull-right">
          ${value.count}
        </span>
      </label>
    </a>
  `);

  $facetValue.on('click', e => {
    e.preventDefault();
    e.stopPropagation();

    refine(value);
  });
};

export default instantsearch.connectors.connectToggle(renderFn);
