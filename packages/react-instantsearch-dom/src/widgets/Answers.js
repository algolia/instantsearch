import React from 'react';

import { createClassNames } from '../core/utils';
import useAnswers from '../hooks/useAnswers';

const cx = createClassNames('Answers');

/* eslint-disable react/prop-types */
function DefaultAnswersComponent({ isLoading, hits }) {
  return (
    <div className={cx('', hits.length === 0 && '-empty')}>
      <div className={cx('header')}></div>
      {isLoading ? (
        <div className={cx('loader')}></div>
      ) : (
        <ul className={cx('list')}>
          {hits.map((hit, index) => (
            <li key={index} className={cx('item')}>
              {JSON.stringify(hit)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Answers({
  searchClient,
  queryLanguages,
  attributesForPrediction,
  nbHits = 1,
  renderDebounceTime,
  searchDebounceTime,
  answersComponent: AnswersComponent = DefaultAnswersComponent,
  ...extraParameters
}) {
  const { hits, isLoading } = useAnswers({
    searchClient,
    queryLanguages,
    attributesForPrediction,
    nbHits,
    renderDebounceTime,
    searchDebounceTime,
    ...extraParameters,
  });

  return <AnswersComponent hits={hits} isLoading={isLoading} />;
}
/* eslint-enable react/prop-types */
