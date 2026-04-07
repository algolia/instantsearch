import { useRef, useEffect } from "preact/hooks";
import { connectRange } from "instantsearch.js/es/connectors";
import noUiSlider from "nouislider";
import { useSearch } from "../../context/search";
import type { Widget } from "instantsearch.js";

import "nouislider/dist/nouislider.css";

export function WidgetRangeSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<ReturnType<typeof noUiSlider.create> | null>(null);
  const search = useSearch();
  const widgetRef = useRef<Widget | null>(null);

  useEffect(() => {
    let skipUpdate = false;

    const widget = connectRange(
      (renderState, isFirstRender) => {
        const { range, start, refine } = renderState;
        const min = range.min ?? 0;
        const max = range.max ?? 1000;
        const from = start[0] !== -Infinity && start[0] !== undefined ? start[0] : min;
        const to = start[1] !== Infinity && start[1] !== undefined ? start[1] : max;

        if (isFirstRender) {
          const slider = noUiSlider.create(containerRef.current!, {
            start: [from, to],
            connect: true,
            range: { min, max },
            tooltips: [
              { to: (v: number) => `$${Math.round(v)}` },
              { to: (v: number) => `$${Math.round(v)}` },
            ],
          });

          slider.on("change", (values) => {
            skipUpdate = true;
            refine([Number(values[0]), Number(values[1])]);
          });

          sliderRef.current = slider;
          return;
        }

        const slider = sliderRef.current;
        if (!slider) return;

        if (skipUpdate) {
          skipUpdate = false;
          return;
        }

        slider.updateOptions(
          {
            range: { min, max },
          },
          false,
        );
        slider.set([from, to]);
      },
      () => {
        sliderRef.current?.destroy();
      },
    )({ attribute: "price" });

    widgetRef.current = widget;
    search.addWidgets([widget]);

    return () => {
      search.removeWidgets([widget]);
    };
  }, []);

  return (
    <div>
      <h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Price</h4>
      <div class="px-3 pb-8 pt-2">
        <div ref={containerRef} />
      </div>
    </div>
  );
}
