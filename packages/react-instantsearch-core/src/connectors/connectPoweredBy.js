import createConnector from '../core/createConnector';

/**
 * connectPoweredBy connector provides the logic to build a widget that
 * will display a link to algolia.
 * @name connectPoweredBy
 * @kind connector
 * @providedPropType {string} url - the url to redirect to algolia
 */
export default createConnector({
  displayName: 'AlgoliaPoweredBy',

  getProvidedProps() {
    const hostname =
      typeof window === 'undefined' || typeof window.location === 'undefined'
        ? ''
        : window.location.hostname;

    const url =
      'https://www.algolia.com/?' +
      'utm_source=react-instantsearch&' +
      'utm_medium=website&' +
      `utm_content=${hostname}&` +
      'utm_campaign=poweredby';

    return {
      url,
    };
  },
});
