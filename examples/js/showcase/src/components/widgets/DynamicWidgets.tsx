import { WidgetSwitcher } from "../WidgetSwitcher";
import { WidgetRefinementList } from "./WidgetRefinementList";
import { WidgetMenu } from "./WidgetMenu";
import { WidgetMenuSelect } from "./WidgetMenuSelect";
import { WidgetHierarchicalMenu } from "./WidgetHierarchicalMenu";
import { WidgetNumericMenu } from "./WidgetNumericMenu";
import { WidgetRangeInput } from "./WidgetRangeInput";
import { WidgetRangeSlider } from "./WidgetRangeSlider";
import { WidgetRatingMenu } from "./WidgetRatingMenu";
import { WidgetToggleRefinement } from "./WidgetToggleRefinement";
import { WidgetPanel } from "./WidgetPanel";

export function DynamicWidgets() {
  return (
    <div class="flex flex-col gap-2">
      <WidgetSwitcher
        widgets={[
          { title: "panel", body: WidgetPanel },
          { title: "refinementList", body: WidgetRefinementList },
          { title: "menu", body: WidgetMenu },
          { title: "menuSelect", body: WidgetMenuSelect },
          { title: "hierarchicalMenu", body: WidgetHierarchicalMenu },
        ]}
        destroy
      />
      <WidgetSwitcher
        widgets={[
          { title: "numericMenu", body: WidgetNumericMenu },
          { title: "rangeInput", body: WidgetRangeInput },
          { title: "rangeSlider", body: WidgetRangeSlider },
        ]}
        destroy
      />
      <WidgetSwitcher widgets={[{ title: "ratingMenu", body: WidgetRatingMenu }]} />
      <WidgetSwitcher widgets={[{ title: "toggleRefinement", body: WidgetToggleRefinement }]} />
    </div>
  );
}
