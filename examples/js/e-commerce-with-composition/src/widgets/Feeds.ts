import { feeds, hits } from 'instantsearch.js/es/widgets';

import type { Hit } from 'instantsearch.js';
import type { Widget } from 'instantsearch.js';

const rootEl = document.querySelector('[data-widget="feeds"]')!;

// Tab bar (lives outside the feeds widget root)
const tabBar = document.createElement('div');
tabBar.className = 'feeds-tabs';
rootEl.appendChild(tabBar);

let activeTab: string | null = null;

function setActive(feedID: string) {
  activeTab = feedID;
  rootEl.querySelectorAll<HTMLElement>('.ais-Feeds-feed').forEach((el) => {
    el.style.display = el.dataset.feedId === feedID ? '' : 'none';
  });
  tabBar.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('feeds-tabs-active', btn.dataset.feedId === feedID);
  });
}

function productsHits(container: HTMLElement): Widget {
  return hits<Hit<{ title: string; largeImage: string; author: string[] }>>({
    container,
    templates: {
      item(hit, { html, components }) {
        return html`
          <article class="hit">
            <header class="hit-image-container">
              <img
                src="${hit.largeImage}"
                alt="${hit.title}"
                class="hit-image"
              />
            </header>
            <div class="hit-info-container">
              <h1>${components.Highlight({ hit, attribute: 'title' })}</h1>
              <p class="hit-description">${hit.author?.join(', ')}</p>
            </div>
          </article>
        `;
      },
    },
  });
}

function fashionHits(container: HTMLElement): Widget {
  return hits<Hit<{ name: string; image: string; brand: string; price: number; currency: string }>>({
    container,
    templates: {
      item(hit, { html, components }) {
        return html`
          <article class="hit">
            <header class="hit-image-container">
              <img src="${hit.image}" alt="${hit.name}" class="hit-image" />
            </header>
            <div class="hit-info-container">
              <p class="hit-category">${hit.brand}</p>
              <h1>${components.Highlight({ hit, attribute: 'name' })}</h1>
              <p class="hit-description">
                ${hit.price} ${hit.currency}
              </p>
            </div>
          </article>
        `;
      },
    },
  });
}

function amazonHits(container: HTMLElement): Widget {
  return hits<Hit<{ product_title: string; product_brand: string; product_description: string }>>({
    container,
    templates: {
      item(hit, { html, components }) {
        return html`
          <article class="hit">
            <div class="hit-info-container">
              <p class="hit-category">${hit.product_brand}</p>
              <h1>
                ${components.Highlight({ hit, attribute: 'product_title' })}
              </h1>
            </div>
          </article>
        `;
      },
    },
  });
}

const feedWidgetMap: Record<string, (container: HTMLElement) => Widget> = {
  products: productsHits,
  Fashion: fashionHits,
  Amazon: amazonHits,
};

export const feedsWidget = feeds({
  container: '[data-widget="feeds"]',
  searchScope: 'global',
  widgets: (container, feedID) => {
    container.dataset.feedId = feedID;

    // Add tab button
    const btn = document.createElement('button');
    btn.className = 'feeds-tabs-btn';
    btn.textContent = feedID || 'All results';
    btn.dataset.feedId = feedID;
    btn.addEventListener('click', () => setActive(feedID));
    tabBar.appendChild(btn);

    // First feed becomes active
    if (!activeTab) {
      activeTab = feedID;
      btn.classList.add('feeds-tabs-active');
    } else {
      container.style.display = 'none';
    }

    const factory = feedWidgetMap[feedID];
    return factory ? [factory(container)] : [];
  },
});
