import { storiesOf } from '@storybook/react';
import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { EXPERIMENTAL_Answers as Answers } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('Answers', module);

const searchClient = algoliasearch(
  'CKOEQ4XGMU',
  '6560d3886292a5aec86d63b9a2cba447'
);

stories.add('default', () => {
  return (
    <WrapWithHits
      linkedStoryGroup="Hits.stories.js"
      appId="CKOEQ4XGMU"
      apiKey="6560d3886292a5aec86d63b9a2cba447"
      indexName="ted"
    >
      <Answers
        searchClient={searchClient}
        attributesForPrediction={['description']}
      />
    </WrapWithHits>
  );
});
