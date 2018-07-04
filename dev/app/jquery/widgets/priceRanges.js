/* eslint-disable import/default */
import instantsearch from '../../../../index';

const getLabel = ({ from, to } = {}) => {
  if (to === undefined) return `≥ $${from}`;
  if (from === undefined) return `≤ $${to}`;
  return `$${from} - $${to}`;
};

// Available price ranges for results
// ----------------------------------
const renderList = ({ containerNode, items, refine }) => {
  containerNode.find('ul > li').each(function() {
    window.$(this).off();
  });

  const list = items.map(
    item => `
    <li class="facet-value">
      <a href="${item.url}">
        ${getLabel(item)}
      </a>
    </li>
  `
  );

  containerNode.find('ul').html(list);

  containerNode.find('ul > li').each(function(index) {
    window.$(this).on('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const { from, to } = items[index];
      refine({ from, to });
    });
  });
};

// Custom values form
// ------------------
const renderForm = ({ containerNode, currentRefinement }) => {
  const { from, to } = currentRefinement || {};
  containerNode.find('form').html(`
    <label>
      <span>$ </span>
      <input
        type="number"
        class="ais-price-ranges--input fixed-input-sm"
        ${from ? `value="${from}"` : ''}
      />
    </label>

    <span> to </span>

    <label>
      <span>$ </span>
      <input
        type="number"
        class="ais-price-ranges--input fixed-input-sm"
        ${to ? `value="${to}"` : ''}
      />
    </label>

    <button
      type="submit"
      class="btn btn-default btn-sm"
    >
      Go
    </button>
  `);
};

const handleFormSubmit = ({ refine, containerNode }) => e => {
  e.preventDefault();

  const [
    { value: fromInputValue },
    { value: toInputValue },
  ] = containerNode.find('input[type="number"]');

  const from = !isNaN(parseFloat(fromInputValue))
    ? parseFloat(fromInputValue)
    : undefined;
  const to = !isNaN(parseFloat(toInputValue))
    ? parseFloat(toInputValue)
    : undefined;

  if (from || to) refine({ from, to });
};

const renderFn = (
  {
    items,
    refine,
    currentRefinement,
    widgetParams: { containerNode, title = 'Price ranges' },
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const markup = `
      <div class="facet-title">${title}</div>
      <ul style="list-style-type: none; margin: 0; padding: 0;"></ul>
      <form class="ais-price-ranges"></form>
    `;
    containerNode.append(markup);

    // bind form action on first render
    containerNode
      .find('form')
      .on('submit', handleFormSubmit({ refine, containerNode }));
  }

  renderList({ containerNode, items, refine });
  renderForm({ containerNode, currentRefinement, refine });
};

export default instantsearch.connectors.connectPriceRanges(renderFn);
