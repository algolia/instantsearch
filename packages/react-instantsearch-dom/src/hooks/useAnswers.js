import React, { useState, useEffect, useMemo, useContext } from 'react';
import { instantSearchContext } from 'react-instantsearch-core';

import { createConcurrentSafePromise } from '../lib/createConcurrentSafePromise';
import { debounce } from '../lib/debounce';

function hasReactHooks() {
  // >= 16.8.0
  const [major, minor] = React.version.split('.').map(Number);
  return major >= 17 || (major === 16 && minor >= 8);
}

export default function useAnswers({
  searchClient,
  queryLanguages,
  attributesForPrediction,
  nbHits,
  renderDebounceTime = 100,
  searchDebounceTime = 100,
  ...extraParameters
}) {
  if (!hasReactHooks()) {
    throw new Error(
      `\`Answers\` component and \`useAnswers\` hook require all React packages to be 16.8.0 or higher.`
    );
  }
  const context = useContext(instantSearchContext);
  const [query, setQuery] = useState(context.store.getState().widgets.query);
  const [index, setIndex] = useState(context.mainTargetedIndex);
  const [isLoading, setIsLoading] = useState(false);
  const [hits, setHits] = useState([]);
  const runConcurrentSafePromise = useMemo(
    () => createConcurrentSafePromise(),
    []
  );
  const searchIndex = useMemo(
    () => searchClient.initIndex(index),
    [searchClient, index]
  );
  if (!searchIndex.findAnswers) {
    throw new Error(
      '`Answers` component and `useAnswers` hook require `algoliasearch` to be 4.8.0 or higher.'
    );
  }

  const debouncedSearch = useMemo(() => {
    return debounce(searchIndex.findAnswers, searchDebounceTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchIndex]);

  useEffect(() => {
    setIndex(context.mainTargetedIndex);

    return context.store.subscribe(() => {
      const { widgets } = context.store.getState();
      setQuery(widgets.query);
    });
  }, [context]);

  const setDebouncedResult = useMemo(
    () =>
      debounce((result) => {
        setIsLoading(false);
        setHits(result.hits);
      }, renderDebounceTime),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setIsLoading, setHits]
  );

  const fetchAnswers = () => {
    if (!query) {
      setIsLoading(false);
      setHits([]);
      return;
    }
    setIsLoading(true);
    runConcurrentSafePromise(
      debouncedSearch(query, queryLanguages, {
        ...extraParameters,
        nbHits,
        attributesForPrediction,
      })
    ).then((result) => {
      if (!result) {
        // It's undefined when it's debounced.
        return;
      }
      setDebouncedResult(result);
    });
  };

  useEffect(() => {
    fetchAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return { hits, isLoading };
}
