/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Menu');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attributeName: 'categories',
          })
        );
      })
    )
    .add(
      'with show more, header and footer',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attributeName: 'categories',
            limit: 3,
            showMore: {
              templates: {
                active: '<button>Show less</button>',
                inactive: '<button>Show more</button>',
              },
              limit: 10,
            },
            templates: {
              panelHeader: 'Categories (menu widget)',
              panelFooter: 'Brought to you by Algolia',
            },
          })
        );
      })
    )
    .add(
      'With custom css classes',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menu({
            container,
            attributeName: 'categories',
            limit: 3,
            showMore: {
              templates: {
                active: '<button>Show less</button>',
                inactive: '<button>Show more</button>',
              },
              limit: 10,
            },
            templates: {
              panelHeader: 'Categories (menu widget)',
              panelFooter: 'Brought to you by Algolia',
            },
            cssClasses: {
              list: 'list',
              item: 'item',
              active: 'active',
              link: 'link',
              count: 'count',
              panelRoot: 'root',
              panelHeader: 'header',
              panelBody: 'body',
              panelFooter: 'footer',
            },
          })
        );
      })
    )
    .add(
      'as a Select DOM element',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.menuSelect({
            container,
            attributeName: 'categories',
            limit: 10,
          })
        );
      })
    );
};
