import { Fragment } from "preact";
import { useState } from "preact/hooks";

import { DocsLinks } from "./DocsLink";

import type { ComponentType } from "preact";

export interface Widget {
  title: string;
  body: ComponentType;
  docs?: string[];
}

interface Props {
  widgets: Widget[];
  destroy?: boolean;
  class?: string;
}

export function WidgetSwitcher({ widgets, destroy = false, class: className }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const hasMultiple = widgets.length > 1;

  return (
    <div
      class={`rounded-lg border border-dashed border-neutral-300 p-4 text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <header class="-mx-1 -mt-1 mb-3 flex items-start gap-1 text-xs">
        <span class="flex flex-wrap items-center">
          {widgets.map((widget, index) => (
            <Fragment key={index}>
              {index > 0 && <span class="text-neutral-300 dark:text-neutral-600">•</span>}
              <button
                type="button"
                class={`mx-1 font-mono leading-relaxed transition-colors ${hasMultiple ? "cursor-pointer" : "cursor-default"} ${
                  index === currentIndex && hasMultiple
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : `text-neutral-400 dark:text-neutral-500${hasMultiple ? " hover:text-neutral-600 dark:hover:text-neutral-300" : ""}`
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                {widget.title}
              </button>
            </Fragment>
          ))}
        </span>
        <DocsLinks
          names={widgets[currentIndex].docs ?? [widgets[currentIndex].title]}
          visible={hovered}
        />
      </header>

      {destroy ? (
        <CurrentBody key={currentIndex} Body={widgets[currentIndex].body} />
      ) : (
        widgets.map((widget, index) => (
          <div key={index} class={index !== currentIndex ? "hidden" : ""}>
            <widget.body />
          </div>
        ))
      )}
    </div>
  );
}

function CurrentBody({ Body }: { Body: ComponentType }) {
  return <Body />;
}
