import { InstantSearch, MenuSelect } from 'react-instantsearch-dom';

function App() {
  return (
    <InstantSearch>
      <MenuSelect attribute="category" />
    </InstantSearch>
  );
}
