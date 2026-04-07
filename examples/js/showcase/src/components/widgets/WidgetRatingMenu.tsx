import { ratingMenu } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";

export function WidgetRatingMenu() {
  const ref = useWidget((el) => ratingMenu({ container: el, attribute: "rating" }));
  return <div ref={ref} />;
}
