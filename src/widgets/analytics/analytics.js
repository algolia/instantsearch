import { createDocumentationMessageGenerator } from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator('analytics');

/**
 * @typedef {Object} AnalyticsWidgetOptions
 * @property {function(qs: string, state: SearchParameters, results: SearchResults)} pushFunction
 * Function called when data are ready to be pushed. It should push the data to your analytics platform.
 * The `qs` parameter contains the parameters serialized as a query string. The `state` contains the
 * whole search state, and the `results` the last results received.
 * @property {number} [delay=3000] Number of milliseconds between last search key stroke and calling pushFunction.
 * @property {boolean} [triggerOnUIInteraction=false] Trigger pushFunction after click on page or redirecting the page
 * @property {boolean} [pushInitialSearch=true] Trigger pushFunction after the initial search
 * @property {boolean} [pushPagination=false] Trigger pushFunction on pagination
 */

/**
 * The analytics widget pushes the current state of the search to the analytics platform of your
 * choice. It requires the implementation of a function that will push the data.
 *
 * This is a headless widget, which means that it does not have a rendered output in the
 * UI.
 * @type {WidgetFactory}
 * @devNovel Analytics
 * @category analytics
 * @param {AnalyticsWidgetOptions} $0 The Analytics widget options.
 * @return {Widget} A new instance of the Analytics widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.analytics({
 *     pushFunction: function(formattedParameters, state, results) {
 *       // Google Analytics
 *       // window.ga('set', 'page', window.location.pathname + window.location.search);
 *       // window.ga('send', 'pageView');
 *
 *       // GTM
 *       // dataLayer.push({'event': 'search', 'Search Query': state.query, 'Facet Parameters': formattedParameters, 'Number of Hits': results.nbHits});
 *
 *       // Segment.io
 *       // analytics.page( '[SEGMENT] instantsearch', { path: '/instantsearch/?query=' + state.query + '&' + formattedParameters });
 *
 *       // Kissmetrics
 *       // var objParams = JSON.parse('{"' + decodeURI(formattedParameters.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
 *       // var arrParams = $.map(objParams, function(value, index) {
 *       //   return [value];
 *       // });
 *       //
 *       // _kmq.push(['record', '[KM] Viewed Result page', {
 *       //   'Query': state.query ,
 *       //   'Number of Hits': results.nbHits,
 *       //   'Search Params': arrParams
 *       // }]);
 *
 *       // any other analytics service
 *     }
 *   })
 * );
 */
function analytics({
  pushFunction,
  delay = 3000,
  triggerOnUIInteraction = false,
  pushInitialSearch = true,
  pushPagination = false,
} = {}) {
  if (!pushFunction) {
    throw new Error(withUsage('The `pushFunction` option is required.'));
  }

  let cachedState = null;

  const serializeRefinements = function(obj) {
    const str = [];
    for (const p in obj) {
      if (obj.hasOwnProperty(p)) {
        const values = obj[p].join('+');
        str.push(
          `${encodeURIComponent(p)}=${encodeURIComponent(
            p
          )}_${encodeURIComponent(values)}`
        );
      }
    }

    return str.join('&');
  };

  const serializeNumericRefinements = function(numericRefinements) {
    const numericStr = [];

    for (const attr in numericRefinements) {
      if (numericRefinements.hasOwnProperty(attr)) {
        const filter = numericRefinements[attr];

        if (filter.hasOwnProperty('>=') && filter.hasOwnProperty('<=')) {
          if (filter['>='][0] === filter['<='][0]) {
            numericStr.push(`${attr}=${attr}_${filter['>=']}`);
          } else {
            numericStr.push(`${attr}=${attr}_${filter['>=']}to${filter['<=']}`);
          }
        } else if (filter.hasOwnProperty('>=')) {
          numericStr.push(`${attr}=${attr}_from${filter['>=']}`);
        } else if (filter.hasOwnProperty('<=')) {
          numericStr.push(`${attr}=${attr}_to${filter['<=']}`);
        } else if (filter.hasOwnProperty('=')) {
          const equals = [];
          for (const equal in filter['=']) {
            // eslint-disable-next-line max-depth
            if (filter['='].hasOwnProperty(equal)) {
              equals.push(filter['='][equal]);
            }
          }

          numericStr.push(`${attr}=${attr}_${equals.join('-')}`);
        }
      }
    }

    return numericStr.join('&');
  };

  let lastSentData = '';
  const sendAnalytics = function(state) {
    if (state === null) {
      return;
    }

    let formattedParams = [];

    const serializedRefinements = serializeRefinements({
      ...state.state.disjunctiveFacetsRefinements,
      ...state.state.facetsRefinements,
      ...state.state.hierarchicalFacetsRefinements,
    });

    const serializedNumericRefinements = serializeNumericRefinements(
      state.state.numericRefinements
    );

    if (serializedRefinements !== '') {
      formattedParams.push(serializedRefinements);
    }

    if (serializedNumericRefinements !== '') {
      formattedParams.push(serializedNumericRefinements);
    }

    formattedParams = formattedParams.join('&');

    let dataToSend = `Query: ${state.state.query}, ${formattedParams}`;
    if (pushPagination === true) {
      dataToSend += `, Page: ${state.state.page}`;
    }

    if (lastSentData !== dataToSend) {
      pushFunction(formattedParams, state.state, state.results);

      lastSentData = dataToSend;
    }
  };

  let pushTimeout;

  let isInitialSearch = true;
  if (pushInitialSearch === true) {
    isInitialSearch = false;
  }

  return {
    init() {
      if (triggerOnUIInteraction === true) {
        document.addEventListener('click', () => {
          sendAnalytics(cachedState);
        });

        window.addEventListener('beforeunload', () => {
          sendAnalytics(cachedState);
        });
      }
    },
    render({ results, state }) {
      if (isInitialSearch === true) {
        isInitialSearch = false;

        return;
      }

      cachedState = { results, state };

      if (pushTimeout) {
        clearTimeout(pushTimeout);
      }

      pushTimeout = setTimeout(() => sendAnalytics(cachedState), delay);
    },
  };
}

export default analytics;
