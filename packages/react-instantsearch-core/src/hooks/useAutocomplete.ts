import { useSearchBox } from '../connectors/useSearchBox';

export function useAutocomplete() {
  const { query, refine } = useSearchBox();

  return {
    query,
    refine,
  };
}
