import { rangeInput } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetRangeInput() {
  const ref = useWidget((el) => rangeInput({ container: el, attribute: "price" }));
  return (
    <div>
      <h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Price</h4>
      <div ref={ref} />
    </div>
  );
}
