import { storiesOf } from '@storybook/html';
import { withHits } from './withHits';

storiesOf('RefinementList', module)
  .add(
    'default',
    withHits(({ search, container, instantSearch }) => {
      search.addWidget(
        instantSearch.widgets.refinementList({
          container,
          attributeName: 'brand',
          templates: {
            header: 'Brands',
          },
        })
      );
    })
  )
  .add(
    'with show more',
    withHits(({ search, container, instantSearch }) => {
      search.addWidget(
        instantSearch.widgets.refinementList({
          container,
          attributeName: 'brand',
          limit: 5,
          templates: {
            header: 'Brands',
          },
        })
      );
    })
  )
  .add(
    'with SearchBox',
    withHits(({ search, container, instantSearch }) => {
      search.addWidget(
        instantSearch.widgets.refinementList({
          container,
          attributeName: 'brand',
          searchForFacetValues: true,
          templates: {
            header: 'Brands',
          },
        })
      );
    })
  );
