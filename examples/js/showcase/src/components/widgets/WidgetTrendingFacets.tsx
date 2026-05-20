import { trendingFacets } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

interface Props {
  facetName: string;
}

export function WidgetTrendingFacets({ facetName }: Props) {
  const ref = useWidget((el) =>
    trendingFacets({
      container: el,
      facetName,
      limit: 5,
      templates: {
        item: (item, { html }) => html`<span>${item.facetValue}</span>`,
      },
    }),
  );
  return <div ref={ref} />;
}
