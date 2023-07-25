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

/* TODO (Codemod generated): custom widgets must be converted to hooks.
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#creating-connectors */
const CustomWidget = createConnector({
  displayName: 'CustomWidget',
  getProvidedProps() {
    return {};
  },
})(RawCustomWidget);

// TODO (Codemod generated): ensure your usage correctly maps the props from the connector to the hook
function connectSearchBox(Component) {
  const SearchBox = (props) => {
    const data = useSearchBox(props);

    return <Component {...props} {...data} />;
  };

  return SearchBox;
}

// TODO (Codemod generated): ensure your usage correctly maps the props from the connector to the hook
function connectHits(Component) {
  const Hits = (props) => {
    const data = useHits(props);

    return <Component {...props} {...data} />;
  };

  return Hits;
}
