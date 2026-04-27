import { hits } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

import { renderProductCard } from "./ProductCard";

export function WidgetHits() {
  const ref = useWidget((el) =>
    hits({
      container: el,
      templates: {
        item: (hit, helpers) => renderProductCard(hit, helpers),
      },
    }),
  );
  return <div ref={ref} />;
}
