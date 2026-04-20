import type { ComponentChildren } from 'preact';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ComponentChildren;
}

interface Props<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  class?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  class: className,
}: Props<T>) {
  return (
    <div
      class={`inline-flex flex-col overflow-hidden rounded-md border border-neutral-200 bg-white text-xs md:flex-row dark:border-neutral-700 dark:bg-neutral-800 ${
        className ?? ''
      }`}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          class={`cursor-pointer p-2 md:px-3 md:py-1.5 font-medium transition-colors ${
            index > 0
              ? 'border-t border-neutral-200 md:border-l md:border-t-0 dark:border-neutral-700'
              : ''
          } ${
            value === option.value
              ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'
              : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
          }`}
          onClick={() => onChange(option.value)}
        >
          <span class="flex items-center gap-1.5">
            <span class="shrink-0">{option.icon}</span>
            <span class="hidden md:inline">{option.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
