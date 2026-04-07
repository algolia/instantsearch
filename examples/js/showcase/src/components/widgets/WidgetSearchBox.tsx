import { searchBox } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetSearchBox() {
  const ref = useWidget((el) =>
    searchBox({ container: el, placeholder: "Search for products..." }),
  );
  return <div ref={ref} />;
}
