import { createContext } from "preact";
import { useContext } from "preact/hooks";

export type Flavor = "js" | "react" | "vue";

export const FlavorContext = createContext<Flavor>("js");

export function useFlavor() {
  return useContext(FlavorContext);
}
