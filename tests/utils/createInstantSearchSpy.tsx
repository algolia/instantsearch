import React, { createRef } from 'react';

import { InstantSearch } from '../../packages/react-instantsearch-hooks/src/components/InstantSearch';
import { IndexContext } from '../../packages/react-instantsearch-hooks/src/lib/IndexContext';
import { InstantSearchContext } from '../../packages/react-instantsearch-hooks/src/lib/InstantSearchContext';

import type { InstantSearchProps } from '../../packages/react-instantsearch-hooks/src';
import type { InstantSearch as InstantSearchType } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

export function createInstantSearchSpy() {
  const searchContext = createRef<InstantSearchType>();
  const indexContext = createRef<IndexWidget>();
  const isSpyAttachedRef = createRef<boolean>();

  function InstantSearchSpy({ children, ...props }: InstantSearchProps) {
    return (
      <InstantSearch {...props}>
        <InstantSearchContext.Consumer>
          {(searchContextValue) => {
            if (!isSpyAttachedRef.current) {
              searchContextValue!.start = jest.fn(
                searchContextValue!.start.bind(searchContextValue)
              );
              searchContextValue!.dispose = jest.fn(
                searchContextValue!.dispose.bind(searchContextValue)
              );
            }

            // @ts-ignore `React.RefObject` is typed as immutable
            searchContext.current = searchContextValue;

            return (
              <InstantSearchContext.Provider value={searchContext.current}>
                <IndexContext.Consumer>
                  {(indexContextValue) => {
                    if (!isSpyAttachedRef.current) {
                      indexContextValue!.addWidgets = jest.fn(
                        indexContextValue!.addWidgets.bind(indexContextValue)
                      );
                      indexContextValue!.removeWidgets = jest.fn(
                        indexContextValue!.removeWidgets.bind(indexContextValue)
                      );
                    }

                    // @ts-ignore `React.RefObject` is typed as immutable
                    indexContext.current = indexContextValue;
                    // @ts-ignore `React.RefObject` is typed as immutable
                    isSpyAttachedRef.current = true;

                    return (
                      <IndexContext.Provider value={indexContext.current}>
                        {children}
                      </IndexContext.Provider>
                    );
                  }}
                </IndexContext.Consumer>
              </InstantSearchContext.Provider>
            );
          }}
        </InstantSearchContext.Consumer>
      </InstantSearch>
    );
  }

  return {
    InstantSearchSpy,
    searchContext,
    indexContext,
  };
}
