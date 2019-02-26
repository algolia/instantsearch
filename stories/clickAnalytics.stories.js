import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import * as analyticsHelpers from '../src/helpers/analytics';

const insightsClientMock = (eventName, payload) => {
  console.log('mocked insights client:', eventName, payload);
};

storiesOf('ClickAnalytics', module)
  .add(
    'with function template',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.hits({
            container,
            templates: {
              item: item =>
                `
              <h3> ${item.name} </h3> 
              <div>
                <button ${analyticsHelpers.clickedObjectIDsAfterSearch(
                  item.objectID,
                  {
                    eventName: 'Add to basket',
                  }
                )}> Add to basket (click) </button>
                <button ${analyticsHelpers.convertedObjectIDsAfterSearch(
                  item.objectID,
                  {
                    eventName: 'Add to favorite',
                  }
                )}> Add to basket (convert) </button>
                <a href="view/?qid=${item.__analytics.queryID}">
                  View item
                </a>
              </div>
              `,
            },
          })
        );
      },
      {
        searchParameters: {
          clickAnalytics: true,
        },
        insightsClient: insightsClientMock,
      }
    )
  )
  .add(
    'with hogan templates',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.hits({
            container,
            templates: {
              item: `
              <h3> {{name}} </h3>
              <button 
                {{#helpers.clickedObjectIDsAfterSearch}}{ 
                  eventName: 'Add to cart'
                }{{/helpers.clickedObjectIDsAfterSearch}}>
                Add to basket
              </button>
              <a href="view/?qid={{__analytics.queryID}}">
                View item
              </a>
            `,
            },
          })
        );
      },
      {
        searchParameters: {
          clickAnalytics: true,
        },
        insightsClient: insightsClientMock,
      }
    )
  )
  .add(
    'with custom hits widget',
    withHits(
      ({ search, container, instantsearch }) => {
        const renderHits = (renderOptions, isFirstRender) => {
          const { hits, widgetParams, analytics } = renderOptions;

          const ul = document.createElement('div');
          ul.innerHTML = hits
            .map(
              item =>
                `<li>
                       ${instantsearch.highlight({
                         attribute: 'name',
                         hit: item,
                       })}
                      <button ${analyticsHelpers.convertedObjectIDsAfterSearch(
                        item.objectID,
                        { eventName: 'Add to cart' }
                      )}>
                        Add to cart
                      </button>
                    </li>
                   `
            )
            .join('');

          ul.addEventListener('click', ev => {
            if (!analyticsHelpers.hasData(ev.target)) return;
            const { method, objectID, payload } = analyticsHelpers.readData(
              ev.target
            );
            analytics[method](objectID, payload);
          });

          widgetParams.container.innerHTML = '';
          widgetParams.container.appendChild(ul);

          if (isFirstRender) {
            return;
          }
        };

        // Create the custom widget
        const customHits = instantsearch.connectors.connectHits(renderHits);

        // Instantiate the custom widget
        search.addWidget(
          customHits({
            container,
          })
        );
      },
      {
        searchParameters: {
          clickAnalytics: true,
        },
        insightsClient: insightsClientMock,
      }
    )
  );
