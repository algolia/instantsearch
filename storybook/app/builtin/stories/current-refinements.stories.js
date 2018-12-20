/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('CurrentRefinements');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const refinementListContainer = document.createElement('div');
        container.appendChild(refinementListContainer);
        const numericMenuContainer = document.createElement('div');
        container.appendChild(numericMenuContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
          })
        );

        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container: refinementListContainer,
            attribute: 'brand',
          })
        );

        window.search.addWidget(
          instantsearch.widgets.numericMenu({
            container: numericMenuContainer,
            attribute: 'price',
            items: [
              { label: 'All' },
              { end: 10, label: '≤ $10' },
              { start: 10, end: 100, label: '$10–$100' },
              { start: 100, end: 500, label: '$100–$500' },
              { start: 500, label: '≥ $500' },
            ],
          })
        );
      })
    )
    .add(
      'with refinementList',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const refinementListContainer = document.createElement('div');
        container.appendChild(refinementListContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: {
              brand: ['Google', 'Apple', 'Samsung'],
            },
            disjunctiveFacets: ['brand'],
          })
        );

        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container: refinementListContainer,
            attribute: 'brand',
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
          })
        );
      })
    )
    .add(
      'with menu',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const menuContainer = document.createElement('div');
        container.appendChild(menuContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            hierarchicalFacetsRefinements: {
              brand: ['Samsung'],
            },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.menu({
            container: menuContainer,
            attribute: 'brand',
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
          })
        );
      })
    )
    .add(
      'with hierarchicalMenu',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const hierarchicalMenuContainer = document.createElement('div');
        container.appendChild(hierarchicalMenuContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            hierarchicalFacetsRefinements: {
              'hierarchicalCategories.lvl0': [
                'Cameras & Camcorders > Digital Cameras',
              ],
            },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container: hierarchicalMenuContainer,
            attributes: [
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
            ],
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
          })
        );
      })
    )
    .add(
      'with toggleRefinement',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const toggleRefinementContainer = document.createElement('div');
        container.appendChild(toggleRefinementContainer);

        window.search.addWidget(
          instantsearch.widgets.toggleRefinement({
            container: toggleRefinementContainer,
            attribute: 'free_shipping',
            templates: {
              labelText: 'Free Shipping',
            },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
          })
        );
      })
    )
    .add(
      'with numericMenu',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const numericMenuContainer = document.createElement('div');
        container.appendChild(numericMenuContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            numericRefinements: { price: { '<=': [10] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.numericMenu({
            container: numericMenuContainer,
            attribute: 'price',
            items: [
              { label: 'All' },
              { end: 10, label: '≤ $10' },
              { start: 10, end: 100, label: '$10–$100' },
              { start: 100, end: 500, label: '$100–$500' },
              { start: 500, label: '≥ $500' },
            ],
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
          })
        );
      })
    )
    .add(
      'with rangeInput',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const rangeInputContainer = document.createElement('div');
        container.appendChild(rangeInputContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            numericRefinements: { price: { '>=': [100], '<=': [500] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container: rangeInputContainer,
            attribute: 'price',
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
          })
        );
      })
    )
    .add(
      'with only price included',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const toggleRefinementContainer = document.createElement('div');
        container.appendChild(toggleRefinementContainer);
        const numericMenuContainer = document.createElement('div');
        container.appendChild(numericMenuContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            numericRefinements: { price: { '<=': [10] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.numericMenu({
            container: numericMenuContainer,
            attribute: 'price',
            items: [
              { label: 'All' },
              { end: 10, label: '≤ $10' },
              { start: 10, end: 100, label: '$10–$100' },
              { start: 100, end: 500, label: '$100–$500' },
              { start: 500, label: '≥ $500' },
            ],
          })
        );

        window.search.addWidget(
          instantsearch.widgets.toggleRefinement({
            container: toggleRefinementContainer,
            attribute: 'free_shipping',
            templates: {
              labelText: 'Free Shipping',
            },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
            includedAttributes: ['price'],
          })
        );
      })
    )
    .add(
      'with price and query excluded',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const refinementListContainer = document.createElement('div');
        container.appendChild(refinementListContainer);
        const numericMenuContainer = document.createElement('div');
        container.appendChild(numericMenuContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
            excludedAttributes: ['query', 'price'],
          })
        );

        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container: refinementListContainer,
            attribute: 'brand',
          })
        );

        window.search.addWidget(
          instantsearch.widgets.numericMenu({
            container: numericMenuContainer,
            attribute: 'price',
            items: [
              { label: 'All' },
              { end: 10, label: '≤ $10' },
              { start: 10, end: 100, label: '$10–$100' },
              { start: 100, end: 500, label: '$100–$500' },
              { start: 500, label: '≥ $500' },
            ],
          })
        );
      })
    )
    .add(
      'with query',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const refinementListContainer = document.createElement('div');
        container.appendChild(refinementListContainer);
        const numericMenuContainer = document.createElement('div');
        container.appendChild(numericMenuContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
            excludedAttributes: [],
          })
        );

        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container: refinementListContainer,
            attribute: 'brand',
          })
        );

        window.search.addWidget(
          instantsearch.widgets.numericMenu({
            container: numericMenuContainer,
            attribute: 'price',
            items: [
              { label: 'All' },
              { end: 10, label: '≤ $10' },
              { start: 10, end: 100, label: '$10–$100' },
              { start: 100, end: 500, label: '$100–$500' },
              { start: 500, label: '≥ $500' },
            ],
          })
        );
      })
    )
    .add(
      'with transformed items',
      wrapWithHits(container => {
        const currentRefinementsContainer = document.createElement('div');
        container.appendChild(currentRefinementsContainer);
        const refinementListContainer = document.createElement('div');
        container.appendChild(refinementListContainer);
        const numericMenuContainer = document.createElement('div');
        container.appendChild(numericMenuContainer);

        window.search.addWidget(
          instantsearch.widgets.configure({
            disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
            disjunctiveFacets: ['brand'],
            numericRefinements: { price: { '>=': [100] } },
          })
        );

        window.search.addWidget(
          instantsearch.widgets.currentRefinements({
            container: currentRefinementsContainer,
            transformItems: items =>
              items.map(refinementItem => ({
                ...refinementItem,
                refinements: refinementItem.refinements.map(item => ({
                  ...item,
                  label: item.label.toUpperCase(),
                })),
              })),
          })
        );

        window.search.addWidget(
          instantsearch.widgets.refinementList({
            container: refinementListContainer,
            attribute: 'brand',
          })
        );

        window.search.addWidget(
          instantsearch.widgets.numericMenu({
            container: numericMenuContainer,
            attribute: 'price',
            items: [
              { label: 'All' },
              { end: 10, label: '≤ $10' },
              { start: 10, end: 100, label: '$10–$100' },
              { start: 100, end: 500, label: '$100–$500' },
              { start: 500, label: '≥ $500' },
            ],
          })
        );
      })
    );
};
