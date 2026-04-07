import { liteClient as algoliasearch } from "algoliasearch/lite";
import instantsearch from "instantsearch.js";
import { configure } from "instantsearch.js/es/widgets";
import { useRef, useEffect } from "preact/hooks";

import { WidgetAirportHits } from "../components/widgets/WidgetAirportHits";
import { WidgetGeoSearch } from "../components/widgets/WidgetGeoSearch";
import { WidgetPoweredBy } from "../components/widgets/WidgetPoweredBy";
import { WidgetSearchBox } from "../components/widgets/WidgetSearchBox";
import { WidgetSwitcher } from "../components/WidgetSwitcher";
import { SearchContext } from "../context/search";

const searchClient = algoliasearch("CU1AX86Y0U", "bdb7f28818e99b5eec688fd1909d7543");

export function GeoSearchView() {
  const searchRef = useRef(
    instantsearch({
      indexName: "aiports",
      searchClient,
    }),
  );

  useEffect(() => {
    const search = searchRef.current;
    search.addWidgets([
      configure({
        hitsPerPage: 6,
        getRankingInfo: true,
        aroundLatLngViaIP: true,
        typoTolerance: "min",
      }),
    ]);
    search.start();
    return () => search.dispose();
  }, []);

  return (
    <SearchContext.Provider value={searchRef.current}>
      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-2 sm:flex-row">
          <WidgetSwitcher
            class="flex-1"
            widgets={[{
              title: "searchBox",
              body: () => <WidgetSearchBox placeholder="Search for airports..." />,
            }]}
          />
          <WidgetSwitcher
            class="shrink-0"
            widgets={[{ title: "poweredBy", body: WidgetPoweredBy }]}
          />
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
          <WidgetSwitcher
            class="flex-1"
            widgets={[{ title: "hits", body: WidgetAirportHits, docs: ["hits"] }]}
          />
          <WidgetSwitcher
            class="flex-1"
            destroy
            widgets={[{ title: "geoSearch", body: WidgetGeoSearch }]}
          />
        </div>
      </div>
    </SearchContext.Provider>
  );
}
