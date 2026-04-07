import { poweredBy } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetPoweredBy() {
  const ref = useWidget((el) => poweredBy({ container: el }));
  return <div ref={ref} />;
}
