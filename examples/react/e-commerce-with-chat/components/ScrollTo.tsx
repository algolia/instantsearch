import { Middleware } from 'instantsearch.js';
import React, { useEffect, useRef } from 'react';
import { useInstantSearch } from 'react-instantsearch';

export function ScrollTo({ children }: { children: React.ReactNode }) {
  const { addMiddlewares } = useInstantSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const middleware: Middleware = () => {
      return {
        onStateChange() {
          const isFiltering = document.body.classList.contains('filtering');
          const isTyping =
            document.activeElement?.tagName === 'INPUT' &&
            document.activeElement?.getAttribute('type') === 'search';

          if (isFiltering || isTyping) {
            return;
          }

          containerRef.current!.scrollIntoView();
        },
      };
    };

    return addMiddlewares(middleware);
  }, [addMiddlewares]);

  return (
    <div ref={containerRef} className="ais-ScrollTo">
      {children}
    </div>
  );
}
