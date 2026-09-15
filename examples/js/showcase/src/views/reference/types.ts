import type { Flavor } from '../../context/flavor';

export interface Option {
  key: string;
  /** Written verbatim into the printed source, so it must be valid code. */
  label: string;
  /**
   * Options in the same group are mutually exclusive — selecting one releases
   * the others. Defaults to `key`, which makes several values for one option
   * exclusive automatically. Set it explicitly for options that are exclusive
   * across *different* keys, like `includedAttributes`/`excludedAttributes`,
   * which throw when combined.
   */
  group?: string;
  /**
   * Key of an option that must be enabled for this one to do anything, like
   * `searchablePlaceholder` needing `searchable`. Such options are disabled
   * until their prerequisite is on, and released when it's switched off.
   */
  requires?: string;
  /**
   * Set when the option only takes effect on a search that starts with it
   * already configured, so toggling it restarts the whole search rather than
   * remounting the widget.
   *
   * `rootPath` is the case: the refinement that seeds it is applied in
   * `SearchParameters.make`, which runs when the state is built — a widget
   * added later gets the facet without the refinement, so the helper asks for
   * the root level while the widget renders the level below it, and the menu
   * comes back empty.
   */
  requiresRestart?: boolean;
  /**
   * Merged into the widget options. Deliberately loose: across all widgets this
   * is a union of every widget's option types.
   */
  value: any;
}

export type WidgetNames = Record<Flavor, string>;

/**
 * Where a widget sits in the test interface. The frame renders a whole search
 * UI and drops in the widget under test at its natural position, rather than
 * showing it in a box beside a second copy of itself.
 */
export type Slot =
  /** Full width, at the top. */
  | 'search'
  /** The row of small metadata next to stats. */
  | 'meta'
  /** Above the results, where a sort/pagination bar goes. */
  | 'toolbar'
  /** The narrow facet rail. */
  | 'facet'
  /** The results list itself. */
  | 'results'
  /** No search interface at all — the widget is the whole panel. */
  | 'alone'
  /** A box of its own in the controls rail, frame untouched. */
  | 'standalone';

export interface ReferenceWidget {
  name: WidgetNames;
  /** Defaults to `standalone`, which is a box of its own beside the frame. */
  slot?: Slot;
  /**
   * Widgets the frame should stop rendering while this one is under test, by
   * JS name. Defaults to this widget, so a widget the frame already contains
   * never appears twice. Set it when the names differ but the role is the same
   * (`infiniteHits` standing in for the frame's `hits`).
   */
  replaces?: string[];
  /**
   * Other widgets from this registry that have to be on the page for this one
   * to do anything — `chatTrigger` opens a `chat`, `breadcrumb` needs a
   * `hierarchicalMenu` to have a trail. They're mounted alongside with their
   * defaults only, in their own slot.
   */
  requiresWidgets?: string[];
  /**
   * Option keys that have to hold for the companions too. `rootPath` is the
   * case: a `breadcrumb` rooted at a category needs its `hierarchicalMenu`
   * rooted at the same one, or the trail describes a tree that isn't shown.
   */
  sharedOptions?: string[];
  /**
   * Set for a higher-order widget like `panel`, which takes options, then a
   * widget factory, then that widget's options. Without it the printed source
   * would be `panel({...})` — valid-looking but rendering nothing.
   */
  wraps?: { name: WidgetNames; options: Option[] };
  fn: (widgetParams: any) => any;
  toggles: Option[];
  defaults: Option[];
}

interface WidgetDefinition extends Omit<ReferenceWidget, 'name'> {
  /** The JavaScript widget name. The React and Vue names derive from it. */
  name: string;
  /** Per-flavor overrides, for the names the derivation gets wrong. */
  names?: Partial<WidgetNames>;
}

export function toKebabCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/** `refinementList` -> `RefinementList` / `ais-refinement-list`. */
export function deriveNames(
  name: string,
  overrides?: Partial<WidgetNames>
): WidgetNames {
  return {
    js: name,
    react: name.charAt(0).toUpperCase() + name.slice(1),
    vue: `ais-${toKebabCase(name)}`,
    ...overrides,
  };
}

export function defineWidget({
  name,
  names,
  ...rest
}: WidgetDefinition): ReferenceWidget {
  return { name: deriveNames(name, names), ...rest };
}
