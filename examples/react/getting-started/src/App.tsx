import { useChat } from '@ai-sdk/react';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  createChatPromptComponent,
  createChatMessagesComponent,
  createChatToggleButtonComponent,
  createChatHeaderComponent,
  ChatMessageBase,
} from 'instantsearch-ui-components';
import { Hit } from 'instantsearch.js';
import { compiler } from 'markdown-to-jsx';
import React, { Fragment, createElement } from 'react';
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
import { useStickToBottom } from './useStickToBottom';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '93aba0bf5908533b213d93b2410ded0c'
);

const ChatPrompt = createChatPromptComponent({ createElement, Fragment });
// const ChatMessage = createChatMessageComponent({ createElement, Fragment });
const ChatMessages = createChatMessagesComponent({
  createElement,
  Fragment,
});
const ChatToggleButton = createChatToggleButtonComponent({
  createElement,
  Fragment,
});
const ChatHeader = createChatHeaderComponent({
  createElement,
  Fragment,
});

function renderMarkdown(messages: ChatMessageBase[]) {
  return messages.map((message) => {
    if (message.role === 'assistant') {
      return {
        ...message,
        parts: message.parts.map((part) => {
          if (part.type === 'text') {
            return {
              ...part,
              markdown: compiler(part.text, {
                disableParsingRawHTML: true,
              }),
            };
          }
          return part;
        }),
      };
    }
    return message;
  });
}

const Chat = ({ agentId = '61a4839d-3caf-4258-bc77-32c790fa0be9' }) => {
  const [open, setOpen] = React.useState(false);
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
    api: `https://generative-eu.algolia.com/1/agents/${agentId}/completions?stream=true&compatibilityMode=ai-sdk-4`,
    headers: {
      'x-algolia-application-id': 'F4T6CUV2AH',
      'X-Algolia-API-Key': '93aba0bf5908533b213d93b2410ded0c',
    },
  });
  const { contentRef, scrollRef, scrollToBottom, isAtBottom } =
    useStickToBottom();
  const renderedMessages = renderMarkdown(messages);

  return (
    <>
      {!open ? (
        <ChatToggleButton
          open={false}
          onClick={() => setOpen(true)}
          openLabel="Open chat"
        />
      ) : (
        <div className="ais-Chat">
          <ChatHeader onClose={() => setOpen(false)} />
          <ChatMessages
            messages={renderedMessages}
            status={status}
            onReload={reload}
            contentRef={contentRef}
            scrollRef={scrollRef}
            isScrollAtBottom={isAtBottom}
            scrollToBottom={scrollToBottom}
            userMessageProps={{
              actions: [
                {
                  title: 'edit',
                  icon: () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM14.06 6.19l3.75 3.75"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                  onClick: (message) => {
                    const idx = messages.findIndex((m) => m.id === message?.id);
                    if (idx === -1) return;

                    const history = messages.slice(0, idx);
                    setMessages(history);
                    setInput(message.content);
                    stop();
                  },
                },
              ],
            }}
            assistantMessageProps={{
              actions: [
                {
                  title: 'Regenerate response',
                  icon: () => (
                    <svg width="16" height="16" viewBox="0 0 512 512">
                      <path d="M436.6,75.4C390.1,28.9,326.7,0,256,0C114.5,0,0,114.5,0,256s114.5,256,256,256 c119.2,0,218.8-81.9,247.6-191.8h-67c-26.1,74.5-96.8,127.5-180.6,127.5c-106.1,0-191.8-85.6-191.8-191.8S149.9,64.2,256,64.2 c53.1,0,100.5,22.3,135,56.8L287.7,224.3H512V0L436.6,75.4z" />
                    </svg>
                  ),
                  onClick: (message) => {
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
      )}
    </>
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
          indexName="products"
          insights={true}
        >
          <Configure hitsPerPage={8} filters="type:book" />
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
  title: string;
  type: string;
  pubYear: number;
  priceDisplay: string;
  isbn: string[];
  binding: string;
  publicationDate: number;
  salesRank: number;
  asin: string;
  author: string[];
  label: string[];
  mediumImage: string;
  price: number;
  detailPageURL: string;
  largeImage: string;
  brand: string[];
  hasImg: boolean;
  smallImage: string;
  formattedPrice: string;
  categories: string[];
  publisher: string;
  freshness: number;
  featured: boolean;
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      {hit.mediumImage && (
        <a href={`/products.html?pid=${hit.objectID}`}>
          <img
            src={hit.mediumImage}
            alt={hit.title}
            style={{
              width: 80,
              height: 120,
              objectFit: 'cover',
              borderRadius: '4px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          />
        </a>
      )}
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
          <a
            href={`/products.html?pid=${hit.objectID}`}
            style={{ color: '#333', textDecoration: 'none' }}
          >
            <Highlight attribute="title" hit={hit} />
          </a>
        </h2>
        <div style={{ color: '#888', fontSize: '0.95rem', marginBottom: 8 }}>
          <Highlight attribute="type" hit={hit} />
          {hit.author && hit.author.length > 0 && (
            <> &middot; {hit.author.join(', ')}</>
          )}
        </div>
        <div style={{ marginBottom: 8 }}>
          <span
            style={{
              fontWeight: 600,
              color: '#1976d2',
              fontSize: '1rem',
            }}
          >
            {hit.price.toPrecision(2)}
          </span>
          {hit.pubYear && (
            <span style={{ marginLeft: 12, color: '#aaa', fontSize: '0.9rem' }}>
              {hit.pubYear}
            </span>
          )}
        </div>
        <a
          href={`/products.html?pid=${hit.objectID}`}
          style={{
            display: 'inline-block',
            marginTop: 4,
            padding: '6px 14px',
            background: '#1976d2',
            color: '#fff',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
        >
          See product
        </a>
      </div>
    </article>
  );
}

function ItemComponent({ item }: { item: HitType }) {
  return (
    <div>
      <article>
        <div>
          <img src={item.mediumImage} />
          <h2>{item.title}</h2>
        </div>
        <a href={`/products.html?pid=${item.objectID}`}>See product</a>
      </article>
    </div>
  );
}
