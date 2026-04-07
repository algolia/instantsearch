import { currentRefinements } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetCurrentRefinements() {
  const ref = useWidget((el) => currentRefinements({ container: el }));
  return <div ref={ref} />;
}
