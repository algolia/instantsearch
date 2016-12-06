/**
 * Pushes analytics data to GoogleAnalytics
 * @function ga
 * @param  {int} [options.delay=3000] Number of milliseconds between last search key stroke and push data to GA
 * @param  {boolean} [options.triggerOnUIInteraction=true] Trigger push to GA after click on page or redirecting the page
 * @return {Object}
 */
function ga({
  delay = 3000,
  triggerOnUIInteraction = true,
} = {}) {

  let lastSentGa = '';
  let sendAnalytics = function(state, results) {
    let params = [];

    params.push(serializeRefinements(Object.assign({}, state.disjunctiveFacetsRefinements, state.facetsRefinements)));
    params.push(serializeNumericRefinements(state.numericRefinements));

    params = params.filter(function(n) {
      return n != '';
    }).join('&');

    let paramsToSend = 'Query: ' + state.query + ', ' + params;

    if(lastSentGa !== paramsToSend) {
      if(typeof window.ga === 'undefined') {
        throw new Error('Google Analytics are not present in the website');
      }

      // console.log({'event': 'search', 'Search Query': state.query, 'Facet Parameters': params, 'Number of Hits': results.nbHits});
      window.ga('set', 'page', '/search/query/?query = ' + state.query + '&params= ' + params + '&numberOfHits=' + results.nbHits);
      window.ga('send', 'pageView');

      lastSentGa = paramsToSend;
    }
  };

  let serializeRefinements = function(obj) {
    let str = [];
    for(let p in obj) {
      if (obj.hasOwnProperty(p)) {
        let values = obj[p].join('+');
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(p) + '_' + encodeURIComponent(values));
      }
    }

    return str.join('&');
  };

  let serializeNumericRefinements = function(numericRefinements) {
    let numericStr = [];

    for(let attr in numericRefinements) {
      if(numericRefinements.hasOwnProperty(attr)) {
        let filter = numericRefinements[attr];

        if(filter.hasOwnProperty('>=') && filter.hasOwnProperty('<=')) {
          if(filter['>='][0] == filter['<='][0]) {
            numericStr.push(attr + '=' + attr + '_' + filter['>=']);
          }
          else {
            numericStr.push(attr + '=' + attr + '_' + filter['>='] + 'to' + filter['<=']);
          }
        }
        else if(filter.hasOwnProperty('>=')) {
          numericStr.push(attr + '=' + attr + '_from' + filter['>=']);
        }
        else if(filter.hasOwnProperty('<=')) {
          numericStr.push(attr + '=' + attr + '_to' + filter['<=']);
        }
        else if(filter.hasOwnProperty('=')) {
          let equals = [];
          for(let equal in filter['=']) {
            if(filter['='].hasOwnProperty(equal)) {
              equals.push(filter['='][equal]);
            }
          }

          numericStr.push(attr + '=' + attr + '_' + equals.join('-'));
        }
      }
    }

    return numericStr.join('&');
  };

  let gaTimeout;

  return {
    init() {
      if(triggerOnUIInteraction === true) {
        // Add these listeners:
        // Not sure how to do it now

        // window.onClick = function(e) {
        //   sendAnalytics(state, results);
        // });
        //
        // window.onbeforeunload = function() {
        //   sendAnalytics(state, results);
        // };
      }
    },
    render({results, state}) {
      if(gaTimeout) {
        clearTimeout(gaTimeout);
      }

      gaTimeout = setTimeout(() => sendAnalytics(state, results), delay);
    },
  };
}

export default ga;
