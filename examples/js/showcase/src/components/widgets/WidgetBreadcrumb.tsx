import { breadcrumb } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

export function WidgetBreadcrumb() {
  const ref = useWidget((el) =>
    breadcrumb({
      container: el,
      attributes: [
        "hierarchicalCategories.lvl0",
        "hierarchicalCategories.lvl1",
        "hierarchicalCategories.lvl2",
      ],
    }),
  );
  return <div ref={ref} />;
}
