import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import { answers } from '../src/widgets';
import { highlight } from '../src/helpers';
// import algoliasearch from 'algoliasearch/lite';
import './algoliasearch.umd';

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
          searchClient: window.algoliasearch(
            'CKOEQ4XGMU',
            '6560d3886292a5aec86d63b9a2cba447'
          ),
          templates: {
            loader: 'Thinking...',
            item: hit => {
              return `
                <article>
                  <h1>${highlight({ attribute: 'title', hit })}</h1>
                  <p>${hit._answer.extract}</p>
                  <a href="${
                    hit.url
                  }" rel="noopener" target="_blank">Watch →</a>
                </article>
              `;
            },
          },
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
