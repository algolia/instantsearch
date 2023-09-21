/* global moment Calendar $ */
import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { connectRange } from 'instantsearch.js/es/connectors';
import { searchBox, hits } from 'instantsearch.js/es/widgets';

const ONE_DAY_IN_MS = 3600 * 24 * 1000;

const search = instantsearch({
  indexName: 'concert_events_instantsearchjs',
  searchClient: algoliasearch('latency', '059c79ddd276568e990286944276464a'),
  routing: true,
  insights: true,
});

search.addWidgets([
  searchBox({
    container: '#search-box',
    placeholder: 'Search events',
  }),

  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <li class="hit">
          <h3>
            ${components.Highlight({ attribute: 'name', hit })}
            <small>
              ${components.Highlight({ attribute: 'location', hit })}
            </small>
          </h3>
          <small>
            on <strong>${moment(hit.date).format('dddd MMMM Do YYYY')}</strong>
          </small>
        </li>
      `,
    },
  }),
]);

const calendarRange = connectRange((options, isFirstRendering) => {
  if (!isFirstRendering) {
    return;
  }

  const { refine } = options;

  // eslint-disable-next-line no-new
  new Calendar({
    element: $('#calendar'),
    same_day_range: true,
    callback() {
      const start = new Date(this.start_date).getTime();
      const end = new Date(this.end_date).getTime();
      const actualEnd = start === end ? end + ONE_DAY_IN_MS - 1 : end;

      refine([start, actualEnd]);
    },
    // Some good parameters based on our dataset:
    start_date: new Date(),
    end_date: new Date('01/01/2020'),
    earliest_date: new Date('01/01/2008'),
    latest_date: new Date('01/01/2020'),
  });
});

search.addWidgets([
  calendarRange({
    attribute: 'date',
  }),
]);

search.start();
