import { connectHits } from 'instantsearch.js/es/connectors';

function getHitByObjectID(hits, objectID) {
  return hits.find((hit) => hit.objectID === objectID);
}

const renderHitsWithSelector = (renderOptions, isFirstRender) => {
  const { hits, widgetParams, sendEvent } = renderOptions;

  widgetParams.container.innerHTML = `
    <ul>
      ${hits
        .map(
          (item) =>
            `<li data-product-id=${item.objectID}>
              ${item.name}
            </li>`
        )
        .join('')}
    </ul>
  `;

  [...widgetParams.container.querySelectorAll('li')].forEach((el) => {
    el.addEventListener('click', () => {
      sendEvent(
        'click',
        getHitByObjectID(hits, el.dataset.productId),
        'CustomHits widget: Hit clicked'
      );
    });
  });
};

const renderHitsWithBindEvent = (renderOptions, isFirstRender) => {
  const { hits, widgetParams, bindEvent } = renderOptions;

  widgetParams.container.innerHTML = `
    <ul>
      ${hits
        .map(
          (item) =>
            `<li ${bindEvent('click', item, 'CustomHits widget: Hit clicked')}>
              ${item.name}
            </li>`
        )
        .join('')}
    </ul>
  `;
};

export const customHits = connectHits(renderHitsWithBindEvent);
