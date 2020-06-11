import React from 'react';
import qs from 'qs';
import { useLocation, useHistory } from 'react-router-dom';
import {
  InstantSearch,
  HierarchicalMenu,
  Hits,
  Menu,
  Pagination,
  PoweredBy,
  RatingMenu,
  RefinementList,
  SearchBox,
  ClearRefinements,
} from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const DEBOUNCE_TIME = 700;

const createURL = state => `?${qs.stringify(state)}`;

const searchStateToUrl = (location, searchState) =>
  searchState ? `${location.pathname}${createURL(searchState)}` : '';

const urlToSearchState = location => qs.parse(location.search.slice(1));

function App() {
  const location = useLocation();
  const history = useHistory();
  const [searchState, setSearchState] = React.useState(
    urlToSearchState(location)
  );
  const setStateId = React.useRef();

  React.useEffect(() => {
    const nextSearchState = urlToSearchState(location);

    if (JSON.stringify(searchState) !== JSON.stringify(nextSearchState)) {
      setSearchState(nextSearchState);
    }

    // eslint-disable-next-line
  }, [location]);

  function onSearchStateChange(nextSearchState) {
    clearTimeout(setStateId.current);

    setStateId.current = setTimeout(() => {
      history.push(
        searchStateToUrl(location, nextSearchState),
        nextSearchState
      );
    }, DEBOUNCE_TIME);

    setSearchState(nextSearchState);
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="instant_search"
      searchState={searchState}
      onSearchStateChange={onSearchStateChange}
      createURL={createURL}
    >
      <div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <SearchBox />
          <PoweredBy />
        </div>

        <div style={{ display: 'flex' }}>
          <div style={{ padding: '0px 20px' }}>
            <p>Hierarchical Menu</p>
            <HierarchicalMenu
              id="categories"
              attributes={[
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ]}
            />
            <p>Menu</p>
            <Menu attribute="type" />
            <p>Refinement List</p>
            <RefinementList attribute="brand" />
            <p>Range Ratings</p>
            <RatingMenu attribute="rating" max={6} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <ClearRefinements />
            </div>
            <div>
              <Hits />
            </div>
            <div style={{ alignSelf: 'center' }}>
              <Pagination showLast={true} />
            </div>
          </div>
        </div>
      </div>
    </InstantSearch>
  );
}

export default App;
