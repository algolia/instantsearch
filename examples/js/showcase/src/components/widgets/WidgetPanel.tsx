import { panel, refinementList } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

const panelRefinementList = panel({
  templates: {
    header() {
      return "Brands";
    },
    collapseButtonText({ collapsed }) {
      return collapsed ? "Show" : "Hide";
    },
  },
  collapsed: () => false,
})(refinementList);

export function WidgetPanel() {
  const ref = useWidget((el) =>
    panelRefinementList({ container: el, attribute: "brand", searchable: true }),
  );
  return <div ref={ref} />;
}
