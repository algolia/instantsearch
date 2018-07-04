/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = (
  {
    clearAllClick,
    clearAllURL,
    createURL,
    refine,
    refinements,
    widgetParams: { containerNode },
  },
  isFirstRendering
) => {
  // append initial markup on first rendering
  // ----------------------------------------
  if (isFirstRendering) {
    const markup = window.$(`
      <div class="facet-title">Custom current refinements</div>
      <div id="custom-crv-clear-all-container"></div>
      <ul style="list-style-type: none; margin: 0; padding: 0;"></ul>
    `);
    containerNode.append(markup);
  }

  if (refinements && refinements.length > 0) {
    // append clear all link
    // ---------------------
    containerNode.find('#custom-crv-clear-all-container').html(`
        <a
          href="${clearAllURL}"
          class="ais-current-refined-values--clear-all"
        >
          Clear all
        </a>
      `);

    containerNode
      .find('#custom-crv-clear-all-container > a')
      .off('click')
      .on('click', e => {
        e.preventDefault();
        clearAllClick();
      });

    // show current refined values
    // ---------------------------
    const list = refinements
      .map(value => {
        const { computedLabel, count } = value;

        const afterCount = count
          ? `<span class="pull-right facet-count">${count}</span>`
          : '';

        switch (true) {
          case value.attributeName === 'price_range':
            return `Price range: ${computedLabel.replace(
              /(\d+)/g,
              '$$$1'
            )} ${afterCount}`;

          case value.attributeName === 'price':
            return `Price: ${computedLabel.replace(/(\d+)/g, '$$$1')}`;

          case value.attributeName === 'free_shipping':
            return computedLabel === 'true'
              ? `Free shipping ${afterCount}`
              : '';

          default:
            return `${computedLabel} ${afterCount}`;
        }
      })
      .map(
        (content, index) => `
        <li>
          <a
            href="${createURL(refinements[index])}"
            class="facet-value facet-value-removable clearfix"
          >
            ${content}
          </a>
        </li>
      `
      );

    containerNode.find('ul').html(list.join(''));

    // bind click events on links
    // --------------------------
    containerNode.find('li > a').each(function(index) {
      window
        .$(this)
        .off('click')
        .on('click', e => {
          e.preventDefault();
          refine(refinements[index]);
        });
    });

    // show container
    // --------------
    containerNode.find('#custom-current-refined-values').show();
  } else {
    // remove refinements list and clear all button, hide the container
    // ----------------------------------------------------------------
    containerNode.find('ul').html('');
    containerNode.find('#custom-crv-clear-all-container').html('');
    containerNode.find('#custom-current-refined-values').hide();
  }
};

export default instantsearch.connectors.connectCurrentRefinedValues(renderFn);
