import {
  InstantSearch,
  connectSearchBox,
  connectHits,
  createConnector,
} from 'react-instantsearch-dom';

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

const CustomWidget = createConnector({
  displayName: 'CustomWidget',
  getProvidedProps() {
    return {};
  },
})(RawCustomWidget);
