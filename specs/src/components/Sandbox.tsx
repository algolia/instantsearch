/* eslint-disable react/react-in-jsx-scope */
import { Sandpack } from '@codesandbox/sandpack-react';
import { githubLight } from '@codesandbox/sandpack-themes';
import dedent from 'dedent';

const settings = {
  js: {
    html: /* HTML */ `
      <style>
        body {
          font-family: sans-serif;
        }
      </style>
      <div id="custom"></div>
      <div id="searchbox"></div>
      <div id="hits"></div>
    `,
    preamble: /* JS */ `
    import 'instantsearch.css/themes/satellite-min.css';
    import algoliasearch from 'algoliasearch/lite';
    import instantsearch from 'instantsearch.js';
    import { history } from 'instantsearch.js/es/lib/routers';
    import { searchBox, hits } from 'instantsearch.js/es/widgets';
    import { createWidgets } from './widget.ts';

    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
      future: {
        preserveSharedStateOnUnmount: true,
      },
      routing: {
        router: history({
          cleanUrlOnDispose: false,
        })
      }
    });

    search.addWidgets([
      ...createWidgets(document.querySelector('#custom')),
      searchBox({
        container: '#searchbox',
      }),
      hits({
        container: '#hits',
        templates: {
          item: (hit, { components }) => components.Highlight({ attribute: 'name', hit }),
        },
      }),
    ]);

    search.start();
    `,
    dependencies: {
      // TODO: use current version somehow, both locally and in the built website
      'instantsearch.js': 'latest',
      'instantsearch.css': 'latest',
      algoliasearch: 'latest',
    },
    filename: '/widget.ts',
  },
  react: {
    html: /* HTML */ `
      <style>
        body {
          font-family: sans-serif;
        }
      </style>
      <main id="root"></main>
    `,
    preamble: /* TSX */ `
    import 'instantsearch.css/themes/satellite-min.css';
    import React from "react";
    import { createRoot } from "react-dom/client";
    import algoliasearch from "algoliasearch/lite";
    import { history } from "instantsearch.js/es/lib/routers";
    import { InstantSearch, SearchBox, Hits, Highlight } from "react-instantsearch";
    import { widgets } from "./widget.tsx";

    createRoot(document.getElementById('root')).render(
      <InstantSearch
        indexName="instant_search"
        searchClient={algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76')}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
        routing={{
          router: history({
            cleanUrlOnDispose: false,
          })
        }}
      >
        {widgets}
        <SearchBox />
        <Hits hitComponent={Hit}/>
      </InstantSearch>
    );

    function Hit({ hit }) {
      return <Highlight hit={hit} attribute="name" />;
    }
    `,
    dependencies: {
      react: 'latest',
      'react-dom': 'latest',
      algoliasearch: 'latest',
      'instantsearch.css': 'latest',
      'react-instantsearch': 'latest',
    },
    filename: '/widget.tsx',
  },
  vue: {
    html: /* HTML */ `
      <style>
        body {
          font-family: sans-serif;
        }
      </style>
      <main id="app"></main>
    `,
    preamble: `
    import "instantsearch.css/themes/satellite-min.css";
    import Vue from "vue";
    import algoliasearch from "algoliasearch/lite";
    import { history } from "instantsearch.js/es/lib/routers";
    import { AisInstantSearch, AisHits, AisSearchBox } from "vue-instantsearch/vue2/es";
    import Widget from "./Widget.vue";

    Vue.config.productionTip = false;

    new Vue({
      render: (h) =>
        h(
          AisInstantSearch,
          {
            props: {
              searchClient: algoliasearch(
                "latency",
                "6be0576ff61c053d5f9a3225e2a90f76"
              ),
              indexName: "instant_search",
              future: {
                preserveSharedStateOnUnmount: true,
              },
              routing: {
                router: history({
                  cleanUrlOnDispose: false,
                })
              }
            },
          },
          [h(Widget), h(AisSearchBox), h(AisHits)]
        ),
    }).$mount("#app");
    `,
    dependencies: {
      vue: '2',
      algoliasearch: 'latest',
      'instantsearch.css': 'latest',
      'vue-instantsearch': 'latest',
    },
    filename: '/Widget.vue',
  },
};

export default function Sandbox({
  code,
  flavor,
}: {
  code: string;
  flavor: 'react' | 'js' | 'vue';
}) {
  const { preamble, html, filename, dependencies } = settings[flavor];
  return (
    <Sandpack
      files={{
        '/index.html': {
          hidden: true,
          code: dedent(html),
        },
        '/index.js': {
          code: dedent(preamble),
        },
        [filename]: {
          code,
        },
      }}
      customSetup={{
        dependencies,
        entry: '/index.js',
      }}
      options={{
        activeFile: filename,
        showNavigator: true,
      }}
      theme={githubLight}
    />
  );
}
