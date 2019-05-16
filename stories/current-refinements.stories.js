import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('CurrentRefinements', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
          disjunctiveFacets: ['brand'],
          numericRefinements: { price: { '>=': [100] } },
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
        })
      );
    })
  )
  .add(
    'with refinementList',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          disjunctiveFacetsRefinements: {
            brand: ['Google', 'Apple', 'Samsung'],
          },
          disjunctiveFacets: ['brand'],
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
        })
      );
    })
  )
  .add(
    'with menu',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);
      const menuContainer = document.createElement('div');
      container.appendChild(menuContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          hierarchicalFacetsRefinements: {
            categories: ['Audio'],
          },
        })
      );

      search.addWidget(
        instantsearch.widgets.menu({
          container: menuContainer,
          attribute: 'categories',
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
        })
      );
    })
  )
  .add(
    'with hierarchicalMenu',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);
      const hierarchicalMenuContainer = document.createElement('div');
      container.appendChild(hierarchicalMenuContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          hierarchicalFacetsRefinements: {
            'hierarchicalCategories.lvl0': [
              'Cameras & Camcorders > Digital Cameras',
            ],
          },
        })
      );

      search.addWidget(
        instantsearch.widgets.hierarchicalMenu({
          container: hierarchicalMenuContainer,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
          ],
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
        })
      );
    })
  )
  .add(
    'with toggleRefinement',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);
      const toggleRefinementContainer = document.createElement('div');
      container.appendChild(toggleRefinementContainer);

      search.addWidget(
        instantsearch.widgets.toggleRefinement({
          container: toggleRefinementContainer,
          attribute: 'free_shipping',
          templates: {
            labelText: 'Free Shipping',
          },
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
        })
      );
    })
  )
  .add(
    'with numericMenu',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          numericRefinements: { price: { '<=': [10] } },
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
        })
      );
    })
  )
  .add(
    'with rangeInput',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);
      const rangeInputContainer = document.createElement('div');
      container.appendChild(rangeInputContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          numericRefinements: { price: { '>=': [100], '<=': [500] } },
        })
      );

      search.addWidget(
        instantsearch.widgets.rangeInput({
          container: rangeInputContainer,
          attribute: 'price',
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
        })
      );
    })
  )
  .add(
    'with only price included',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          numericRefinements: { price: { '<=': [10] } },
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
          includedAttributes: ['price'],
        })
      );
    })
  )
  .add(
    'with price and query excluded',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
          disjunctiveFacets: ['brand'],
          numericRefinements: { price: { '>=': [100] } },
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
          excludedAttributes: ['query', 'price'],
        })
      );
    })
  )
  .add(
    'with query',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
          disjunctiveFacets: ['brand'],
          numericRefinements: { price: { '>=': [100] } },
        })
      );

      search.addWidget(
        instantsearch.widgets.currentRefinements({
          container: currentRefinementsContainer,
          excludedAttributes: [],
        })
      );
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      const currentRefinementsContainer = document.createElement('div');
      container.appendChild(currentRefinementsContainer);

      search.addWidget(
        instantsearch.widgets.configure({
          disjunctiveFacetsRefinements: { brand: ['Apple', 'Samsung'] },
          disjunctiveFacets: ['brand'],
          numericRefinements: { price: { '>=': [100] } },
        })
      );

      search.addWidget(
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
    })
  );
