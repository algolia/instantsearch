import { InstantSearch, useSearchBox, useHits } from 'react-instantsearch';

function App() {
  return (
    <InstantSearch>
      <SearchBox />
      <Hits />
      <CustomWidget />
    </InstantSearch>
  );
}

const SearchBox = connectSearchBox(({ currentRefinement, refine }) => {
  return (
    <input value={currentRefinement} onChange={(e) => refine(e.target.value)} />
  );
});

function RawHits({ hits }) {
  return (
    <ul>
      {hits.map((hit) => (
        <li key={hit.objectID}>{hit.name}</li>
      ))}
    </ul>
  );
}

const Hits = connectHits(RawHits);

const RawCustomWidget = () => null;

/*
 * TODO: custom widgets must be converted to hooks.
 * See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#creating-connectors
 */
const CustomWidget = createConnector({
  displayName: 'CustomWidget',
  getProvidedProps() {
    return {};
  },
})(RawCustomWidget);

// TODO: ensure your usage correctly maps the props from the connector to the hook
function connectSearchBox(renderFn) {
  const SearchBox = (props) => {
    const data = useSearchBox(props);

    return renderFn({ ...props, ...data });
  };

  return SearchBox;
}

// TODO: ensure your usage correctly maps the props from the connector to the hook
function connectHits(renderFn) {
  const Hits = (props) => {
    const data = useHits(props);

    return renderFn({ ...props, ...data });
  };

  return Hits;
}
