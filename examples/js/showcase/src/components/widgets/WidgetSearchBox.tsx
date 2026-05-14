import { searchBox } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

export function WidgetSearchBox({
  placeholder = "Search for products...",
}: {
  placeholder?: string;
}) {
  const ref = useWidget((el) =>
    searchBox({ container: el, placeholder }),
  );
  return <div ref={ref} />;
}
