import { useInstantSearch, useSearchBox } from 'react-instantsearch';
import { use } from 'react';

function MyApp() {
  const { addMiddlewares: use } = useInstantSearch();
  const { addMiddlewares: use1 } = useInstantSearch();
  const use2 = useInstantSearch().addMiddlewares;
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
