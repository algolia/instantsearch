import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export const ViewContext = createContext<string>('');

export function useView() {
  return useContext(ViewContext);
}
