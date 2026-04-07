import { toggleRefinement } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetToggleRefinement() {
  const ref = useWidget((el) =>
    toggleRefinement({
      container: el,
      attribute: "free_shipping",
      templates: {
        labelText() {
          return "Free Shipping";
        },
      },
    }),
  );
  return <div ref={ref} />;
}
