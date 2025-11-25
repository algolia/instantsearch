export type Theme = 'auto' | 'light' | 'dark';

export interface DevtoolsOptions {
  container?: HTMLElement;
  style?: Partial<CSSStyleDeclaration>;
}

/**
 * Creates an InstantSearch.css DevTools panel to configure CSS variables in real-time.
 * @returns A promise that resolves to a cleanup function to dispose the panel
 */
export function createInstantSearchDevtools(
  options?: DevtoolsOptions
): Promise<() => void>;
