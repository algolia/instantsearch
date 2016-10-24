import createConnector from '../core/createConnector';

export default createConnector({
  displayName: 'AlgoliaPoweredBy',

  propTypes: {},

  getProps() {
    const url = 'https://www.algolia.com/?' +
      'utm_source=instantsearch.js&' +
      'utm_medium=website&' +
      `utm_content=${location.hostname}&` +
      'utm_campaign=poweredby';
    return {url};
  },
});
