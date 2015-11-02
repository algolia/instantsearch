var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');
var reduce = require('lodash/collection/reduce');
var bem = utils.bemHelper('ais-hits-per-page-selector');
var cx = require('classnames');
var autoHideContainer = require('../../decorators/autoHideContainer');

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[0].value number of hits to display per page
 * @param  {string} options.options[0].label Label to display in the option
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string} [options.cssClasses.root] CSS classes added to the parent <select>
 * @param  {string} [options.cssClasses.item] CSS classes added to each <option>
 * @param  {boolean} [hideContainerWhenNoResults=false] Hide the container when no results match
 * @return {Object}
 */

function hitsPerPageSelector({
    container,
    options,
    cssClasses = {},
    hideContainerWhenNoResults = false
  }) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: hitsPerPageSelector({container, options[, cssClasses.{root,item}, hideContainerWhenNoResults]})';

  var Selector = require('../../components/Selector');
  if (hideContainerWhenNoResults === true) {
    Selector = autoHideContainer(Selector);
  }

  if (!container || !options) {
    throw new Error(usage);
  }

  return {
    init: function(state) {
      var isCurrentInOptions = reduce(options, function(res, option) {
        return res || +state.hitsPerPage === +option.value;
      }, false);
      if (!isCurrentInOptions) {
        throw new Error('[hitsPerPageSelector]: No option in `options` with `value: ' + state.hitsPerPage + '`');
      }
    },

    setHitsPerPage: function(helper, value) {
      helper.setQueryParameter('hitsPerPage', +value);
      helper.search();
    },

    render: function({helper, state, results}) {
      let currentValue = state.hitsPerPage;
      let hasNoResults = results.nbHits === 0;
      let setHitsPerPage = this.setHitsPerPage.bind(this, helper);

      cssClasses = {
        root: cx(bem(null), cssClasses.root),
        item: cx(bem('item'), cssClasses.item)
      };
      ReactDOM.render(
        <Selector
          cssClasses={cssClasses}
          currentValue={currentValue}
          options={options}
          setValue={setHitsPerPage}
          shouldAutoHideContainer={hasNoResults}
        />,
        containerNode
      );
    }
  };
}

module.exports = hitsPerPageSelector;
