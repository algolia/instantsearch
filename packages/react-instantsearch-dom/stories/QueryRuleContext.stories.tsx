import { storiesOf } from '@storybook/react';
import React from 'react';
import { connectHits } from 'react-instantsearch-core';
import {
  QueryRuleCustomData,
  QueryRuleContext,
  Highlight,
  RefinementList,
} from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

type CustomDataItem = {
  title: string;
  banner: string;
  link: string;
};

type MovieHit = {
  actors: string[];
  color: string;
  genre: string[];
  image: string;
  objectID: string;
  score: number;
  title: string;
};

const stories = storiesOf('QueryRuleContext', module);

const StoryHits = connectHits(({ hits }: { hits: MovieHit[] }) => (
  <div className="hits">
    {hits.map((hit) => (
      <div key={hit.objectID} className="hit">
        <div className="hit-picture">
          <img src={hit.image} />
        </div>

        <div className="hit-content">
          <div>
            <Highlight attribute="title" hit={hit} />
          </div>
        </div>
      </div>
    ))}
  </div>
));

const storyProps = {
  appId: 'latency',
  apiKey: 'af044fb0788d6bb15f807e4420592bc5',
  indexName: 'instant_search_movies',
  linkedStoryGroup: 'QueryRuleContext.stories.tsx',
  hitsElement: <StoryHits />,
};

stories
  .add('default', () => (
    <WrapWithHits {...storyProps}>
      <ul>
        <li>
          On empty query, select the &quot;Drama&quot; category and The
          Shawshank Redemption appears
        </li>
        <li>
          On empty query, select the &quot;Thriller&quot; category and Pulp
          Fiction appears
        </li>
        <li>
          Type <q>music</q> and a banner will appear
        </li>
      </ul>

      <div style={{ display: 'flex' }}>
        <aside style={{ flex: 1 }}>
          <RefinementList attribute="genre" />
        </aside>

        <main style={{ flex: 2 }}>
          <QueryRuleContext
            trackedFilters={{
              genre: () => ['Drama', 'Thriller'],
            }}
          />

          <QueryRuleCustomData>
            {({ items }: { items: CustomDataItem[] }) =>
              items.map(({ banner, title, link }) => {
                if (!banner) {
                  return null;
                }

                return (
                  <section key={title}>
                    <h2>{title}</h2>

                    <a href={link}>
                      <img src={banner} alt={title} />
                    </a>
                  </section>
                );
              })
            }
          </QueryRuleCustomData>
        </main>
      </div>
    </WrapWithHits>
  ))
  .add('with default rule context', () => (
    <WrapWithHits {...storyProps}>
      <ul>
        <li>The rule context `ais-genre-Drama` is applied by default</li>
        <li>
          Select the &quot;Drama&quot; category and The Shawshank Redemption
          appears
        </li>
        <li>
          Select the &quot;Thriller&quot; category and Pulp Fiction appears
        </li>
        <li>
          Type <q>music</q> and a banner will appear
        </li>
      </ul>

      <div style={{ display: 'flex' }}>
        <aside style={{ flex: 1 }}>
          <RefinementList attribute="genre" />
        </aside>

        <main style={{ flex: 2 }}>
          <QueryRuleContext
            trackedFilters={{
              genre: () => ['Drama', 'Thriller'],
            }}
            transformRuleContexts={(ruleContexts: string[]) => {
              if (ruleContexts.length === 0) {
                return ['ais-genre-Drama'];
              }

              return ruleContexts;
            }}
          />

          <QueryRuleCustomData>
            {({ items }: { items: CustomDataItem[] }) =>
              items.map(({ banner, title, link }) => {
                if (!banner) {
                  return null;
                }

                return (
                  <section key={title}>
                    <h2>{title}</h2>

                    <a href={link}>
                      <img src={banner} alt={title} />
                    </a>
                  </section>
                );
              })
            }
          </QueryRuleCustomData>
        </main>
      </div>
    </WrapWithHits>
  ));
