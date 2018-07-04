/* eslint-disable import/default */
import instantsearch from '../../../../index';
import bel from 'bel';

function render({ hits, widgetParams: { containerNode } }) {
  const content = bel`<div>
    ${hits.map(hit => {
      const title = bel`<h4></h4>`;
      title.innerHTML = hit._highlightResult.name.value;
      const description = bel`<p></p>`;
      description.innerHTML = hit._highlightResult.description.value;

      return bel`
        <div class="ais-hits--item">
          <div class="hit" id="hit-bel-${hit.objectID}">
            <div class="media">
              <a class="pull-left" href="${hit.url}">
                <img class="media-object" src="${hit.image}">
              </a>
              <div class="media-body">
                <h3 class="pull-right text-right text-info">$${hit.price}</h3>
                <h4>${title}</h4>
                <p>${description}</p>
                ${
                  hit.free_shipping
                    ? bel`<span class="badge pull-right">Free Shipping</span>`
                    : ''
                }
              </div>
            </div>
            <a href="#">Go back to top</a>
          </div>
        </div>`;
    })}
  </div>`;

  containerNode.innerText = '';
  containerNode.appendChild(content);
}

export default instantsearch.connectors.connectHits(render);
