import type { Hit } from "instantsearch.js";

type TemplateHelpers = {
  html: (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  components: {
    Highlight: unknown;
    Snippet: unknown;
  };
};

export function renderProductCard(hit: Hit, { html, components }: TemplateHelpers) {
  return html`
    <div class="flex h-full flex-col">
      <div class="flex aspect-square items-center justify-center bg-white p-4">
        <img class="max-h-full max-w-full object-contain" src="${hit.image}" alt="${hit.name}" />
      </div>
      <div class="flex flex-1 flex-col gap-1 p-4">
        <p class="text-xs text-neutral-400 dark:text-neutral-500">${hit.categories?.[0]}</p>
        <h5 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <${components.Highlight} hit=${hit} attribute="name" />
        </h5>
        <p class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          <${components.Snippet} hit=${hit} attribute="description" />
        </p>
        <p class="mt-auto pt-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          $${hit.price?.toFixed(2)}
        </p>
      </div>
    </div>
  `;
}

// Compact card used inside the chat's `.ais-Carousel` where
// `instantsearch.css` ships dedicated `ais-Carousel-hit-*` styles.
export function renderCarouselHit(hit: Hit, { html, components }: TemplateHelpers) {
  return html`
    <article class="ais-Carousel-hit">
      <div class="ais-Carousel-hit-image flex aspect-square items-center justify-center bg-white p-4">
        <img class="max-h-full max-w-full object-contain" src="${hit.image}" alt="${hit.name}" />
      </div>
      <h2 class="ais-Carousel-hit-title">
        <a
          href="#"
          class="ais-Carousel-hit-link"
          onClick=${(event: MouseEvent) => event.preventDefault()}
        >
          <${components.Highlight} hit=${hit} attribute="name" />
        </a>
      </h2>
      <p class="ais-Carousel-hit-price">$${hit.price?.toFixed(2)}</p>
    </article>
  `;
}
