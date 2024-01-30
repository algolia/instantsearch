export function hitItem({ hit, html, components, orientation }) {
  return html`<a href="/product.html?pid=${hit.objectID}"
    >${itemComponent({
      item: hit,
      header: html`<h1>${components.Highlight({ hit, attribute: 'name' })}</h1>
        <p>${components.Highlight({ hit, attribute: 'description' })}</p>`,
      html,
      orientation,
    })}</a
  >`;
}

export function recommendItem({ item, html, onAddToCart }) {
  return itemComponent({
    item,
    html,
    header: html`<div class="text-sm text-gray-500">${item.brand}</div>

      <div class="text-gray-900 font-semibold mb-1 whitespace-normal clamp-1">
        ${item.name}
      </div>`,
    footer: html`<button
      class="flex items-center justify-center w-full bg-white border-nebula-500 border-solid border rounded text-nebula-900 cursor-pointer py-1 px-2 font-semibold"
      onClick="${(event) => {
        event.stopPropagation();

        onAddToCart();
      }}"
    >
      Add to cart
    </button>`,
  });
}

function itemComponent({
  item,
  header = null,
  footer = null,
  html,
  orientation = 'vertical',
} = {}) {
  return html`<div
    class="group grid gap-2 color-inherit no-underline ${orientation ===
    'horizontal'
      ? 'grid-cols-2'
      : ''}"
  >
    <div class="relative">
      <img src="${item.image_urls[0]}" alt="${item.name}" class="max-w-full" />
    </div>
    <div>
      ${header}
      ${Boolean(item.reviews.count) &&
      html`<div class="items-center flex flex-grow text-sm text-gray-700">
        <svg
          class="mr-1 text-orange-400"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          />
        </svg>
        <span class="mr-1">
          ${item.reviews.bayesian_avg.toFixed(1) || '--'}
        </span>
        <span class="text-gray-400"> (${item.reviews.count} reviews) </span>
      </div>`}

      <div class="my-2 font-semibold text-gray-800">
        ${item.price.value} ${item.price.currency}
      </div>

      ${footer}
    </div>
  </div>`;
}
