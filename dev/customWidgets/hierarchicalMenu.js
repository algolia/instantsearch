/* eslint-disable import/default */
import instantsearch from '../../index.js';

const formatMenuEntry = (createURL, lvl = 0) => item => {
  const countHTML = `
    <span class="pull-right facet-count">
      ${item.count}
    </span>
  `;

  if (
      item.isRefined === true
      && Array.isArray(item.data)
      && item.data.length > 0
    ) {
    return `
      <div ${lvl === 0 ? 'class="hierarchical-categories-list"' : ''}>
        <a
          href="${createURL(item)}"
          class="facet-value clearfix"
          data-refine-path="${item.path}"
        >
          <strong>${item.name}</strong> ${countHTML}
        </a>
        <div class="hierarchical-categories-list ais-hierarchical-menu--list__lvl${lvl + 1}">
          ${item.data.map(formatMenuEntry(createURL, lvl + 1)).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div>
      <a
        href="${createURL(item)}"
        class="facet-value clearfix"
        data-refine-path="${item.path}"
      >
        ${item.isRefined
          ? `<strong>${item.name}</strong>`
          : item.name} ${countHTML}
      </a>
    </div>
  `;
};

const renderFn = ({
  createURL,
  items,
  refine,
  widgetParams: {containerNode},
  currentRefinement,
}, isFirstRendering) => {
  if (isFirstRendering) {
    const markup = window.$(`
      <div class="facet-title">Custom hierarchical</div>
      <div id="custom-hierarchical-menu__container"></div>
    `);
    containerNode.append(markup);
  }

  // remove event listeners before replacing markup
  containerNode
    .find('a[data-refine-path]')
    .each(function() { window.$(this).off('click'); });

  if (items && items.length > 0) {
    // replace markup with items
    const menuItems = items
      .map(item => item.isRefined ? {...item, data: currentRefinement.data} : item)
      .map(formatMenuEntry(createURL))
      .join('');

    containerNode
      .find('#custom-hierarchical-menu__container')
      .html(menuItems);

    // bind links with `data-refine-path`
    containerNode
      .find('a[data-refine-path]')
      .each(function() {
        window.$(this).on('click', e => {
          e.preventDefault();
          refine(window.$(this).data('refine-path'));
        });
      });
  }
};

export default instantsearch.connectors.connectHierarchicalMenu(renderFn);
