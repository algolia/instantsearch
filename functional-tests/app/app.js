/* global instantsearch */
/* eslint-disable object-shorthand, prefer-template, prefer-arrow-callback */

var search = instantsearch({ // eslint-disable-line
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
  routing: true,
  searchParameters: {
    hitsPerPage: 6,
  },
  createAlgoliaClient: player,
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
    poweredBy: true,
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
  })
);

search.addWidget(
  instantsearch.widgets.sortBySelector({
    container: '#sort-by-selector',
    indices: [
      { name: 'instant_search', label: 'Most relevant' },
      { name: 'instant_search_price_asc', label: 'Lowest price' },
      { name: 'instant_search_price_desc', label: 'Highest price' },
    ],
    cssClasses: {
      select: 'form-control',
    },
  })
);

search.addWidget(
  instantsearch.widgets.hitsPerPageSelector({
    container: '#hits-per-page-selector',
    items: [
      { value: 6, label: '6 per page' },
      { value: 12, label: '12 per page' },
      { value: 24, label: '24 per page' },
    ],
    cssClasses: {
      select: 'form-control',
    },
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: document.querySelector('#empty').innerHTML,
      item: document.querySelector('#item').innerHTML,
    },
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    cssClasses: {
      root: 'pagination', // This uses Bootstrap classes
      active: 'active',
    },
    maxPages: 20,
  })
);

search.addWidget(
  instantsearch.widgets.clearAll({
    container: '#clear-all',
    autoHideContainer: false,
  })
);

search.addWidget(
  instantsearch.widgets.currentRefinedValues({
    autoHideContainer: false,
    container: '#current-refined-values',
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value facet-value-removable',
      count: 'facet-count pull-right',
      clearAll: 'clear-all',
      item: 'item',
    },
    templates: {
      header: 'Current refinements',
    },
    attributes: [
      {
        name: 'price',
        label: 'Price',
        transformData: function(data) {
          data.label = data.label + '';
          return data;
        },
      },
      {
        name: 'price_range',
        label: 'Price range',
        transformData: function(data) {
          data.label = data.label.replace(/(\d+)/g, '$$$1');
          return data;
        },
      },
      {
        name: 'free_shipping',
        transformData: function(data) {
          if (data.label === 'true') data.label = 'Free shipping';
          return data;
        },
      },
    ],
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands',
    attributeName: 'brand',
    operator: 'or',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox item',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Brands',
    },
  })
);

search.addWidget(
  instantsearch.widgets.numericRefinementList({
    container: '#price-numeric-list',
    attributeName: 'price',
    operator: 'or',
    options: [
      { name: 'All' },
      { end: 4, name: 'less than 4' },
      { start: 4, end: 4, name: '4' },
      { start: 5, end: 10, name: 'between 5 and 10' },
      { start: 10, name: 'more than 10' },
    ],
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value',
      count: 'facet-count pull-right',
      active: 'facet-active',
      item: 'item',
    },
    templates: {
      header: 'Price numeric list',
    },
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#price-range',
    attributeName: 'price_range',
    operator: 'and',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox item',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Price ranges',
    },
    transformData: function(data) {
      data.label = data.label
        .replace(/(\d+) - (\d+)/, '$$$1 - $$$2')
        .replace(/> (\d+)/, '> $$$1');
      return data;
    },
  })
);

search.addWidget(
  instantsearch.widgets.toggle({
    container: '#free-shipping',
    attributeName: 'free_shipping',
    label: 'Free Shipping',
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Shipping',
    },
  })
);

search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    attributeName: 'categories',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value',
      count: 'facet-count pull-right',
      active: 'facet-active',
      item: 'item',
    },
    templates: {
      header: 'Categories',
    },
  })
);

search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    attributeName: 'price',
    cssClasses: {
      header: 'facet-title',
    },
    templates: {
      header: 'Price',
    },
    step: 10,
    tooltips: {
      format: function(rawValue) {
        return '$' + Math.round(rawValue).toLocaleString();
      },
    },
  })
);

search.addWidget(
  instantsearch.widgets.hierarchicalMenu({
    container: '#hierarchical-categories',
    attributes: [
      'hierarchicalCategories.lvl0',
      'hierarchicalCategories.lvl1',
      'hierarchicalCategories.lvl2',
    ],
    cssClasses: {
      header: 'facet-title',
      list: 'hierarchical-categories-list',
      link: 'facet-value',
      count: 'facet-count pull-right',
      item: 'item',
    },
    templates: {
      header: 'Hierarchical categories',
    },
  })
);

search.once('render', function() {
  document.querySelector('.search').className = 'row search search--visible';
});

search.addWidget(
  instantsearch.widgets.priceRanges({
    container: '#price-ranges',
    attributeName: 'price',
    templates: {
      header: 'Price ranges',
    },
    cssClasses: {
      header: 'facet-title',
      body: 'nav nav-stacked',
      range: 'facet-value',
      form: '',
      input: 'fixed-input-sm',
      button: 'btn btn-default btn-sm',
      item: 'item',
    },
  })
);

search.addWidget(
  instantsearch.widgets.numericSelector({
    container: '#popularity-selector',
    operator: '>=',
    attributeName: 'popularity',
    options: [
      { label: 'Default', value: 0 },
      { label: 'Top 10', value: 9991 },
      { label: 'Top 100', value: 9901 },
      { label: 'Top 500', value: 9501 },
    ],
    cssClasses: {
      select: 'form-control',
    },
  })
);

search.start();

const logs = {};
/**
 * This function is a JS client factory that can be used to record
 * queries used in the player.
 *
 * In order to record new queries:
 *  - replace player by recorder
 *  - run the app, and do some queries
 *  - use your console and do `copy(logs)`
 *  - paste the content in the coldQueries
 *
 * @param {function} algoliasearch original algoliasearch factory
 * @param {string} app appID
 * @param {key} key API Key
 * @return {object} a JS client
 */
function recorder(algoliasearch, app, key) { // eslint-disable-line
  const client = algoliasearch(app, key);
  const originalSearchFn = client.search;
  client.search = function(queries, cb) {
    const maybeResults = originalSearchFn.call(client, queries);
    maybeResults.then(
      function(res) {
        logs[JSON.stringify(queries)] = JSON.stringify(res);
        cb(null, res);
      },
      function(err) {
        cb(err);
      }
    );
    return maybeResults;
  };
  return client;
}

function player() {
  const coldQueries = {
    '[{"indexName":"instant_search","params":{"query":"","hitsPerPage":6,"maxValuesPerFacet":10,"page":0,"facets":["price_range","price","brand","free_shipping","price","categories","hierarchicalCategories.lvl0"],"tagFilters":""}}]':
      '{"results":[{"hits":[{"name":"Amazon - Fire TV Stick with Alexa Voice Remote - Black","description":"Enjoy smart access to videos, games and apps with this Amazon Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core processor, 1GB internal memory and 8GB of storage, this portable Amazon Fire TV stick works fast for buffer-free streaming.","brand":"Amazon","categories":["TV & Home Theater","Streaming Media Players"],"hierarchicalCategories":{"lvl0":"TV & Home Theater","lvl1":"TV & Home Theater > Streaming Media Players"},"type":"Streaming media plyr","price":39.99,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/5477500_sb.jpg","url":"https://api.bestbuy.com/click/-/5477500/pdp","free_shipping":false,"rating":4,"popularity":21469,"objectID":"5477500","_highlightResult":{"name":{"value":"Amazon - Fire TV Stick with Alexa Voice Remote - Black","matchLevel":"none","matchedWords":[]},"description":{"value":"Enjoy smart access to videos, games and apps with this Amazon Fire TV stick. Its Alexa voice remote lets you deliver hands-free commands when you want to watch television or engage with other applications. With a quad-core processor, 1GB internal memory and 8GB of storage, this portable Amazon Fire TV stick works fast for buffer-free streaming.","matchLevel":"none","matchedWords":[]},"brand":{"value":"Amazon","matchLevel":"none","matchedWords":[]},"categories":[{"value":"TV & Home Theater","matchLevel":"none","matchedWords":[]},{"value":"Streaming Media Players","matchLevel":"none","matchedWords":[]}],"type":{"value":"Streaming media plyr","matchLevel":"none","matchedWords":[]}}},{"name":"Google - Chromecast - Black","description":"Google Chromecast: Enjoy a world of entertainment with Google Chromecast. Just connect to your HDTV\'s HDMI interface and your home Wi-Fi network to get started. You can stream your favorite apps from your compatible phone, tablet or laptop, plus use your phone as a remote to search, play and pause content.","brand":"Google","categories":["TV & Home Theater","Streaming Media Players"],"hierarchicalCategories":{"lvl0":"TV & Home Theater","lvl1":"TV & Home Theater > Streaming Media Players"},"type":"Streaming media plyr","price":35,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/4397400_sb.jpg","url":"https://api.bestbuy.com/click/-/4397400/pdp","free_shipping":false,"rating":4,"popularity":21468,"objectID":"4397400","_highlightResult":{"name":{"value":"Google - Chromecast - Black","matchLevel":"none","matchedWords":[]},"description":{"value":"Google Chromecast: Enjoy a world of entertainment with Google Chromecast. Just connect to your HDTV\'s HDMI interface and your home Wi-Fi network to get started. You can stream your favorite apps from your compatible phone, tablet or laptop, plus use your phone as a remote to search, play and pause content.","matchLevel":"none","matchedWords":[]},"brand":{"value":"Google","matchLevel":"none","matchedWords":[]},"categories":[{"value":"TV & Home Theater","matchLevel":"none","matchedWords":[]},{"value":"Streaming Media Players","matchLevel":"none","matchedWords":[]}],"type":{"value":"Streaming media plyr","matchLevel":"none","matchedWords":[]}}},{"name":"Dell - Inspiron 15.6\\" Touch-Screen Laptop - Intel Core i5 - 6GB Memory - 1TB Hard Drive - Black","description":"Dell Inspiron Laptop: Get speed and performance from this 15.6-inch Dell Inspiron laptop. Supported by an Intel Core i5-5200U processor and 6GB of DDR3L RAM, this slim touch screen laptop lets you run multiple applications without lag. The 1TB hard drive in this Dell Inspiron laptop lets you store multiple music, video and document files.","brand":"Dell","categories":["Computers & Tablets","Laptops"],"hierarchicalCategories":{"lvl0":"Computers & Tablets","lvl1":"Computers & Tablets > Laptops"},"type":"Burst skus","price":499.99,"price_range":"200 - 500","image":"https://cdn-demo.algolia.com/bestbuy-0118/5588602_sb.jpg","url":"https://api.bestbuy.com/click/-/5588602/pdp","free_shipping":true,"rating":4,"popularity":21467,"objectID":"5588602","_highlightResult":{"name":{"value":"Dell - Inspiron 15.6\\" Touch-Screen Laptop - Intel Core i5 - 6GB Memory - 1TB Hard Drive - Black","matchLevel":"none","matchedWords":[]},"description":{"value":"Dell Inspiron Laptop: Get speed and performance from this 15.6-inch Dell Inspiron laptop. Supported by an Intel Core i5-5200U processor and 6GB of DDR3L RAM, this slim touch screen laptop lets you run multiple applications without lag. The 1TB hard drive in this Dell Inspiron laptop lets you store multiple music, video and document files.","matchLevel":"none","matchedWords":[]},"brand":{"value":"Dell","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Computers & Tablets","matchLevel":"none","matchedWords":[]},{"value":"Laptops","matchLevel":"none","matchedWords":[]}],"type":{"value":"Burst skus","matchLevel":"none","matchedWords":[]}}},{"name":"Amazon - Echo Dot","description":"Deliver your favorite playlist anywhere in your home with the Amazon Echo Dot voice-controlled device. Control most electric devices through voice activation, or schedule a ride with Uber and order a pizza. The Amazon Echo Dot voice-controlled device turns any home into a smart home with the Alexa app on a smartphone or tablet.","brand":"Amazon","categories":["Smart Home"],"hierarchicalCategories":{"lvl0":"Smart Home"},"type":"Voice assistants","price":49.99,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/5578851_sb.jpg","url":"https://api.bestbuy.com/click/-/5578851/pdp","free_shipping":true,"rating":4,"popularity":21466,"objectID":"5578851","_highlightResult":{"name":{"value":"Amazon - Echo Dot","matchLevel":"none","matchedWords":[]},"description":{"value":"Deliver your favorite playlist anywhere in your home with the Amazon Echo Dot voice-controlled device. Control most electric devices through voice activation, or schedule a ride with Uber and order a pizza. The Amazon Echo Dot voice-controlled device turns any home into a smart home with the Alexa app on a smartphone or tablet.","matchLevel":"none","matchedWords":[]},"brand":{"value":"Amazon","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Smart Home","matchLevel":"none","matchedWords":[]}],"type":{"value":"Voice assistants","matchLevel":"none","matchedWords":[]}}},{"name":"Apple - MacBook Air® (Latest Model) - 13.3\\" Display - Intel Core i5 - 8GB Memory - 128GB Flash Storage - Silver","description":"MacBook Air features up to 8GB of memory, a fifth-generation Intel Core processor, Thunderbolt 2, great built-in apps, and all-day battery life.1 Its thin, light, and durable enough to take everywhere you go-and powerful enough to do everything once you get there, better.","brand":"Apple","categories":["Computers & Tablets","Laptops","All Laptops","MacBooks"],"hierarchicalCategories":{"lvl0":"Computers & Tablets","lvl1":"Computers & Tablets > Laptops","lvl2":"Computers & Tablets > Laptops > All Laptops","lvl3":"Computers & Tablets > Laptops > All Laptops > MacBooks"},"type":"Apple","price":999.99,"price_range":"500 - 2000","image":"https://cdn-demo.algolia.com/bestbuy-0118/6443034_sb.jpg","url":"https://api.bestbuy.com/click/-/6443034/pdp","free_shipping":true,"rating":4,"popularity":21465,"objectID":"6443034","_highlightResult":{"name":{"value":"Apple - MacBook Air® (Latest Model) - 13.3\\" Display - Intel Core i5 - 8GB Memory - 128GB Flash Storage - Silver","matchLevel":"none","matchedWords":[]},"description":{"value":"MacBook Air features up to 8GB of memory, a fifth-generation Intel Core processor, Thunderbolt 2, great built-in apps, and all-day battery life.1 Its thin, light, and durable enough to take everywhere you go-and powerful enough to do everything once you get there, better.","matchLevel":"none","matchedWords":[]},"brand":{"value":"Apple","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Computers & Tablets","matchLevel":"none","matchedWords":[]},{"value":"Laptops","matchLevel":"none","matchedWords":[]},{"value":"All Laptops","matchLevel":"none","matchedWords":[]},{"value":"MacBooks","matchLevel":"none","matchedWords":[]}],"type":{"value":"Apple","matchLevel":"none","matchedWords":[]}}},{"name":"Sharp - 50\\" Class (49.5\\" Diag.) - LED - 1080p - Smart - HDTV Roku TV - Black","description":"Only at Best Buy  Sharp LC-50LB481U LED Roku TV: Get a TV that enjoys full Internet connectivity with this Sharp 49.5-inch smart TV. Full HD resolutions give you plenty of detail whether you\'re streaming content from the Internet using the integrated Roku player or watching via cable. Plenty of contrast and high-quality sound mean this Sharp 49.5-in smart TV delivers outstanding video.","brand":"Sharp","categories":["TV & Home Theater","TVs","All Flat-Panel TVs"],"hierarchicalCategories":{"lvl0":"TV & Home Theater","lvl1":"TV & Home Theater > TVs","lvl2":"TV & Home Theater > TVs > All Flat-Panel TVs"},"type":"45\\"-50\\"  tv\'s","price":429.99,"price_range":"200 - 500","image":"https://cdn-demo.algolia.com/bestbuy-0118/4863102_sb.jpg","url":"https://api.bestbuy.com/click/-/4863102/pdp","free_shipping":false,"rating":4,"popularity":21464,"objectID":"4863102","_highlightResult":{"name":{"value":"Sharp - 50\\" Class (49.5\\" Diag.) - LED - 1080p - Smart - HDTV Roku TV - Black","matchLevel":"none","matchedWords":[]},"description":{"value":"Only at Best Buy  Sharp LC-50LB481U LED Roku TV: Get a TV that enjoys full Internet connectivity with this Sharp 49.5-inch smart TV. Full HD resolutions give you plenty of detail whether you\'re streaming content from the Internet using the integrated Roku player or watching via cable. Plenty of contrast and high-quality sound mean this Sharp 49.5-in smart TV delivers outstanding video.","matchLevel":"none","matchedWords":[]},"brand":{"value":"Sharp","matchLevel":"none","matchedWords":[]},"categories":[{"value":"TV & Home Theater","matchLevel":"none","matchedWords":[]},{"value":"TVs","matchLevel":"none","matchedWords":[]},{"value":"All Flat-Panel TVs","matchLevel":"none","matchedWords":[]}],"type":{"value":"45\\"-50\\"  tv\'s","matchLevel":"none","matchedWords":[]}}}],"nbHits":21469,"page":0,"nbPages":167,"hitsPerPage":6,"processingTimeMS":2,"facets":{"brand":{"Insignia™":746,"Samsung":633,"Metra":591,"HP":530,"Apple":442,"GE":394,"Sony":350,"Incipio":320,"KitchenAid":318,"Whirlpool":298},"price":{"39.99":1163,"49.99":1083,"19.99":1023,"29.99":896,"99.99":767,"24.99":635,"59.99":629,"14.99":519,"79.99":496,"34.99":487},"categories":{"Appliances":4306,"Computers & Tablets":3563,"Cell Phones":3291,"Cell Phone Accessories":2836,"Audio":1570,"Small Kitchen Appliances":1510,"Cameras & Camcorders":1369,"Car Electronics & GPS":1208,"TV & Home Theater":1201,"Cell Phone Cases & Clips":1195},"price_range":{"1 - 50":9927,"50 - 100":3471,"100 - 200":2640,"200 - 500":2628,"500 - 2000":2467,"> 2000":336},"free_shipping":{"true":18013,"false":3456},"hierarchicalCategories.lvl0":{"Appliances":4306,"Computers & Tablets":3563,"Cell Phones":3291,"Audio":1570,"Cameras & Camcorders":1369,"Car Electronics & GPS":1208,"TV & Home Theater":1201,"Health, Fitness & Beauty":923,"Office & School Supplies":617,"Video Games":505}},"facets_stats":{"price":{"min":1,"max":4999.99,"avg":242.394,"sum":5187220}},"exhaustiveFacetsCount":true,"exhaustiveNbHits":true,"query":"","params":"query=&hitsPerPage=6&maxValuesPerFacet=10&page=0&facets=%5B%22price_range%22%2C%22price%22%2C%22brand%22%2C%22free_shipping%22%2C%22price%22%2C%22categories%22%2C%22hierarchicalCategories.lvl0%22%5D&tagFilters=","index":"instant_search"}]}',
    '[{"indexName":"instant_search","params":{"query":"m","hitsPerPage":6,"maxValuesPerFacet":10,"page":0,"facets":["price_range","price","brand","free_shipping","price","categories","hierarchicalCategories.lvl0"],"tagFilters":""}}]':
      '{"results":[{"hits":[{"name":"Microsoft - $25 Xbox Gift Card","description":"Get an Xbox gift card for games and entertainment on Xbox and Windows. Buy the latest games, map packs, movies, TV, music, apps and more. Great as a gift, allowance, or credit card alternative.","brand":"Microsoft","categories":["Video Games","Xbox 360","Xbox Live","Xbox Live Currency"],"hierarchicalCategories":{"lvl0":"Video Games","lvl1":"Video Games > Xbox 360","lvl2":"Video Games > Xbox 360 > Xbox Live","lvl3":"Video Games > Xbox 360 > Xbox Live > Xbox Live Currency"},"type":"Xbox live posa","price":25,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/4249413_sb.jpg","url":"https://api.bestbuy.com/click/-/4249413/pdp","free_shipping":true,"rating":4,"popularity":21351,"objectID":"4249413","_highlightResult":{"name":{"value":"<em>M</em>icrosoft - $25 Xbox Gift Card","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"description":{"value":"Get an Xbox gift card for games and entertainment on Xbox and Windows. Buy the latest games, <em>m</em>ap packs, <em>m</em>ovies, TV, <em>m</em>usic, apps and <em>m</em>ore. Great as a gift, allowance, or credit card alternative.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"brand":{"value":"<em>M</em>icrosoft","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"categories":[{"value":"Video Games","matchLevel":"none","matchedWords":[]},{"value":"Xbox 360","matchLevel":"none","matchedWords":[]},{"value":"Xbox Live","matchLevel":"none","matchedWords":[]},{"value":"Xbox Live Currency","matchLevel":"none","matchedWords":[]}],"type":{"value":"Xbox live posa","matchLevel":"none","matchedWords":[]}}},{"name":"Minecraft - Chest Series Mini Figure - Multi","description":"Enjoy the thrill of surprise with this blind pack of one figurine from the Minecraft mini figures chest series. Included in this series of 72 mini figurines are all the characters from Minecraft\'s series 1 through 6, and eight new gold Chase figures are available. This single random figure from the Minecraft mini figures chest series is great for trading.","brand":"Minecraft","categories":["Video Games","Minecraft Collectibles"],"hierarchicalCategories":{"lvl0":"Video Games","lvl1":"Video Games > Minecraft Collectibles"},"type":"Vg collectibles","price":3.49,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/5708829_sb.jpg","url":"https://api.bestbuy.com/click/-/5708829/pdp","free_shipping":true,"rating":0,"popularity":21320,"objectID":"5708829","_highlightResult":{"name":{"value":"<em>M</em>inecraft - Chest Series <em>M</em>ini Figure - <em>M</em>ulti","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"description":{"value":"Enjoy the thrill of surprise with this blind pack of one figurine from the <em>M</em>inecraft <em>m</em>ini figures chest series. Included in this series of 72 <em>m</em>ini figurines are all the characters from <em>M</em>inecraft\'s series 1 through 6, and eight new gold Chase figures are available. This single random figure from the <em>M</em>inecraft <em>m</em>ini figures chest series is great for trading.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"brand":{"value":"<em>M</em>inecraft","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"categories":[{"value":"Video Games","matchLevel":"none","matchedWords":[]},{"value":"<em>M</em>inecraft Collectibles","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]}],"type":{"value":"Vg collectibles","matchLevel":"none","matchedWords":[]}}},{"name":"Microsoft - Surface Pro 4 - 12.3\\" - 128GB - Intel Core i5 - Silver","description":"Microsoft Surface Pro 4 Tablet: Use the 12.3\\" HD touch screen and the Surface Pen to navigate Web pages, write and upload content and play games. The kickstand makes it easy to adjust Surface Pro 4 for hands-free viewing or typing, and Wi-Fi lets you connect to the Internet quickly.","brand":"Microsoft","categories":["Computers & Tablets","Tablets","All Tablets"],"hierarchicalCategories":{"lvl0":"Computers & Tablets","lvl1":"Computers & Tablets > Tablets","lvl2":"Computers & Tablets > Tablets > All Tablets"},"type":"Msft surface wifi","price":999.99,"price_range":"500 - 2000","image":"https://cdn-demo.algolia.com/bestbuy-0118/4523600_sb.jpg","url":"https://api.bestbuy.com/click/-/4523600/pdp","free_shipping":true,"rating":4,"popularity":21303,"objectID":"4523600","_highlightResult":{"name":{"value":"<em>M</em>icrosoft - Surface Pro 4 - 12.3\\" - 128GB - Intel Core i5 - Silver","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"description":{"value":"<em>M</em>icrosoft Surface Pro 4 Tablet: Use the 12.3\\" HD touch screen and the Surface Pen to navigate Web pages, write and upload content and play games. The kickstand <em>m</em>akes it easy to adjust Surface Pro 4 for hands-free viewing or typing, and Wi-Fi lets you connect to the Internet quickly.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"brand":{"value":"<em>M</em>icrosoft","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"categories":[{"value":"Computers & Tablets","matchLevel":"none","matchedWords":[]},{"value":"Tablets","matchLevel":"none","matchedWords":[]},{"value":"All Tablets","matchLevel":"none","matchedWords":[]}],"type":{"value":"<em>M</em>sft surface wifi","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]}}},{"name":"Motorola - MOTO G (4th Generation) 4G LTE with 16GB Memory Cell Phone (Unlocked) - Black","description":"Stay in touch with loved ones with this unlocked Motorola Moto G phone. It has a thin, lightweight design for comfort and a micro-texture back and rounded edges for an enhanced grip. TurboPower-enabled charging provides extra battery juice in 15 minutes, and you can talk with others via any carrier with this unlocked Motorola Moto G phone.","brand":"Motorola","categories":["Cell Phones","Unlocked Cell Phones","All Unlocked Cell Phones"],"hierarchicalCategories":{"lvl0":"Cell Phones","lvl1":"Cell Phones > Unlocked Cell Phones","lvl2":"Cell Phones > Unlocked Cell Phones > All Unlocked Cell Phones"},"type":"Unlocked handsets","price":199.99,"price_range":"100 - 200","image":"https://cdn-demo.algolia.com/bestbuy-0118/5191101_sb.jpg","url":"https://api.bestbuy.com/click/-/5191101/pdp","free_shipping":true,"rating":4,"popularity":21286,"objectID":"5191101","_highlightResult":{"name":{"value":"<em>M</em>otorola - <em>M</em>OTO G (4th Generation) 4G LTE with 16GB <em>M</em>emory Cell Phone (Unlocked) - Black","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"description":{"value":"Stay in touch with loved ones with this unlocked <em>M</em>otorola <em>M</em>oto G phone. It has a thin, lightweight design for comfort and a <em>m</em>icro-texture back and rounded edges for an enhanced grip. TurboPower-enabled charging provides extra battery juice in 15 <em>m</em>inutes, and you can talk with others via any carrier with this unlocked <em>M</em>otorola <em>M</em>oto G phone.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"brand":{"value":"<em>M</em>otorola","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"categories":[{"value":"Cell Phones","matchLevel":"none","matchedWords":[]},{"value":"Unlocked Cell Phones","matchLevel":"none","matchedWords":[]},{"value":"All Unlocked Cell Phones","matchLevel":"none","matchedWords":[]}],"type":{"value":"Unlocked handsets","matchLevel":"none","matchedWords":[]}}},{"name":"Microsoft - $15 Xbox Gift Card","description":"Get an Xbox gift card for games and entertainment on Xbox and Windows. Buy the latest games, map packs, movies, TV, music, apps and more. Great as a gift, allowance, or credit card alternative.","brand":"Microsoft","categories":["Video Games","Xbox 360","Xbox Live","Xbox Live Currency"],"hierarchicalCategories":{"lvl0":"Video Games","lvl1":"Video Games > Xbox 360","lvl2":"Video Games > Xbox 360 > Xbox Live","lvl3":"Video Games > Xbox 360 > Xbox Live > Xbox Live Currency"},"type":"Xbox live posa","price":15,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/4249408_sb.jpg","url":"https://api.bestbuy.com/click/-/4249408/pdp","free_shipping":true,"rating":4,"popularity":21207,"objectID":"4249408","_highlightResult":{"name":{"value":"<em>M</em>icrosoft - $15 Xbox Gift Card","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"description":{"value":"Get an Xbox gift card for games and entertainment on Xbox and Windows. Buy the latest games, <em>m</em>ap packs, <em>m</em>ovies, TV, <em>m</em>usic, apps and <em>m</em>ore. Great as a gift, allowance, or credit card alternative.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"brand":{"value":"<em>M</em>icrosoft","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"categories":[{"value":"Video Games","matchLevel":"none","matchedWords":[]},{"value":"Xbox 360","matchLevel":"none","matchedWords":[]},{"value":"Xbox Live","matchLevel":"none","matchedWords":[]},{"value":"Xbox Live Currency","matchLevel":"none","matchedWords":[]}],"type":{"value":"Xbox live posa","matchLevel":"none","matchedWords":[]}}},{"name":"Microsoft - $50 Xbox Gift Card","description":"Get an Xbox gift card for games and entertainment on Xbox and Windows. Buy the latest games, map packs, movies, TV, music, apps and more. Great as a gift, allowance, or credit card alternative.","brand":"Microsoft","categories":["Video Games","Xbox 360","Xbox Live","Xbox Live Currency"],"hierarchicalCategories":{"lvl0":"Video Games","lvl1":"Video Games > Xbox 360","lvl2":"Video Games > Xbox 360 > Xbox Live","lvl3":"Video Games > Xbox 360 > Xbox Live > Xbox Live Currency"},"type":"Xbox live posa","price":50,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/4248500_sb.jpg","url":"https://api.bestbuy.com/click/-/4248500/pdp","free_shipping":true,"rating":4,"popularity":21165,"objectID":"4248500","_highlightResult":{"name":{"value":"<em>M</em>icrosoft - $50 Xbox Gift Card","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"description":{"value":"Get an Xbox gift card for games and entertainment on Xbox and Windows. Buy the latest games, <em>m</em>ap packs, <em>m</em>ovies, TV, <em>m</em>usic, apps and <em>m</em>ore. Great as a gift, allowance, or credit card alternative.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"brand":{"value":"<em>M</em>icrosoft","matchLevel":"full","fullyHighlighted":false,"matchedWords":["m"]},"categories":[{"value":"Video Games","matchLevel":"none","matchedWords":[]},{"value":"Xbox 360","matchLevel":"none","matchedWords":[]},{"value":"Xbox Live","matchLevel":"none","matchedWords":[]},{"value":"Xbox Live Currency","matchLevel":"none","matchedWords":[]}],"type":{"value":"Xbox live posa","matchLevel":"none","matchedWords":[]}}}],"nbHits":17307,"page":0,"nbPages":167,"hitsPerPage":6,"processingTimeMS":9,"facets":{"brand":{"Metra":591,"Insignia™":589,"Samsung":532,"HP":400,"Sony":312,"GE":304,"Apple":300,"KitchenAid":269,"Whirlpool":229,"LG":219},"price":{"39.99":891,"49.99":865,"19.99":803,"29.99":708,"99.99":654,"59.99":519,"24.99":497,"14.99":406,"16.99":394,"79.99":394},"categories":{"Appliances":3369,"Computers & Tablets":3039,"Cell Phones":2441,"Cell Phone Accessories":2106,"Audio":1334,"Small Kitchen Appliances":1257,"Cameras & Camcorders":1163,"Car Electronics & GPS":1072,"TV & Home Theater":1051,"Cell Phone Cases & Clips":849},"price_range":{"1 - 50":7696,"50 - 100":2795,"200 - 500":2278,"100 - 200":2270,"500 - 2000":1997,"> 2000":271},"free_shipping":{"true":14528,"false":2779},"hierarchicalCategories.lvl0":{"Appliances":3369,"Computers & Tablets":3039,"Cell Phones":2441,"Audio":1334,"Cameras & Camcorders":1163,"Car Electronics & GPS":1072,"TV & Home Theater":1051,"Health, Fitness & Beauty":714,"Video Games":423,"Smart Home":338}},"facets_stats":{"price":{"min":1,"max":4999.99,"avg":248.43,"sum":4299580}},"exhaustiveFacetsCount":true,"exhaustiveNbHits":true,"query":"m","params":"query=m&hitsPerPage=6&maxValuesPerFacet=10&page=0&facets=%5B%22price_range%22%2C%22price%22%2C%22brand%22%2C%22free_shipping%22%2C%22price%22%2C%22categories%22%2C%22hierarchicalCategories.lvl0%22%5D&tagFilters=","index":"instant_search"}]}',
    '[{"indexName":"instant_search","params":{"query":"mp","hitsPerPage":6,"maxValuesPerFacet":10,"page":0,"facets":["price_range","price","brand","free_shipping","price","categories","hierarchicalCategories.lvl0"],"tagFilters":""}}]':
      '{"results":[{"hits":[{"name":"SanDisk - Clip Sport Plus 16GB* Bluetooth MP3 Player - Black","description":"Get motivated for your daily workout with this SanDisk Clip Sport Plus wearable MP3 player. Bluetooth technology lets you connect wireless headsets, and the water-resistant design is ideal for outdoor use. Featuring a 16GB memory and built-in FM radio, this SanDisk Clip Sport Plus wearable Bluetooth MP3 player gives you a range of listening options.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":59.99,"price_range":"50 - 100","image":"https://cdn-demo.algolia.com/bestbuy-0118/5508200_sb.jpg","url":"https://api.bestbuy.com/click/-/5508200/pdp","free_shipping":true,"rating":4,"popularity":21045,"objectID":"5508200","_highlightResult":{"name":{"value":"SanDisk - Clip Sport Plus 16GB* Bluetooth <em>MP</em>3 Player - Black","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"description":{"value":"Get motivated for your daily workout with this SanDisk Clip Sport Plus wearable <em>MP</em>3 player. Bluetooth technology lets you connect wireless headsets, and the water-resistant design is ideal for outdoor use. Featuring a 16GB memory and built-in FM radio, this SanDisk Clip Sport Plus wearable Bluetooth <em>MP</em>3 player gives you a range of listening options.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},{"value":"<em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}],"type":{"value":"<em>Mp</em>3 device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}}},{"name":"SanDisk - Clip Jam 8GB* MP3 Player - Black","description":"Wear your music on your sleeve as you head out to jog with this SanDisk Clip Jam MP3 player. The 1-inch LED screen lets you see what\'s queued up, and large buttons make it easy to skip forward without fumbling. This SanDisk Clip Jam MP3 player offers up to 18 hours of play time off a single charge.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":34.99,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/5228207_sb.jpg","url":"https://api.bestbuy.com/click/-/5228207/pdp","free_shipping":true,"rating":4,"popularity":20867,"objectID":"5228207","_highlightResult":{"name":{"value":"SanDisk - Clip Jam 8GB* <em>MP</em>3 Player - Black","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"description":{"value":"Wear your music on your sleeve as you head out to jog with this SanDisk Clip Jam <em>MP</em>3 player. The 1-inch LED screen lets you see what\'s queued up, and large buttons make it easy to skip forward without fumbling. This SanDisk Clip Jam <em>MP</em>3 player offers up to 18 hours of play time off a single charge.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},{"value":"<em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}],"type":{"value":"<em>Mp</em>3 device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}}},{"name":"SanDisk - Clip Sport 8GB* MP3 Player - Blue","description":"This SanDisk Clip Sport MP3 player features 8GB* of built-in storage for ample space to bring your music with you on the go. The 1.4\\" TFT-LCD screen enables easy navigation of your media while you\'re in motion.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":49.99,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/3761037_sb.jpg","url":"https://api.bestbuy.com/click/-/3761037/pdp","free_shipping":true,"rating":4,"popularity":20803,"objectID":"3761037","_highlightResult":{"name":{"value":"SanDisk - Clip Sport 8GB* <em>MP</em>3 Player - Blue","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"description":{"value":"This SanDisk Clip Sport <em>MP</em>3 player features 8GB* of built-in storage for ample space to bring your music with you on the go. The 1.4\\" TFT-LCD screen enables easy navigation of your media while you\'re in motion.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},{"value":"<em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}],"type":{"value":"<em>Mp</em>3 device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}}},{"name":"SanDisk - Clip Sport 8GB* MP3 Player - Black","description":"This SanDisk Clip Sport MP3 player features 8GB* of built-in storage for ample space to bring your music with you on the go. The 1.4\\" TFT-LCD screen enables easy navigation of your media while you\'re in motion.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":49.99,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/3761028_sb.jpg","url":"https://api.bestbuy.com/click/-/3761028/pdp","free_shipping":true,"rating":4,"popularity":20706,"objectID":"3761028","_highlightResult":{"name":{"value":"SanDisk - Clip Sport 8GB* <em>MP</em>3 Player - Black","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"description":{"value":"This SanDisk Clip Sport <em>MP</em>3 player features 8GB* of built-in storage for ample space to bring your music with you on the go. The 1.4\\" TFT-LCD screen enables easy navigation of your media while you\'re in motion.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},{"value":"<em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}],"type":{"value":"<em>Mp</em>3 device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}}},{"name":"SanDisk - Clip Sport Plus 16GB* Bluetooth MP3 Player - Red","description":"Hit the gym with your inspirational playlist when you strap on this SanDisk Clip Sport Plus wearable Bluetooth MP3 player. The built-in FM tuner lets you listen to your favorite stations, and the 16GB memory stores up to 4,000 songs. Featuring a water-resistant design, this SanDisk Clip Sport Plus wearable Bluetooth MP3 player is ideal for outdoor runs or walks.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":59.99,"price_range":"50 - 100","image":"https://cdn-demo.algolia.com/bestbuy-0118/5508202_sb.jpg","url":"https://api.bestbuy.com/click/-/5508202/pdp","free_shipping":true,"rating":4,"popularity":20626,"objectID":"5508202","_highlightResult":{"name":{"value":"SanDisk - Clip Sport Plus 16GB* Bluetooth <em>MP</em>3 Player - Red","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"description":{"value":"Hit the gym with your inspirational playlist when you strap on this SanDisk Clip Sport Plus wearable Bluetooth <em>MP</em>3 player. The built-in FM tuner lets you listen to your favorite stations, and the 16GB memory stores up to 4,000 songs. Featuring a water-resistant design, this SanDisk Clip Sport Plus wearable Bluetooth <em>MP</em>3 player is ideal for outdoor runs or walks.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},{"value":"<em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}],"type":{"value":"<em>Mp</em>3 device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}}},{"name":"Apple - iPod nano® 16GB MP3 Player (8th Generation - Latest Model) - Space Gray","description":"iPod nano comes in 5 stunning colors and is designed to provide hours of entertainment with maximum portability. Its 2.5-inch Multi-Touch display lets you see more of the music, photos, and videos you love.&#185; And it has built-in FM radio as well as support for Fitness Walk + Run and Nike+.","brand":"Apple","categories":["Audio","iPod and MP3 Players","iPods","iPod nano"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > iPods","lvl3":"Audio > iPod and MP3 Players > iPods > iPod nano"},"type":"Mp3 nano shuffle","price":149.99,"price_range":"100 - 200","image":"https://cdn-demo.algolia.com/bestbuy-0118/6932993_sb.jpg","url":"https://api.bestbuy.com/click/-/6932993/pdp","free_shipping":true,"rating":4,"popularity":20408,"objectID":"6932993","_highlightResult":{"name":{"value":"Apple - iPod nano® 16GB <em>MP</em>3 Player (8th Generation - Latest Model) - Space Gray","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},"description":{"value":"iPod nano comes in 5 stunning colors and is designed to provide hours of entertainment with maximum portability. Its 2.5-inch Multi-Touch display lets you see more of the music, photos, and videos you love.¹ And it has built-in FM radio as well as support for Fitness Walk + Run and Nike+.","matchLevel":"none","matchedWords":[]},"brand":{"value":"Apple","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP</em>3 Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]},{"value":"iPods","matchLevel":"none","matchedWords":[]},{"value":"iPod nano","matchLevel":"none","matchedWords":[]}],"type":{"value":"<em>Mp</em>3 nano shuffle","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp"]}}}],"nbHits":252,"page":0,"nbPages":42,"hitsPerPage":6,"processingTimeMS":1,"facets":{"brand":{"Insignia™":26,"Apple":18,"SanDisk":17,"Sony":15,"Griffin Technology":12,"Dynex™":8,"High Roller":7,"Kenwood":7,"Modal":7,"Singing Machine":7},"price":{"49.99":20,"39.99":17,"29.99":13,"12.99":12,"129.99":11,"14.99":11,"19.99":11,"99.99":10,"34.99":9,"149.99":8},"categories":{"Audio":109,"iPod and MP3 Players":40,"MP3 Players":29,"Car Electronics & GPS":25,"Cell Phones":25,"Computers & Tablets":24,"Cell Phone Accessories":21,"Home Audio":19,"Toys, Games & Drones":19,"iPad & Tablet Accessories":17},"price_range":{"1 - 50":134,"100 - 200":41,"50 - 100":41,"200 - 500":27,"500 - 2000":9},"free_shipping":{"true":230,"false":22},"hierarchicalCategories.lvl0":{"Audio":109,"Car Electronics & GPS":25,"Cell Phones":25,"Computers & Tablets":24,"Toys, Games & Drones":19,"Musical Instruments":16,"Cameras & Camcorders":9,"TV & Home Theater":8,"Health, Fitness & Beauty":5,"Office Electronics":4}},"facets_stats":{"price":{"min":4.99,"max":1799.99,"avg":124.376,"sum":31342.9}},"exhaustiveFacetsCount":true,"exhaustiveNbHits":true,"query":"mp","params":"query=mp&hitsPerPage=6&maxValuesPerFacet=10&page=0&facets=%5B%22price_range%22%2C%22price%22%2C%22brand%22%2C%22free_shipping%22%2C%22price%22%2C%22categories%22%2C%22hierarchicalCategories.lvl0%22%5D&tagFilters=","index":"instant_search"}]}',
    '[{"indexName":"instant_search","params":{"query":"mp3","hitsPerPage":6,"maxValuesPerFacet":10,"page":0,"facets":["price_range","price","brand","free_shipping","price","categories","hierarchicalCategories.lvl0"],"tagFilters":""}}]':
      '{"results":[{"hits":[{"name":"SanDisk - Clip Sport Plus 16GB* Bluetooth MP3 Player - Black","description":"Get motivated for your daily workout with this SanDisk Clip Sport Plus wearable MP3 player. Bluetooth technology lets you connect wireless headsets, and the water-resistant design is ideal for outdoor use. Featuring a 16GB memory and built-in FM radio, this SanDisk Clip Sport Plus wearable Bluetooth MP3 player gives you a range of listening options.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":59.99,"price_range":"50 - 100","image":"https://cdn-demo.algolia.com/bestbuy-0118/5508200_sb.jpg","url":"https://api.bestbuy.com/click/-/5508200/pdp","free_shipping":true,"rating":4,"popularity":21045,"objectID":"5508200","_highlightResult":{"name":{"value":"SanDisk - Clip Sport Plus 16GB* Bluetooth <em>MP3</em> Player - Black","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"description":{"value":"Get motivated for your daily workout with this SanDisk Clip Sport Plus wearable <em>MP3</em> player. Bluetooth technology lets you connect wireless headsets, and the water-resistant design is ideal for outdoor use. Featuring a 16GB memory and built-in FM radio, this SanDisk Clip Sport Plus wearable Bluetooth <em>MP3</em> player gives you a range of listening options.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},{"value":"<em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}],"type":{"value":"<em>Mp3</em> device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}}},{"name":"SanDisk - Clip Jam 8GB* MP3 Player - Black","description":"Wear your music on your sleeve as you head out to jog with this SanDisk Clip Jam MP3 player. The 1-inch LED screen lets you see what\'s queued up, and large buttons make it easy to skip forward without fumbling. This SanDisk Clip Jam MP3 player offers up to 18 hours of play time off a single charge.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":34.99,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/5228207_sb.jpg","url":"https://api.bestbuy.com/click/-/5228207/pdp","free_shipping":true,"rating":4,"popularity":20867,"objectID":"5228207","_highlightResult":{"name":{"value":"SanDisk - Clip Jam 8GB* <em>MP3</em> Player - Black","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"description":{"value":"Wear your music on your sleeve as you head out to jog with this SanDisk Clip Jam <em>MP3</em> player. The 1-inch LED screen lets you see what\'s queued up, and large buttons make it easy to skip forward without fumbling. This SanDisk Clip Jam <em>MP3</em> player offers up to 18 hours of play time off a single charge.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},{"value":"<em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}],"type":{"value":"<em>Mp3</em> device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}}},{"name":"SanDisk - Clip Sport 8GB* MP3 Player - Blue","description":"This SanDisk Clip Sport MP3 player features 8GB* of built-in storage for ample space to bring your music with you on the go. The 1.4\\" TFT-LCD screen enables easy navigation of your media while you\'re in motion.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":49.99,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/3761037_sb.jpg","url":"https://api.bestbuy.com/click/-/3761037/pdp","free_shipping":true,"rating":4,"popularity":20803,"objectID":"3761037","_highlightResult":{"name":{"value":"SanDisk - Clip Sport 8GB* <em>MP3</em> Player - Blue","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"description":{"value":"This SanDisk Clip Sport <em>MP3</em> player features 8GB* of built-in storage for ample space to bring your music with you on the go. The 1.4\\" TFT-LCD screen enables easy navigation of your media while you\'re in motion.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},{"value":"<em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}],"type":{"value":"<em>Mp3</em> device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}}},{"name":"SanDisk - Clip Sport 8GB* MP3 Player - Black","description":"This SanDisk Clip Sport MP3 player features 8GB* of built-in storage for ample space to bring your music with you on the go. The 1.4\\" TFT-LCD screen enables easy navigation of your media while you\'re in motion.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":49.99,"price_range":"1 - 50","image":"https://cdn-demo.algolia.com/bestbuy-0118/3761028_sb.jpg","url":"https://api.bestbuy.com/click/-/3761028/pdp","free_shipping":true,"rating":4,"popularity":20706,"objectID":"3761028","_highlightResult":{"name":{"value":"SanDisk - Clip Sport 8GB* <em>MP3</em> Player - Black","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"description":{"value":"This SanDisk Clip Sport <em>MP3</em> player features 8GB* of built-in storage for ample space to bring your music with you on the go. The 1.4\\" TFT-LCD screen enables easy navigation of your media while you\'re in motion.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},{"value":"<em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}],"type":{"value":"<em>Mp3</em> device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}}},{"name":"SanDisk - Clip Sport Plus 16GB* Bluetooth MP3 Player - Red","description":"Hit the gym with your inspirational playlist when you strap on this SanDisk Clip Sport Plus wearable Bluetooth MP3 player. The built-in FM tuner lets you listen to your favorite stations, and the 16GB memory stores up to 4,000 songs. Featuring a water-resistant design, this SanDisk Clip Sport Plus wearable Bluetooth MP3 player is ideal for outdoor runs or walks.","brand":"SanDisk","categories":["Audio","iPod and MP3 Players","MP3 Players"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > MP3 Players"},"type":"Mp3 device - other","price":59.99,"price_range":"50 - 100","image":"https://cdn-demo.algolia.com/bestbuy-0118/5508202_sb.jpg","url":"https://api.bestbuy.com/click/-/5508202/pdp","free_shipping":true,"rating":4,"popularity":20626,"objectID":"5508202","_highlightResult":{"name":{"value":"SanDisk - Clip Sport Plus 16GB* Bluetooth <em>MP3</em> Player - Red","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"description":{"value":"Hit the gym with your inspirational playlist when you strap on this SanDisk Clip Sport Plus wearable Bluetooth <em>MP3</em> player. The built-in FM tuner lets you listen to your favorite stations, and the 16GB memory stores up to 4,000 songs. Featuring a water-resistant design, this SanDisk Clip Sport Plus wearable Bluetooth <em>MP3</em> player is ideal for outdoor runs or walks.","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"brand":{"value":"SanDisk","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},{"value":"<em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}],"type":{"value":"<em>Mp3</em> device - other","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}}},{"name":"Apple - iPod nano® 16GB MP3 Player (8th Generation - Latest Model) - Space Gray","description":"iPod nano comes in 5 stunning colors and is designed to provide hours of entertainment with maximum portability. Its 2.5-inch Multi-Touch display lets you see more of the music, photos, and videos you love.&#185; And it has built-in FM radio as well as support for Fitness Walk + Run and Nike+.","brand":"Apple","categories":["Audio","iPod and MP3 Players","iPods","iPod nano"],"hierarchicalCategories":{"lvl0":"Audio","lvl1":"Audio > iPod and MP3 Players","lvl2":"Audio > iPod and MP3 Players > iPods","lvl3":"Audio > iPod and MP3 Players > iPods > iPod nano"},"type":"Mp3 nano shuffle","price":149.99,"price_range":"100 - 200","image":"https://cdn-demo.algolia.com/bestbuy-0118/6932993_sb.jpg","url":"https://api.bestbuy.com/click/-/6932993/pdp","free_shipping":true,"rating":4,"popularity":20408,"objectID":"6932993","_highlightResult":{"name":{"value":"Apple - iPod nano® 16GB <em>MP3</em> Player (8th Generation - Latest Model) - Space Gray","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},"description":{"value":"iPod nano comes in 5 stunning colors and is designed to provide hours of entertainment with maximum portability. Its 2.5-inch Multi-Touch display lets you see more of the music, photos, and videos you love.¹ And it has built-in FM radio as well as support for Fitness Walk + Run and Nike+.","matchLevel":"none","matchedWords":[]},"brand":{"value":"Apple","matchLevel":"none","matchedWords":[]},"categories":[{"value":"Audio","matchLevel":"none","matchedWords":[]},{"value":"iPod and <em>MP3</em> Players","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]},{"value":"iPods","matchLevel":"none","matchedWords":[]},{"value":"iPod nano","matchLevel":"none","matchedWords":[]}],"type":{"value":"<em>Mp3</em> nano shuffle","matchLevel":"full","fullyHighlighted":false,"matchedWords":["mp3"]}}}],"nbHits":393,"page":0,"nbPages":66,"hitsPerPage":6,"processingTimeMS":2,"facets":{"brand":{"Lowepro":42,"Insignia™":28,"Apple":20,"SanDisk":17,"Logitech":15,"Sony":15,"Dynex™":12,"Griffin Technology":12,"Samsung":9,"Canon":8},"price":{"19.99":28,"39.99":26,"29.99":23,"49.99":23,"99.99":15,"12.99":13,"129.99":13,"59.99":13,"14.99":11,"34.99":11},"categories":{"Audio":122,"Cameras & Camcorders":59,"Computers & Tablets":56,"Digital Camera Accessories":43,"iPod and MP3 Players":40,"Cell Phones":39,"Cell Phone Accessories":33,"Camera Bags & Cases":31,"Car Electronics & GPS":29,"MP3 Players":29},"price_range":{"1 - 50":206,"50 - 100":67,"100 - 200":58,"200 - 500":38,"500 - 2000":24},"free_shipping":{"true":355,"false":38},"hierarchicalCategories.lvl0":{"Audio":122,"Cameras & Camcorders":59,"Computers & Tablets":56,"Cell Phones":39,"Car Electronics & GPS":29,"Toys, Games & Drones":24,"Musical Instruments":20,"TV & Home Theater":13,"Office Electronics":9,"Health, Fitness & Beauty":6}},"facets_stats":{"price":{"min":4.99,"max":1799.99,"avg":136.973,"sum":53830.3}},"exhaustiveFacetsCount":true,"exhaustiveNbHits":true,"query":"mp3","params":"query=mp3&hitsPerPage=6&maxValuesPerFacet=10&page=0&facets=%5B%22price_range%22%2C%22price%22%2C%22brand%22%2C%22free_shipping%22%2C%22price%22%2C%22categories%22%2C%22hierarchicalCategories.lvl0%22%5D&tagFilters=","index":"instant_search"}]}',
  };
  return {
    addAlgoliaAgent: function() {},
    search: function(queries, cb) {
      const res = JSON.parse(coldQueries[JSON.stringify(queries)]);
      cb(null, res);
    },
  };
}
