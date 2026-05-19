import { filterSuggestions } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

export function WidgetFilterSuggestions() {
  const ref = useWidget((el) =>
    filterSuggestions({
      container: el,
      agentId: "3123062d-d611-4d4f-8ab2-4fa39302dc64",
      templates: {
        empty: (_, { html }) => html`
          <p class="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Ask the chat something like${" "}
            <span class="font-mono text-neutral-700 dark:text-neutral-200">
              "I'm looking for a new laptop"
            </span>${" "}to see contextual filters appear here.
          </p>
        `,
      },
    }),
  );
  return <div ref={ref} />;
}
