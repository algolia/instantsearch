import { numericMenu } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetNumericMenu() {
  const ref = useWidget((el) =>
    numericMenu({
      container: el,
      attribute: "price",
      items: [
        { label: "All" },
        { label: "<= 10$", end: 10 },
        { label: "10$ - 100$", start: 10, end: 100 },
        { label: "100$ - 500$", start: 100, end: 500 },
        { label: ">= 500$", start: 500 },
      ],
    }),
  );
  return (
    <div>
      <h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Price</h4>
      <div ref={ref} />
    </div>
  );
}
