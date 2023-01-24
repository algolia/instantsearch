import type { BaseHit, Hit, Renderer } from 'instantsearch.js';
import type { HitsWidgetDescription } from 'instantsearch.js/es/connectors/hits/connectHits';
import type { HitsWidgetParams } from 'instantsearch.js/es/widgets/hits/hits';

import { connectHits } from 'instantsearch.js/es/connectors';
import {
  getContainerNode,
  SendEventForHits,
} from 'instantsearch.js/es/lib/utils';

function getHitByObjectID(
  hits: Array<Hit<BaseHit>>,
  objectID: BaseHit['objectID']
) {
  return hits.find((hit) => hit.objectID === objectID);
}

const renderHitsWithSelector: Renderer<
  HitsWidgetDescription['renderState'],
  HitsWidgetParams
> = (renderOptions, _isFirstRender) => {
  const { hits, widgetParams, sendEvent } = renderOptions;
  const container = getContainerNode(widgetParams.container);

  container.innerHTML = `
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

  [...container.querySelectorAll('li')].forEach((el) => {
    el.addEventListener('click', () => {
      sendEvent(
        'click',
        getHitByObjectID(hits, el.dataset.productId),
        'CustomHits widget: Hit clicked'
      );
    });
  });
};

class HitsWrapper {
  hits: any[] = [];

  constructor(
    readonly container: HTMLElement,
    readonly sendEvent: SendEventForHits
  ) {}

  push(hit: Hit<BaseHit>, template: string): string {
    const root = document.createElement('template');
    root.innerHTML = template;
    root.content.querySelector<HTMLElement>('*')!.dataset.productId =
      hit.objectID;

    this.hits.push(hit);
    return root.innerHTML;
  }

  bind() {
    this.container
      .querySelectorAll<HTMLElement>('[data-product-id]')
      .forEach((el) => {
        el.addEventListener('click', () => {
          this.sendEvent(
            'click',
            this.hits.find((hit) => hit.objectID === el.dataset.productId),
            'CustomHits widget: Hit clicked'
          );
        });
      });
  }
}

const renderHitsWithWrapper: Renderer<
  HitsWidgetDescription['renderState'],
  HitsWidgetParams
> = (renderOptions, _isFirstRender) => {
  const { hits, widgetParams, sendEvent } = renderOptions;
  const container = getContainerNode(widgetParams.container);
  const wrapper = new HitsWrapper(container, sendEvent);

  container.innerHTML = `
    <ul>
      ${hits
        .map((item) => wrapper.push(item, `<li>${item.name}</li>`))
        .join('')}
    </ul>
  `;

  wrapper.bind();
};

// const renderHitsWithBindEvent = (renderOptions, isFirstRender) => {
//   const { hits, widgetParams, bindEvent } = renderOptions;

//   widgetParams.container.innerHTML = `
//     <ul>
//       ${hits
//         .map(
//           (item) =>
//             `<li ${bindEvent('click', item, 'CustomHits widget: Hit clicked')}>
//               ${item.name}
//             </li>`
//         )
//         .join('')}
//     </ul>
//   `;
// };

export const customHits = connectHits(renderHitsWithSelector);
// export const customHits = connectHits(renderHitsWithWrapper);
