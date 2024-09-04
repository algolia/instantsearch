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
      <hr />
      <div id="searchbox"></div>
      <div id="hits"></div>
    `,
    preamble: /* JS */ `
    import 'instantsearch.css/themes/satellite-min.css';
    import { liteClient as algoliasearch } from 'algoliasearch/lite';
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
        }),
      },
    });

    search.addWidgets([
      ...createWidgets(() =>
        document.querySelector('#custom').appendChild(document.createElement('div'))
      ),
      searchBox({
        container: '#searchbox',
      }),
      hits({
        container: '#hits',
        templates: {
          item: (hit, { components }) =>
            components.Highlight({ attribute: 'name', hit }),
        },
      }),
    ]);

    search.start();
    `,
    dependencies: {
      algoliasearch: '5.1.1',
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
    import { liteClient as algoliasearch } from "algoliasearch/lite";
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
        <hr />
        <SearchBox />
        <Hits hitComponent={Hit}/>
      </InstantSearch>
    );

    function Hit({ hit }) {
      return <Highlight hit={hit} attribute="name" />;
    }
    `,
    dependencies: {
      react: '18.2.0',
      'react-dom': '18.2.0',
      algoliasearch: '5.1.1',
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
    import { liteClient as algoliasearch } from "algoliasearch/lite";
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
          [h(Widget), h('hr'), h(AisSearchBox), h(AisHits)]
        ),
    }).$mount("#app");
    `,
    dependencies: {
      vue: '2.7.14',
      algoliasearch: '5.1.1',
    },
    filename: '/Widget.vue',
  },
};

export default function Sandbox({
  code,
  flavor,
  modules,
}: {
  code: string;
  flavor: 'react' | 'js' | 'vue';
  modules: {
    files: Record<string, string>;
    dependencies: Record<string, string>;
  };
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
        ...modules.files,
      }}
      customSetup={{
        dependencies: {
          ...dependencies,
          ...modules.dependencies,
        },
        entry: '/index.js',
      }}
      options={{
        editorHeight: 500,
        activeFile: filename,
        showNavigator: true,
      }}
      theme={githubLight}
    />
  );
}
