import { getFlavorFromURL } from '../../../utils/url';
import { DOC_SECTIONS } from '../sections';
import { toKebabCase } from '../types';

import { breadcrumb } from './breadcrumb';
import { chat } from './chat';
import { chatTrigger } from './chatTrigger';
import { clearRefinements } from './clearRefinements';
import { configureWidget } from './configure';
import { currentRefinements } from './currentRefinements';
import { hierarchicalMenu } from './hierarchicalMenu';
import { hits } from './hits';
import { hitsPerPage } from './hitsPerPage';
import { infiniteHits } from './infiniteHits';
import { menu } from './menu';
import { menuSelect } from './menuSelect';
import { numericMenu } from './numericMenu';
import { pagination } from './pagination';
import { panelWidget } from './panel';
import { poweredBy } from './poweredBy';
import { promptSuggestions } from './promptSuggestions';
import { rangeInput } from './rangeInput';
import { rangeSlider } from './rangeSlider';
import { ratingMenu } from './ratingMenu';
import {
  frequentlyBoughtTogether,
  lookingSimilar,
  relatedProducts,
  trendingFacets,
  trendingItems,
} from './recommend';
import { refinementList } from './refinementList';
import { searchBox } from './searchBox';
import { sortBy } from './sortBy';
import { stats } from './stats';
import { toggleRefinement } from './toggleRefinement';
import { voiceSearch } from './voiceSearch';

import type { ReferenceWidget } from '../types';

const flavor = getFlavorFromURL();

/**
 * Every widget this view carries, in no particular order: the select's
 * grouping and order come from DOC_SECTIONS, which mirrors the API reference.
 *
 * Deliberately absent, each for a reason that isn't "not done yet":
 * - `autocomplete` — its params are a union of two mutually exclusive shapes
 *   (`indices` vs `feeds`), so it needs its own pass rather than a flat list.
 * - `dynamicWidgets` — renders from `facetOrdering` configured on the index,
 *   so with this demo index it would show nothing.
 * - `relevantSort` — only renders on a virtual replica index; this view
 *   searches `instant_search`.
 * - `geoSearch` — needs a Maps key valid for the host, and has its own view.
 * - `feeds` — its params are part of the autocomplete union, see above.
 * - `index`, `instantsearch`, `queryRuleContext`, `analytics` — no UI of
 *   their own.
 * - `queryRuleCustomData` — needs a matching rule on another index.
 * - `answers`, `configureRelatedItems`, `places` — deprecated.
 */
const allWidgets: ReferenceWidget[] = [
  searchBox,
  configureWidget,
  chat,
  chatTrigger,
  promptSuggestions,
  panelWidget,
  voiceSearch,
  hits,
  infiniteHits,
  refinementList,
  menu,
  menuSelect,
  hierarchicalMenu,
  numericMenu,
  rangeInput,
  rangeSlider,
  ratingMenu,
  toggleRefinement,
  currentRefinements,
  clearRefinements,
  pagination,
  hitsPerPage,
  sortBy,
  breadcrumb,
  stats,
  poweredBy,
  frequentlyBoughtTogether,
  relatedProducts,
  lookingSimilar,
  trendingItems,
  trendingFacets,
];

const docSlug = (widget: ReferenceWidget) => toKebabCase(widget.name.js);

/** Position of each documented slug, section order first. */
const docOrder = new Map<string, number>();
DOC_SECTIONS.forEach((section, sectionIndex) => {
  section.slugs.forEach((slug, slugIndex) => {
    docOrder.set(slug, sectionIndex * 1000 + slugIndex);
  });
});

const inFlavor = (widget: ReferenceWidget) =>
  !widget.flavors || widget.flavors.includes(flavor);

/** Flat list in documentation order. Indices into this are what the URL uses. */
export const widgets: ReferenceWidget[] = [...allWidgets]
  .filter(inFlavor)
  .sort(
    (a, b) =>
      (docOrder.get(docSlug(a)) ?? Infinity) -
      (docOrder.get(docSlug(b)) ?? Infinity)
  );

/** The same widgets as the select's two levels, empty sections dropped. */
export const widgetSections = DOC_SECTIONS.map((section) => ({
  title: section.title,
  widgets: widgets
    .map((widget, index) => ({ widget, index }))
    .filter(({ widget }) => section.slugs.includes(docSlug(widget))),
})).filter((section) => section.widgets.length > 0);

/**
 * A widget missing from DOC_SECTIONS would sort to the end and never appear in
 * the select, so fail loudly in development instead.
 */
if (import.meta.env.DEV) {
  const orphans = allWidgets.filter((widget) => !docOrder.has(docSlug(widget)));
  if (orphans.length > 0) {
    throw new Error(
      `Not in DOC_SECTIONS: ${orphans.map(docSlug).join(', ')}. Add the slug to the matching section.`
    );
  }
}
