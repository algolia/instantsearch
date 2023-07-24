/**
 * @jest-environment jsdom
 */

import { createAlgoliaSearchClient } from '@instantsearch/mocks';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import algoliasearch from 'algoliasearch';
import Enzyme, { mount } from 'enzyme';
import React from 'react';

import { connectHits, connectRefinementList, Index } from '../../index';
import InstantSearch from '../InstantSearch';

Enzyme.configure({ adapter: new Adapter() });

describe('metadata', () => {
  const defaultUserAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15';
  const algoliaUserAgent = 'Algolia Crawler 5.3.2';

  Object.defineProperty(
    window.navigator,
    'userAgent',
    ((value) => ({
      get() {
        return value;
      },
      set(v) {
        value = v;
      },
    }))(window.navigator.userAgent)
  );

  afterEach(() => {
    navigator.userAgent = defaultUserAgent;
    document.head.innerHTML = '';
  });

  test('adds no metadata to <head> if not on crawler', () => {
    const RefinementList = connectRefinementList(() => null);
    const Hits = connectHits(() => null);

    mount(
      <InstantSearch
        searchClient={createAlgoliaSearchClient({})}
        indexName="root"
      >
        <RefinementList attribute="brand" />
        <Index indexName="test">
          <Hits />
        </Index>
      </InstantSearch>
    );

    expect(document.head).toMatchInlineSnapshot(`<head />`);
  });

  test('exposes widgets', () => {
    navigator.userAgent = algoliaUserAgent;

    const RefinementList = connectRefinementList(() => null);
    const Hits = connectHits(() => null);

    mount(
      <InstantSearch
        searchClient={createAlgoliaSearchClient({})}
        indexName="root"
      >
        <RefinementList attribute="brand" />
        <Index indexName="test">
          <Hits />
        </Index>
      </InstantSearch>
    );

    expect(document.head.children).toHaveLength(1);

    const meta = document.head.querySelector('meta');

    expect(meta).toEqual(
      expect.objectContaining({
        name: 'algolia:metadata',
        content: expect.any(String),
      })
    );

    expect(JSON.parse(meta.content)).toMatchInlineSnapshot(`
      {
        "ua": "Algolia for JavaScript (test)",
        "widgets": [
          {
            "$$type": "ais.refinementList",
            "displayName": "AlgoliaRefinementList",
            "params": [
              "attribute",
            ],
          },
          {
            "$$type": "ais.hits",
            "displayName": "AlgoliaHits",
            "params": [],
          },
          {
            "$$type": "ais.index",
            "$$widgetType": "ais.index",
            "displayName": "AlgoliaIndex",
            "params": [
              "indexId",
              "indexName",
              "children",
            ],
          },
        ],
      }
    `);
  });

  describe('algoliaAgent', () => {
    test('extracts user agent from algoliasearch v3', () => {
      navigator.userAgent = algoliaUserAgent;

      mount(
        <InstantSearch
          searchClient={{ _ua: 'user agent v3' }}
          indexName="root"
        />
      );

      const meta = document.head.querySelector('meta');

      expect(meta).toEqual(
        expect.objectContaining({
          name: 'algolia:metadata',
          content: expect.any(String),
        })
      );

      expect(JSON.parse(meta.content)).toMatchInlineSnapshot(`
        {
          "ua": "user agent v3",
          "widgets": [],
        }
      `);
    });

    test('extracts user agent from algoliasearch', () => {
      navigator.userAgent = algoliaUserAgent;

      mount(
        <InstantSearch
          searchClient={algoliasearch('appId', 'apiKey')}
          indexName="root"
        />
      );

      expect(document.head.children).toHaveLength(1);
      expect(document.head.children[0]).toEqual(expect.any(HTMLMetaElement));

      expect(JSON.parse(document.head.querySelector('meta').content)).toEqual({
        ua: expect.stringMatching(
          /^Algolia for JavaScript \((\d+\.?)+\); Node\.js \((\d+\.?)+\); JS Helper \(3\.(\d+\.?)+\); react \((\d+\.?)+\); react-instantsearch \(6\.(\d+\.?)+\)$/
        ),
        widgets: [],
      });
    });

    test('extracts user agent from custom client', () => {
      navigator.userAgent = algoliaUserAgent;

      mount(
        <InstantSearch
          searchClient={createAlgoliaSearchClient({})}
          indexName="root"
        />
      );

      expect(document.head).toMatchInlineSnapshot(`
        <head>
          <meta
            content="{\\"ua\\":\\"Algolia for JavaScript (test)\\",\\"widgets\\":[]}"
            name="algolia:metadata"
          />
        </head>
      `);
    });
  });
});
