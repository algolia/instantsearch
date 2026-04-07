import { clearRefinements } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetClearRefinements() {
  const ref = useWidget((el) => clearRefinements({ container: el }));
  return <div ref={ref} />;
}
