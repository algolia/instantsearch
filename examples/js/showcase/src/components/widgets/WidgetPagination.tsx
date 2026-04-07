import { pagination } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

export function WidgetPagination() {
  const ref = useWidget((el) =>
    pagination({ container: el, showFirst: false, showLast: false, padding: 1 }),
  );
  return <div ref={ref} />;
}
