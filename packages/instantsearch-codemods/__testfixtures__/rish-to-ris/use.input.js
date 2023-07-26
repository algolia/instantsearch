import { useInstantSearch, useSearchBox } from 'react-instantsearch-hooks-web';
import { use } from 'react';

function MyApp() {
  const { use } = useInstantSearch();
  const { use: use1 } = useInstantSearch();
  const use2 = useInstantSearch().use;
  const unaffected = useSearchBox();

  use(new Promise());

  useEffect(() => {
    return use(() => {});
  });

  useEffect(() => {
    return use1(() => {});
  }, []);

  useEffect(() => {
    return use2(() => {});
  }, []);

  return null;
}
