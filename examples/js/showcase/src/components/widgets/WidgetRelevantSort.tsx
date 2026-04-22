import { relevantSort } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

export function WidgetRelevantSort() {
  const ref = useWidget((el) =>
    relevantSort({
      container: el,
      templates: {
        text({ isRelevantSorted }) {
          return isRelevantSorted
            ? "We removed some search results to show you the most relevant ones"
            : "Currently showing all results";
        },
        button({ isRelevantSorted }) {
          return isRelevantSorted ? "See all results" : "See relevant results";
        },
      },
    }),
  );

  return (
    <div ref={ref} class="[&:has(.ais-RelevantSort-text)>p]:hidden">
      <p class="text-sm text-neutral-400 dark:text-neutral-500">
        Select a virtual replica in <strong>sortBy</strong>
      </p>
    </div>
  );
}
