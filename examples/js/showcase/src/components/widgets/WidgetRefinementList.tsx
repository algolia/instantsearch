import { refinementList } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

export function WidgetRefinementList() {
  const ref = useWidget((el) =>
    refinementList({ container: el, attribute: "brand", searchable: true }),
  );
  return (
    <div>
      <h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Brands</h4>
      <div ref={ref} />
    </div>
  );
}
