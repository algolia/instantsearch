/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const formatMenuEntry = (createURL, lvl = 0) => item => {
  const countHTML = `
    <span class="pull-right facet-count">
      ${item.count}
    </span>
  `;

  if (
    item.isRefined === true &&
    Array.isArray(item.data) &&
    item.data.length > 0
  ) {
    return `
      <div ${lvl === 0 ? 'class="hierarchical-categories-list"' : ''}>
        <a
          href="${createURL(item.value)}"
          class="facet-value clearfix"
          data-refine-value="${item.value}"
        >
          <strong>${item.label}</strong> ${countHTML}
        </a>
        <div class="hierarchical-categories-list ais-hierarchical-menu--list__lvl${lvl +
          1}">
          ${item.data.map(formatMenuEntry(createURL, lvl + 1)).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div>
      <a
        href="${createURL(item.value)}"
        class="facet-value clearfix"
        data-refine-value="${item.value}"
      >
        ${
          item.isRefined ? `<strong>${item.label}</strong>` : item.label
        } ${countHTML}
      </a>
    </div>
  `;
};

const renderFn = (
  { createURL, items, refine, widgetParams: { containerNode } },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const markup = window.$(`
      <div class="facet-title">Custom hierarchical</div>
      <div id="custom-hierarchical-menu__container"></div>
    `);
    containerNode.append(markup);
  }

  // remove event listeners before replacing markup
  containerNode.find('a[data-refine-value]').each(function() {
    window.$(this).off('click');
  });

  if (items && items.length > 0) {
    // replace markup with items
    const menuItems = items.map(formatMenuEntry(createURL)).join('');

    containerNode.find('#custom-hierarchical-menu__container').html(menuItems);

    // bind links with `data-refine-value`
    containerNode.find('a[data-refine-value]').each(function() {
      window.$(this).on('click', e => {
        e.preventDefault();
        refine(window.$(this).data('refine-value'));
      });
    });
  }
};

export default instantsearch.connectors.connectHierarchicalMenu(renderFn);
