const ONE_DAY_IN_MS = 3600 * 24 * 1000;

const search = instantsearch({
  indexName: 'concert_events_instantsearchjs',
  searchClient: algoliasearch('latency', '059c79ddd276568e990286944276464a'),
  routing: true,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search events',
  }),

  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: hit => `
        <li class="hit">
          <h3>
            ${instantsearch.highlight({ attribute: 'name', hit })}
            <small>
              ${instantsearch.highlight({ attribute: 'location', hit })}
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

const makeRangeWidget = instantsearch.connectors.connectRange(
  (options, isFirstRendering) => {
    if (!isFirstRendering) {
      return;
    }

    const { refine } = options;

    new Calendar({
      element: $('#calendar'),
      same_day_range: true,
      callback: function() {
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
  }
);

const dateRangeWidget = makeRangeWidget({
  attribute: 'date',
});

search.addWidgets([dateRangeWidget]);

search.start();
