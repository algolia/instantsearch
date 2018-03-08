/* eslint-disable import/default */
import instantsearch from '../../../../index.js';

const renderFn = ({ hits, widgetParams: { containerNode } }) => {
  containerNode.html(
    hits.map(
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
    )
  );
};

export default instantsearch.connectors.connectHits(renderFn);
