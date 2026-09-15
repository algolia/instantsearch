import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { configure, refinementList } from 'instantsearch.js/es/widgets';
import { useEffect, useRef, useState } from 'preact/hooks';

import { DocsLink, ParamDocsLink } from '../components/DocsLink';
import { WidgetCurrentRefinements } from '../components/widgets/WidgetCurrentRefinements';
import { WidgetHits } from '../components/widgets/WidgetHits';
import { WidgetSearchBox } from '../components/widgets/WidgetSearchBox';
import { WidgetStats } from '../components/widgets/WidgetStats';
import { SearchContext, useSearch } from '../context/search';
import { useWidget } from '../hooks/useWidget';
import { getFlavorFromURL, getIndexFromURL, setParams } from '../utils/url';

import { widgets, widgetSections } from './reference/widgets';

import type { Option, ReferenceWidget, Slot } from './reference/types';
import type { ComponentChildren } from 'preact';

const flavor = getFlavorFromURL();

type WidgetFactory = Parameters<typeof useWidget>[0];

/**
 * Options are identified by key *and* label, because one option key can offer
 * several values (two `transformItems`, say). Options sharing a key set the
 * same widget option, so they're mutually exclusive.
 */
function optionId(option: Option): string {
  return `${option.key}: ${option.label}`;
}

/** Options sharing a group are mutually exclusive; `key` is the default. */
function optionGroup(option: Option): string {
  return option.group ?? option.key;
}

function isKeyEnabled(
  widget: ReferenceWidget,
  enabled: Set<string>,
  key: string
): boolean {
  return widget.toggles.some(
    (item) => item.key === key && enabled.has(optionId(item))
  );
}

/** Whether an option's prerequisite (if any) is currently enabled. */
function isSatisfied(
  widget: ReferenceWidget,
  enabled: Set<string>,
  option: Option
): boolean {
  return !option.requires || isKeyEnabled(widget, enabled, option.requires);
}

/**
 * Drops options whose prerequisite is no longer enabled, repeatedly so a chain
 * of dependencies unwinds in one go.
 */
function pruneUnsatisfied(widget: ReferenceWidget, ids: string[]): string[] {
  const enabled = new Set(ids);
  const kept = widget.toggles
    .filter(
      (item) =>
        enabled.has(optionId(item)) && isSatisfied(widget, enabled, item)
    )
    .map(optionId);

  return kept.length === ids.length ? ids : pruneUnsatisfied(widget, kept);
}

function selectedOptions(
  widget: ReferenceWidget,
  enabled: Set<string>
): Option[] {
  const chosen = [
    ...widget.defaults,
    ...widget.toggles.filter(
      (item) =>
        enabled.has(optionId(item)) && isSatisfied(widget, enabled, item)
    ),
  ];

  // The options are merged with Object.assign, so a later one wins outright.
  // Drop the shadowed earlier ones, or a toggle overriding a default would be
  // applied once but printed twice.
  const lastByKey = new Map<string, Option>();
  chosen.forEach((option) => lastByKey.set(option.key, option));

  return chosen.filter((option) => lastByKey.get(option.key) === option);
}

const widgetSlugs = widgets.map((widget) => widget.name.js);

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

function formatWidget(widget: ReferenceWidget, enabled: Set<string>): string {
  const options = selectedOptions(widget, enabled);

  if (flavor === 'js') {
    const opts =
      options.length > 0
        ? `{\n  ${options
            .map((item) => `${item.key}: ${item.label}`)
            .join(',\n  ')}\n}`
        : '';

    return `${widget.name.js}(${opts})`;
  }

  if (flavor === 'react') {
    const opts =
      options.length > 0
        ? `\n  ${options
            .map((item) => {
              if (item.label.startsWith("'") && item.label.endsWith("'")) {
                return `${item.key}="${item.label.replace(/^'|'$/g, '')}"`;
              }
              if (item.label === 'true') {
                return `${item.key}`;
              }
              return `${item.key}={${item.label}}`;
            })
            .join('\n  ')}\n`
        : ' ';

    return `<${widget.name.react}${opts}/>`;
  }

  if (flavor === 'vue') {
    const opts =
      options.length > 0
        ? `\n  ${options
            .map((item) => {
              const kebab = item.key
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase();
              return item.label.startsWith("'") && item.label.endsWith("'")
                ? `${kebab}="${item.label.replace(/^'|'$/g, '')}"`
                : `:${kebab}="${item.label}"`;
            })
            .join('\n  ')}\n`
        : ' ';

    return `<${widget.name.vue}${opts}/>`;
  }

  throw new Error(`Unsupported flavor: ${flavor}`);
}

function buildWidget(widget: ReferenceWidget, enabled: Set<string>) {
  const options = Object.assign(
    {},
    ...selectedOptions(widget, enabled).map((item) => item.value)
  );

  return (el: HTMLElement) =>
    widget.fn({
      container: el,
      ...options,
    });
}

function WidgetHost({ factory }: { factory: WidgetFactory }) {
  const ref = useWidget(factory);
  return (
    <div>
      <div ref={ref} />
    </div>
  );
}

/**
 * Owns the search. Remounted (via `key`) when an option needs the search to
 * start with it already configured — see `Option.requiresRestart`.
 */
function SearchScope({
  widget,
  enabled,
}: {
  widget: ReferenceWidget;
  enabled: Set<string>;
}) {
  const searchRef = useRef<ReturnType<typeof instantsearch> | null>(null);
  if (searchRef.current === null) {
    searchRef.current = instantsearch({
      indexName: 'instant_search',
      searchClient,
    });
  }

  useEffect(() => {
    const search = searchRef.current!;
    search.start();
    return () => search.dispose();
  }, []);

  const factory = buildWidget(widget, enabled);

  // Every option change is a different widget configuration, so remount rather
  // than leaving the previous one registered on the same attribute.
  const remountKey = `${widget.name.js}:${[...enabled].sort().join(',')}`;

  // Options that have to hold for the companions too, so the two agree.
  const shared = new Set(widget.sharedOptions ?? []);
  const forwarded = selectedOptions(widget, enabled).filter((item) =>
    shared.has(item.key)
  );

  // Widgets the one under test can't work without, grouped by where they go.
  const extras: Partial<Record<Slot, ComponentChildren[]>> = {};
  (widget.requiresWidgets ?? []).forEach((name) => {
    const companion = widgets.find((item) => item.name.js === name);
    if (!companion) {
      return;
    }
    const slot = companion.slot ?? 'standalone';
    extras[slot] = [
      ...(extras[slot] ?? []),
      <Companion key={name} widget={companion} forwarded={forwarded} />,
    ];
  });

  const node = <WidgetHost key={remountKey} factory={factory} />;

  return (
    <SearchContext.Provider value={searchRef.current}>
      {(widget.slot ?? 'standalone') === 'alone' ? (
        // Recommendations and the chat aren't search results, so they get the
        // whole panel instead of being wedged into a search UI.
        <section class="min-w-0 flex-1">
          <UnderTest>{node}</UnderTest>
        </section>
      ) : (
        <TestFrame widget={widget} extras={extras} node={node} />
      )}
    </SearchContext.Provider>
  );
}

export function ReferenceView() {
  const [widgetIndex, setWidgetIndex] = useState(() =>
    getIndexFromURL('widget', widgetSlugs)
  );
  const [enabledKeys, setEnabledKeys] = useState<string[]>([]);

  const widget = widgets[widgetIndex];
  const enabled = new Set(enabledKeys);

  // A restart-class option has to be in place before the search starts, so
  // changing one rebuilds the whole instance rather than just the widget.
  const restartKey = `${widget.name.js}:${widget.toggles
    .filter((item) => item.requiresRestart && enabled.has(optionId(item)))
    .map(optionId)
    .join(',')}`;

  function toggle(option: Option) {
    const id = optionId(option);
    const exclusive = widget.toggles
      .filter((item) => optionGroup(item) === optionGroup(option))
      .map(optionId);

    setEnabledKeys((ids) =>
      pruneUnsatisfied(
        widget,
        ids.includes(id)
          ? ids.filter((item) => item !== id)
          : [...ids.filter((item) => !exclusive.includes(item)), id]
      )
    );
  }

  return (
    <div class="flex flex-col gap-4 lg:flex-row">
      <aside class="flex w-full shrink-0 flex-col gap-3 lg:w-72">
        <div class="flex items-center gap-2">
          <select
            class="min-w-0 flex-1 cursor-pointer rounded-md border border-neutral-200 bg-white px-2 py-1.5 font-mono text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            value={String(widgetIndex)}
            onChange={(event) => {
              const index = Number(event.currentTarget.value);
              setWidgetIndex(index);
              setEnabledKeys([]);
              setParams({ widget: widgets[index].name.js });
            }}
          >
            {widgetSections.map((section) => (
              <optgroup key={section.title} label={section.title}>
                {section.widgets.map(({ widget: item, index }) => (
                  <option key={item.name.js} value={String(index)}>
                    {item.name[flavor]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span class="shrink-0">
            <DocsLink name={widget.name.js} />
          </span>
        </div>

        <div class="grid gap-1">
          {widget.toggles.map((item: Option) => {
            const isOn = enabled.has(optionId(item));
            const available = isSatisfied(widget, enabled, item);
            return (
              <div key={optionId(item)} class="flex items-center gap-1">
                <button
                  type="button"
                  aria-pressed={isOn}
                  disabled={!available}
                  title={available ? undefined : `requires ${item.requires}`}
                  class={`flex-1 rounded-md border px-2 py-1 text-left font-mono text-[11px] transition-colors ${
                    available
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-40'
                  } ${
                    isOn
                      ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200'
                  }`}
                  onClick={() => toggle(item)}
                >
                  {item.key}: {item.label}
                </button>
                <ParamDocsLink name={widget.name.js} param={item.key} />
              </div>
            );
          })}
        </div>

        <pre class="m-0 overflow-x-auto rounded-md bg-neutral-50 p-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          {formatWidget(widget, enabled)}
        </pre>
      </aside>

      <SearchScope key={restartKey} widget={widget} enabled={enabled} />
    </div>
  );
}

/**
 * The frame's own facet, on an attribute no widget under test uses, so
 * `clearRefinements` and `currentRefinements` always have something to act on.
 */
function FrameFacet() {
  const ref = useWidget((el) =>
    refinementList({
      container: el,
      attribute: 'brand',
      limit: 5,
    })
  );
  return (
    <div>
      <h4 class="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        brand
      </h4>
      <div ref={ref} />
    </div>
  );
}

/**
 * The frame's results, capped to a single row: a full page of hits would push
 * every widget placed near them off the screen. `configure` and `hitsPerPage`
 * under test take this over — see their `replaces`.
 */
function FrameResults() {
  const search = useSearch();

  useEffect(() => {
    // configure takes no container, so it can't go through useWidget.
    const widget = configure({ hitsPerPage: 4 });
    search.addWidgets([widget]);
    return () => search.removeWidgets([widget]);
  }, [search]);

  return <WidgetHits />;
}

/**
 * A widget mounted only because the one under test needs it: rendered with its
 * defaults and no controls. Plain, like the rest of the frame — the widget
 * under test is the one with the dashed border.
 */
function Companion({
  widget,
  forwarded,
}: {
  widget: ReferenceWidget;
  /** Options taken from the widget under test, so the two agree. */
  forwarded: Option[];
}) {
  const options = Object.assign(
    {},
    ...[...widget.defaults, ...forwarded].map((item) => item.value)
  );

  return (
    <WidgetHost
      // Remount when a forwarded value changes, as for the widget under test.
      key={`companion:${widget.name.js}:${forwarded.map(optionId).join(',')}`}
      factory={(el: HTMLElement) => widget.fn({ container: el, ...options })}
    />
  );
}

/** Marks the widget under test wherever in the frame it lands. */
function UnderTest({ children }: { children: ComponentChildren }) {
  return (
    <div class="rounded-lg border border-dashed border-blue-400 p-3 dark:border-blue-500">
      {children}
    </div>
  );
}

/**
 * A whole search interface with the widget under test dropped into the slot it
 * belongs to, and the frame's own copy of that role withheld — so `hits` under
 * test *is* the results list rather than a second, narrower one beside it.
 */
function TestFrame({
  widget,
  node,
  extras,
}: {
  widget: ReferenceWidget;
  node: ComponentChildren;
  extras: Partial<Record<Slot, ComponentChildren[]>>;
}) {
  const slot = widget.slot ?? 'standalone';
  const omit = new Set(widget.replaces ?? [widget.name.js]);
  const at = (target: Slot) => (
    <>
      {slot === target ? <UnderTest>{node}</UnderTest> : null}
      {extras[target]}
    </>
  );

  return (
    <section class="flex min-w-0 flex-1 flex-col gap-3">
      {at('search')}
      {!omit.has('searchBox') && (
        <WidgetSearchBox placeholder="Search to see how the widget reacts..." />
      )}

      {at('meta')}
      {(!omit.has('stats') || !omit.has('currentRefinements')) && (
        <div class="flex flex-wrap items-center gap-3">
          {!omit.has('stats') && <WidgetStats />}
          {!omit.has('currentRefinements') && <WidgetCurrentRefinements />}
        </div>
      )}

      <div class="flex min-w-0 gap-4">
        <div class="w-56 shrink-0">
          {at('facet')}
          {!omit.has('refinementList') && <FrameFacet />}
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-3">
          {at('toolbar')}
          {!omit.has('hits') && <FrameResults />}
          {at('results')}
        </div>
      </div>

      {/* Companions with no slot inside the frame, like a chat panel. */}
      {extras.alone}
      {extras.standalone}
    </section>
  );
}
