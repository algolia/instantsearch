/* eslint-disable import/default */
import instantsearch from '../../../../index';

const renderFn = ({
  hits,
  showMore,
  isLastPage,
  widgetParams: { containerNode },
}) => {
  const hitsHTML = hits.map(
    hit => `
    <div class="hit">
      <div class="media">
        <a
          href="${hit.url}"
          class="pull-left"
        >
          <img
            class="media-object"
            src="${hit.image}"
          />
        </a>

        <div class="media-body">
          <h3 class="pull-right text-right text-info">$${hit.price}</h3>
          <h4>${hit._highlightResult.name.value}</h4>
          <p>${hit._highlightResult.description.value}</p>

          ${
            hit.free_shipping
              ? '<span class="badge pull-right">Free shipping</span>'
              : ''
          }
        </div>
      </div>
    </div>
  `
  );

  containerNode.find('button[data-show-more]').off('click');
  containerNode.html(hitsHTML);

  if (!isLastPage) {
    containerNode.append(`
      <button class="btn btn-default" data-show-more>
        Show more
      </button>
    `);

    containerNode.find('button[data-show-more]').on('click', e => {
      e.preventDefault();
      showMore();
    });
  }
};

export default instantsearch.connectors.connectInfiniteHits(renderFn);
