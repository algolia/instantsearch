/** @jsx h */
// @ts-check
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  createChatPromptComponent,
  createChatMessageComponent,
  createChatMessagesComponent,
} from 'instantsearch-ui-components';
import instantsearch from 'instantsearch.js';
import { carousel } from 'instantsearch.js/es/templates';
import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
  trendingItems,
} from 'instantsearch.js/es/widgets';
import { h, render, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
});

const ChatPrompt = createChatPromptComponent({ createElement: h, Fragment });
// const ChatMessage = createChatMessageComponent({ createElement: h, Fragment });
const ChatMessages = createChatMessagesComponent({
  createElement: h,
  Fragment,
});

const Chat = () => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="ais-Chat">
      <ChatMessages
        messages={[
          { id: '1', role: 'user', content: 'Hello' },
          { id: '2', role: 'assistant', content: 'Hello' },
          { id: '3', role: 'user', content: 'Hello' },
          { id: '4', role: 'assistant', content: 'Hello' },
          { id: '5', role: 'user', content: 'Hello' },
          { id: '6', role: 'assistant', content: 'Hello' },
          { id: '7', role: 'user', content: 'Hello' },
          { id: '8', role: 'assistant', content: 'Hello' },
          { id: '9', role: 'user', content: 'Hello' },
          { id: '10', role: 'assistant', content: 'Hello' },
        ]}
      />

      <ChatPrompt value={prompt} onInput={setPrompt} />
    </div>
  );
};

render(<Chat />, document.getElementById('chat')!);

search.addWidgets([
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article>
          <h1>
            <a href="/products.html?pid=${hit.objectID}"
              >${components.Highlight({ hit, attribute: 'name' })}</a
            >
          </h1>
          <p>${components.Highlight({ hit, attribute: 'description' })}</p>
          <a href="/products.html?pid=${hit.objectID}">See product</a>
        </article>
      `,
    },
  }),
  configure({
    hitsPerPage: 8,
  }),
  panel({
    templates: { header: 'brand' },
  })(refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
  pagination({
    container: '#pagination',
  }),
  trendingItems({
    container: '#trending',
    limit: 6,
    templates: {
      item: (item, { html }) => html`
        <div>
          <article>
            <div>
              <img src="${item.image}" />
              <h2>${item.name}</h2>
            </div>
            <a href="/products.html?pid=${item.objectID}">See product</a>
          </article>
        </div>
      `,
      layout: carousel(),
    },
  }),
]);

search.start();
