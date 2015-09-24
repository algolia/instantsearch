var React = require('react');

var utils = require('../lib/utils.js');

/**
 * Instantiate a searchbox
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} [options.placeholder='Search here'] Input's placeholder
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, input
 * @param  {String|String[]} [options.cssClasses.root=null]
 * @param  {String|String[]} [options.cssClasses.input=null]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {boolean} [poweredBy=false] Show a powered by Algolia link below the input
 * @return {Object}
 */
function searchbox({
    container = null,
    placeholder = 'Search here',
    cssClasses = {
      input: null,
      root: null
    },
    templates = {
      header: '',
      footer: ''
    },
    poweredBy = false
  }) {
  var SearchBox = require('../components/SearchBox');

  var containerNode = utils.getContainerNode(container);
  var isFocused = false;

  return {
    _render(state, helper) {
      React.render(
        <SearchBox
          onFocus={()=> { isFocused = true; }}
          onBlur={()=> { isFocused = false; }}
          setQuery={helper.setQuery.bind(helper)}
          search={helper.search.bind(helper)}
          placeholder={placeholder}
          templates={templates}
          cssClasses={cssClasses}
          value={state.query}
          poweredBy={poweredBy}
        />,
        containerNode
      );
    },

    init(initialState, helper) {
      this._render(initialState, helper);
    },

    render({state, helper}) {
      if (!isFocused) {
        this._render(state, helper);
      }
    }
  };
}

module.exports = searchbox;
