import { useChat } from '@ai-sdk/react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hit } from 'instantsearch.js';
import React, { Fragment, createElement, useState } from 'react';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  TrendingItems,
  Carousel,
} from 'react-instantsearch';

import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';
import {
  createChatPromptComponent,
  // createChatMessageComponent,
  createChatMessagesComponent,
  ChatMessageBase,
} from 'instantsearch-ui-components';

import { useStickToBottom } from './useStickToBottom';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const ChatPrompt = createChatPromptComponent({ createElement, Fragment });
// const ChatMessage = createChatMessageComponent({ createElement, Fragment });
const ChatMessages = createChatMessagesComponent({
  createElement,
  Fragment,
});

const Chat = () => {
  const {
    messages,
    setMessages,
    input,
    handleSubmit,
    setInput,
    status,
    stop,
    reload,
  } = useChat({
    api: 'http://localhost:8787',
  });

  const { contentRef, scrollRef, scrollToBottom, isAtBottom } =
    useStickToBottom();

  return (
    <div className="ais-Chat">
      <ChatMessages
        messages={messages}
        status={status}
        onReload={reload}
        contentRef={contentRef}
        scrollRef={scrollRef}
        isScrollAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        assistantMessageProps={{
          actions: [
            {
              title: 'Test',
              onClick: (e, message: ChatMessageBase) => {
                const idx = messages.findIndex((m) => m.id === message?.id);
                if (idx === -1) return;

                const history = messages.slice(0, idx + 1);
                setMessages(history);
                reload();
              },
            },
          ],
        }}
      />

      <ChatPrompt
        value={input}
        onInput={setInput}
        onSubmit={() => handleSubmit()}
        onStop={stop}
        status={status}
      />
    </div>
  );
};

export function App() {
  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Getting started</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch">
            React InstantSearch
          </a>
        </p>
      </header>

      <div className="container">
        <Chat />
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          insights={true}
        >
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />
              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
              <div>
                <TrendingItems
                  itemComponent={ItemComponent}
                  limit={6}
                  layoutComponent={Carousel}
                />
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}

type HitType = Hit<{
  image: string;
  name: string;
  description: string;
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article>
      <h1>
        <a href={`/products.html?pid=${hit.objectID}`}>
          <Highlight attribute="name" hit={hit} />
        </a>
      </h1>
      <p>
        <Highlight attribute="description" hit={hit} />
      </p>
      <a href={`/products.html?pid=${hit.objectID}`}>See product</a>
    </article>
  );
}

function ItemComponent({ item }: { item: Hit }) {
  return (
    <div>
      <article>
        <div>
          <img src={item.image} />
          <h2>{item.name}</h2>
        </div>
        <a href={`/products.html?pid=${item.objectID}`}>See product</a>
      </article>
    </div>
  );
}
