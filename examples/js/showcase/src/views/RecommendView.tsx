import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { useRef, useEffect } from 'preact/hooks';

import { WidgetFrequentlyBoughtTogether } from '../components/widgets/WidgetFrequentlyBoughtTogether';
import { WidgetLookingSimilar } from '../components/widgets/WidgetLookingSimilar';
import { WidgetRelatedProducts } from '../components/widgets/WidgetRelatedProducts';
import { WidgetTrendingFacets } from '../components/widgets/WidgetTrendingFacets';
import { WidgetTrendingItems } from '../components/widgets/WidgetTrendingItems';
import { WidgetSwitcher } from '../components/WidgetSwitcher';
import { SearchContext } from '../context/search';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const SEED_OBJECT_ID = '5723537';
const TRENDING_FACET_NAME = 'brand';

export function RecommendView() {
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

  // Carousel hits draw their hover overlay against `--ais-background-color`
  // (white). Drop the WidgetSwitcher's hover tint so the overlay stays readable.
  const carouselWrapperClass =
    'hover:bg-transparent! dark:hover:bg-transparent!';

  return (
    <SearchContext.Provider value={searchRef.current}>
      <div class="flex flex-col gap-2">
        <WidgetSwitcher
          class={carouselWrapperClass}
          widgets={[
            {
              title: 'frequentlyBoughtTogether',
              body: () => (
                <WidgetFrequentlyBoughtTogether objectIDs={[SEED_OBJECT_ID]} />
              ),
            },
            {
              title: 'relatedProducts',
              body: () => (
                <WidgetRelatedProducts objectIDs={[SEED_OBJECT_ID]} />
              ),
            },
            {
              title: 'lookingSimilar',
              body: () => <WidgetLookingSimilar objectIDs={[SEED_OBJECT_ID]} />,
            },
          ]}
        />

        <WidgetSwitcher
          class={carouselWrapperClass}
          widgets={[{ title: 'trendingItems', body: WidgetTrendingItems }]}
        />

        <WidgetSwitcher
          widgets={[
            {
              title: 'trendingFacets',
              body: () => (
                <WidgetTrendingFacets facetName={TRENDING_FACET_NAME} />
              ),
            },
          ]}
        />
      </div>
    </SearchContext.Provider>
  );
}
