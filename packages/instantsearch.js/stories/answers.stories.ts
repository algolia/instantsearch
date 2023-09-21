import { storiesOf } from '@storybook/html';

import { withHits } from '../.storybook/decorators';
import '../.storybook/static/answers.css';

const searchOptions = {
  appId: 'CKOEQ4XGMU',
  apiKey: '6560d3886292a5aec86d63b9a2cba447',
  indexName: 'ted',
};

storiesOf('Results/Answers', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      const p = document.createElement('p');
      p.innerText = `Try to search for "sarah jones"`;
      const answersContainer = document.createElement('div');
      container.appendChild(p);
      container.appendChild(answersContainer);

      search.addWidgets([
        instantsearch.widgets.EXPERIMENTAL_answers({
          container: answersContainer,
          queryLanguages: ['en'],
          attributesForPrediction: ['description'],
          templates: {
            item: (hit, { html }) => html`<p>${hit._answer.extract}</p>`,
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'with header',
    withHits(({ search, container, instantsearch }) => {
      const p = document.createElement('p');
      p.innerText = `Try to search for "sarah jones"`;
      const answersContainer = document.createElement('div');
      container.appendChild(p);
      container.appendChild(answersContainer);

      search.addWidgets([
        instantsearch.widgets.EXPERIMENTAL_answers({
          container: answersContainer,
          queryLanguages: ['en'],
          attributesForPrediction: ['description'],
          templates: {
            header: ({ hits }) => {
              return hits.length === 0 ? '' : `<p>Answers</p>`;
            },
            item: (hit, { html }) => html`<p>${hit._answer.extract}</p>`,
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'with loader',
    withHits(({ search, container, instantsearch }) => {
      const p = document.createElement('p');
      p.innerText = `Try to search for "sarah jones"`;
      const answersContainer = document.createElement('div');
      container.appendChild(p);
      container.appendChild(answersContainer);

      search.addWidgets([
        instantsearch.widgets.EXPERIMENTAL_answers({
          container: answersContainer,
          queryLanguages: ['en'],
          attributesForPrediction: ['description'],
          templates: {
            header: ({ hits }, { html }) => {
              return hits.length === 0 ? '' : html`<p>Answers</p>`;
            },
            loader: () => `loading...`,
            item: (hit, { html }) => html`<p>${hit._answer.extract}</p>`,
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'full example',
    withHits(({ search, container, instantsearch }) => {
      const p = document.createElement('p');
      p.innerText = `Try to search for "sarah jones"`;
      const answersContainer = document.createElement('div');
      container.appendChild(p);
      container.appendChild(answersContainer);

      search.addWidgets([
        instantsearch.widgets.EXPERIMENTAL_answers({
          container: answersContainer,
          queryLanguages: ['en'],
          attributesForPrediction: ['description'],
          cssClasses: {
            root: 'my-Answers',
          },
          templates: {
            loader: (_, { html }) => html`
              <div class="card-skeleton">
                <div class="animated-background">
                  <div class="skel-mask-container">
                    <div class="skel-mask skel-mask-1"></div>
                    <div class="skel-mask skel-mask-2"></div>
                    <div class="skel-mask skel-mask-3"></div>
                  </div>
                </div>
              </div>
            `,
            item: (hit, { html }) => html`
              <p class="title one-line">${hit.title}</p>
              <div class="separator"></div>
              <p class="description three-lines">${hit._answer.extract}</p>
            `,
          },
        }),
      ]);
    }, searchOptions)
  );
