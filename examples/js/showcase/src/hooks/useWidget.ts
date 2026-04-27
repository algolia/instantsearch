import { useRef, useEffect } from 'preact/hooks';

import { useSearch } from '../context/search';

import type { IndexWidget, Widget } from 'instantsearch.js';

type AnyWidget = Widget | IndexWidget;

export function useWidget(
  factory: (container: HTMLElement) => AnyWidget | AnyWidget[]
) {
  const container = useRef<HTMLDivElement>(null);
  const search = useSearch();

  useEffect(() => {
    const result = factory(container.current!);
    const widgets = Array.isArray(result) ? result : [result];
    search.addWidgets(widgets);
    return () => {
      search.removeWidgets(widgets);
    };
  }, []);

  return container;
}
