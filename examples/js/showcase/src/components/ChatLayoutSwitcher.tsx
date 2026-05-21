import { Fragment } from "preact";
import { useState } from "preact/hooks";

import { DocsLinks } from "./DocsLink";

import type { ChatLayout } from "./widgets/WidgetChat";
import type { ComponentChildren } from "preact";

interface Props {
  layout: ChatLayout;
  onLayoutChange: (layout: ChatLayout) => void;
  class?: string;
  children?: ComponentChildren;
}

const LAYOUTS: { id: ChatLayout; label: string }[] = [
  { id: "inline", label: "inline" },
  { id: "overlay", label: "overlay" },
  { id: "sidePanel", label: "sidePanel" },
];

export function ChatLayoutSwitcher({
  layout,
  onLayoutChange,
  class: className,
  children,
}: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      class={`rounded-lg border border-dashed border-neutral-300 p-4 text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <header class="-mx-1 -mt-1 mb-3 flex items-start gap-1 text-xs">
        <span class="flex flex-wrap items-center">
          <span class="mx-1 cursor-default font-mono leading-relaxed text-neutral-400 dark:text-neutral-500">
            chat
          </span>
          <span class="text-neutral-300 dark:text-neutral-600">·</span>
          {LAYOUTS.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <span class="text-neutral-300 dark:text-neutral-600">•</span>}
              <button
                type="button"
                class={`mx-1 cursor-pointer font-mono leading-relaxed transition-colors ${
                  item.id === layout
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                }`}
                onClick={() => onLayoutChange(item.id)}
              >
                {item.label}
              </button>
            </Fragment>
          ))}
        </span>
        <DocsLinks names={["chat"]} visible={hovered} />
      </header>

      {layout !== "inline" && (
        <p class="mb-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          The <span class="font-mono">{layout}</span> layout renders relative to the viewport, so
          the chat UI appears outside this tile.
        </p>
      )}

      {children}
    </div>
  );
}
