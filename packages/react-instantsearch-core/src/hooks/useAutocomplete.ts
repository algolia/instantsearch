import { useSearchBox } from '../connectors/useSearchBox';

export function EXPERIMENTAL_useAutocomplete() {
  const { query, refine } = useSearchBox();

  return {
    query,
    refine,
  };
}
