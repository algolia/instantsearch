import { liteClient as algoliasearch } from "algoliasearch/lite";
import instantsearch from "instantsearch.js";
import { useRef, useEffect } from "preact/hooks";

import { DynamicWidgets } from "../components/widgets/DynamicWidgets";
import { WidgetAutocomplete } from "../components/widgets/WidgetAutocomplete";
import { WidgetBreadcrumb } from "../components/widgets/WidgetBreadcrumb";
import { WidgetClearRefinements } from "../components/widgets/WidgetClearRefinements";
import { WidgetConfigure } from "../components/widgets/WidgetConfigure";
import { WidgetCurrentRefinements } from "../components/widgets/WidgetCurrentRefinements";
import { WidgetHits } from "../components/widgets/WidgetHits";
import { WidgetHitsPerPage } from "../components/widgets/WidgetHitsPerPage";
import { WidgetInfiniteHits } from "../components/widgets/WidgetInfiniteHits";
import { WidgetPagination } from "../components/widgets/WidgetPagination";
import { WidgetPoweredBy } from "../components/widgets/WidgetPoweredBy";
import { WidgetRelevantSort } from "../components/widgets/WidgetRelevantSort";
import { WidgetSearchBox } from "../components/widgets/WidgetSearchBox";
import { WidgetSortBy } from "../components/widgets/WidgetSortBy";
import { WidgetStats } from "../components/widgets/WidgetStats";
import { WidgetVoiceSearch } from "../components/widgets/WidgetVoiceSearch";
import { WidgetSwitcher } from "../components/WidgetSwitcher";
import { SearchContext } from "../context/search";

const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

export function InstantSearchView() {
  const searchRef = useRef<ReturnType<typeof instantsearch> | null>(null);
  if (searchRef.current === null) {
    searchRef.current = instantsearch({
      indexName: "instant_search",
      searchClient,
    });
  }

  useEffect(() => {
    const search = searchRef.current!;
    search.start();
    return () => search.dispose();
  }, []);

  return (
    <SearchContext.Provider value={searchRef.current}>
      <div class="flex flex-col gap-2">
        {/* Row 1: Breadcrumb | Stats | SortBy */}
        <div class="flex flex-col gap-2 md:flex-row">
          <WidgetSwitcher
            class="flex-1"
            widgets={[{ title: "breadcrumb", body: WidgetBreadcrumb }]}
          />
          <WidgetSwitcher class="flex-1" widgets={[{ title: "stats", body: WidgetStats }]} />
          <WidgetSwitcher class="flex-1" widgets={[{ title: "sortBy", body: WidgetSortBy }]} />
          <WidgetSwitcher
            class="flex-1"
            widgets={[{ title: "relevantSort", body: WidgetRelevantSort }]}
          />
        </div>

        {/* Row 2: SearchBox / Autocomplete | PoweredBy */}
        <div class="flex flex-col gap-2 sm:flex-row">
          <WidgetSwitcher
            class="flex-1"
            destroy
            widgets={[
              { title: "autocomplete", body: WidgetAutocomplete },
              { title: "searchBox", body: WidgetSearchBox },
              { title: "voiceSearch", body: WidgetVoiceSearch },
            ]}
          />
          <WidgetSwitcher
            class="shrink-0"
            widgets={[{ title: "poweredBy", body: WidgetPoweredBy }]}
          />
        </div>

        {/* Row 3: ClearRefinements | CurrentRefinements */}
        <div class="flex flex-col gap-2 sm:flex-row">
          <WidgetSwitcher
            class="shrink-0"
            widgets={[{ title: "clearRefinements", body: WidgetClearRefinements }]}
          />
          <WidgetSwitcher
            class="flex-1"
            widgets={[{ title: "currentRefinements", body: WidgetCurrentRefinements }]}
          />
        </div>

        {/* Row 4: Sidebar (facets) | Main (hits + pagination) */}
        <div class="flex flex-col gap-2 sm:flex-row">
          <div class="w-full shrink-0 sm:max-w-[296px]">
            <WidgetSwitcher widgets={[{ title: "dynamicWidgets", body: DynamicWidgets }]} />
          </div>

          <div class="flex flex-1 flex-col gap-2">
            <WidgetSwitcher
              class="flex-1"
              widgets={[
                { title: "hits", body: WidgetHits },
                { title: "infiniteHits", body: WidgetInfiniteHits },
              ]}
            />

            <div class="flex flex-col gap-2 md:flex-row">
              <WidgetSwitcher
                class="md:min-w-56"
                widgets={[{ title: "pagination", body: WidgetPagination }]}
              />
              <WidgetSwitcher
                class="flex-1"
                widgets={[{ title: "hitsPerPage", body: WidgetHitsPerPage }]}
              />
            </div>

            <WidgetSwitcher widgets={[{ title: "configure", body: WidgetConfigure }]} />
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
