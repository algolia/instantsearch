import { EXPERIMENTAL_autocomplete } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

export function WidgetAiAutocomplete() {
  const ref = useWidget((el) =>
    EXPERIMENTAL_autocomplete({
      container: el,
      placeholder: "Ask AI or search for products...",
      aiMode: true,
      showPromptSuggestions: {
        indexName: "instant_search_prompt_suggestions",
        searchParameters: { hitsPerPage: 3 },
        templates: {
          header(_, { html }) {
            return html`<span class="ais-AutocompleteIndexHeaderTitle">Ask AI</span>
              <span class="ais-AutocompleteIndexHeaderLine" />`;
          },
        },
      },
      indices: [
        {
          indexName: "instant_search",
          searchParameters: { hitsPerPage: 5 },
          templates: {
            header({ items }, { html }) {
              if (items.length === 0) return null;
              return html`<span class="ais-AutocompleteIndexHeaderTitle">Products</span>
                <span class="ais-AutocompleteIndexHeaderLine" />`;
            },
            noResults(_, { html }) {
              return html`<div
                class="p-4 text-center text-sm text-neutral-400 dark:text-neutral-500"
              >
                No products found.
              </div>`;
            },
            item({ item }, { html, components }) {
              return html`
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white p-1"
                  >
                    <img
                      class="max-h-full max-w-full object-contain"
                      src="${item.image}"
                      alt="${item.name}"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h5 class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      <${components.Highlight} hit=${item} attribute="name" />
                    </h5>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">
                      $${item.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              `;
            },
          },
        },
      ],
    }),
  );
  return <div ref={ref} />;
}
