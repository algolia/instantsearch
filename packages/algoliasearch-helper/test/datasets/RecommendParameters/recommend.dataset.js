'use strict';

var RecommendParameters = require('../../../src/SearchParameters');

module.exports = getData;

function getData() {
  var response = {
    results: [
      {
        exhaustiveNbHits: true,
        ExhaustiveFacetsCount: false,
        hits: [
          {
            _highlightResult: {
              brand: {
                matchLevel: 'none',
                matchedWords: [],
                value: 'Moschino Love',
              },
              name: {
                matchLevel: 'none',
                matchedWords: [],
                value: 'Moschino Love – Shoulder bag',
              },
            },
            _score: 40.87,
            brand: 'Moschino Love',
            list_categories: ['Women', 'Bags', 'Shoulder bags'],
            name: 'Moschino Love – Shoulder bag',
            objectID: 'A0E200000002BLK',
            parentID: 'JC4052PP10LB100A',
            price: {
              currency: 'EUR',
              discount_level: -100,
              discounted_value: 0,
              on_sales: false,
              value: 227.5,
            },
          },
          {
            _highlightResult: {
              brand: {
                matchLevel: 'none',
                matchedWords: [],
                value: 'Gabs',
              },
              name: {
                matchLevel: 'none',
                matchedWords: [],
                value: 'Bag “Sabrina“ medium Gabs',
              },
            },
            _score: 40.91,
            brand: 'Gabs',
            list_categories: ['Women', 'Bags', 'Shoulder bags'],
            name: 'Bag “Sabrina“ medium Gabs',
            objectID: 'A0E200000001WFI',
            parentID: 'SABRINA',
            price: {
              currency: 'EUR',
              discount_level: -100,
              discounted_value: 0,
              on_sales: false,
              value: 210,
            },
          },
          {
            _highlightResult: {
              brand: {
                matchLevel: 'none',
                matchedWords: [],
                value: 'La Carrie Bag',
              },
              name: {
                matchLevel: 'none',
                matchedWords: [],
                value: 'Bag La Carrie Bag small black',
              },
            },
            _score: 39.92,
            brand: 'La Carrie Bag',
            list_categories: ['Women', 'Bags', 'Shoulder bags'],
            name: 'Bag La Carrie Bag small black',
            objectID: 'A0E2000000024R1',
            parentID: '151',
            price: {
              currency: 'EUR',
              discount_level: -100,
              discounted_value: 0,
              on_sales: false,
              value: 161.25,
            },
          },
        ],
        hitsPerPage: 3,
        nbHits: 3,
        nbPages: 1,
        page: 0,
        processingTimeMS: 11,
      },
      {
        exhaustiveNbHits: false,
        ExhaustiveFacetsCount: false,
        hits: [
          {
            _score: 40.89,
            facetName: 'brand',
            facetValue: 'Red Valentino',
          },
          {
            _score: 40.89,
            facetName: 'brand',
            facetValue: 'Havaianas',
          },
          {
            _score: 39.26,
            facetName: 'brand',
            facetValue: 'Siviglia',
          },
          {
            _score: 39.26,
            facetName: 'brand',
            facetValue: 'New Balance',
          },
          {
            _score: 36.28,
            facetName: 'brand',
            facetValue: 'Jucca',
          },
          {
            _score: 36.28,
            facetName: 'brand',
            facetValue: 'Orciani',
          },
          {
            _score: 31.63,
            facetName: 'brand',
            facetValue: '8PM',
          },
        ],
        hitsPerPage: 0,
        nbHits: 7,
        nbPages: 0,
        page: 0,
        processingTimeMS: 3,
        renderingContent: null,
      },
    ],
  };

  var recommendParams = new RecommendParameters({
    params: [
      {
        $$id: '1',
        objectID: 'A0E20000000279B',
        model: 'bought-together',
      },
      {
        $$id: '2',
        facetName: 'brand',
        model: 'trending-facets',
      },
    ],
  });

  return {
    response: response,
    recommendParams: recommendParams,
  };
}
