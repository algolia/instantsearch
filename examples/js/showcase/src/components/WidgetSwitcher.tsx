import { useState } from "preact/hooks";
import type { ComponentType } from "preact";
import { ExternalLink } from "lucide-preact";
import { useFlavor, type Flavor } from "../context/flavor";

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

const BASE_URL = "https://www.algolia.com/doc/api-reference/widgets";

function docsUrl(name: string, flavor: Flavor): string {
  const kebab = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  return `${BASE_URL}/${kebab}/${flavor}/`;
}

function DocsLink({ name, flavor }: { name: string; flavor: Flavor }) {
  return (
    <a
      href={docsUrl(name, flavor)}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1 rounded bg-neutral-400 px-2 py-0.5 text-[10px] font-semibold uppercase text-white no-underline transition-colors hover:bg-neutral-500 dark:bg-neutral-600"
    >
      Docs
      <ExternalLink size={10} />
    </a>
  );
}

export function WidgetSwitcher({ widgets, destroy = false, class: className }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const hasMultiple = widgets.length > 1;
  const flavor = useFlavor();

  return (
    <div
      class={`rounded-lg border border-dashed border-neutral-300 p-4 text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <header class="-mx-1 -mt-1 mb-3 flex items-start gap-1 text-xs">
        <span class="flex flex-wrap items-center">
          {widgets.map((widget, index) => (
            <>
              {index > 0 && <span class="text-neutral-300 dark:text-neutral-600">•</span>}
              <button
                key={index}
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
            </>
          ))}
        </span>
        <span
          class={`ml-auto flex gap-1 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}
        >
          {(widgets[currentIndex].docs ?? [widgets[currentIndex].title]).map((d) => (
            <DocsLink key={d} name={d} flavor={flavor} />
          ))}
        </span>
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
