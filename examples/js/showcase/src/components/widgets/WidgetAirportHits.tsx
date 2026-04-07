import { hits } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetAirportHits() {
  const ref = useWidget((el) =>
    hits({
      container: el,
      templates: {
        item(hit, { html, components }) {
          return html`
            <div class="flex items-baseline gap-4 p-3">
              <span class="shrink-0 font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                <${components.Highlight} hit=${hit} attribute="airport_id" />
              </span>
              <div class="min-w-0">
                <h5 class="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  <${components.Highlight} hit=${hit} attribute="name" />
                </h5>
                <p class="truncate text-xs text-neutral-400 dark:text-neutral-500">
                  <${components.Highlight} hit=${hit} attribute="city" />,
                  <${components.Highlight} hit=${hit} attribute="country" />
                </p>
              </div>
            </div>
          `;
        },
      },
    }),
  );
  return <div ref={ref} />;
}
