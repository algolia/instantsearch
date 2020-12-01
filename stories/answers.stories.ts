import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import { answers } from '../src/widgets';

storiesOf('Results/Answers', module).add(
  'default',
  withHits(
    ({ search, container }) => {
      const p = document.createElement('p');
      p.innerText = `Try to search for "sarah jones"`;
      const answersContainer = document.createElement('div');
      container.appendChild(p);
      container.appendChild(answersContainer);

      search.addWidgets([
        answers({
          container: answersContainer,
          attributesForPrediction: ['description'],
        }),
      ]);
    },
    {
      appId: 'CKOEQ4XGMU',
      apiKey: '6560d3886292a5aec86d63b9a2cba447',
      indexName: 'ted',
    }
  )
);
