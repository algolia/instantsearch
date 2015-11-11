let React = require('react');
let ReactDOM = require('react-dom');

let utils = require('../../lib/utils.js');
let any = require('lodash/collection/any');
let bem = utils.bemHelper('ais-hits-per-page-selector');
let cx = require('classnames');
let autoHideContainerHOC = require('../../decorators/autoHideContainer');

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[0].value number of hits to display per page
 * @param  {string} options.options[0].label Label to display in the option
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string} [options.cssClasses.item] CSS classes added to each `<option>`
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @return {Object}
 */

const usage = `Usage:
hitsPerPageSelector({
  container,
  options,
  [ cssClasses.{root,item}={} ],
  [ autoHideContainer=false ]
})`;
function hitsPerPageSelector({
    container,
    options,
    cssClasses: userCssClasses = {},
    autoHideContainer = false
  } = {}) {
  if (!container || !options) {
    throw new Error(usage);
  }

  let containerNode = utils.getContainerNode(container);
  let Selector = require('../../components/Selector');
  if (autoHideContainer === true) {
    Selector = autoHideContainerHOC(Selector);
  }

  return {
    init: function(state) {
      let isCurrentInOptions = any(options, function(option) {
        return +state.hitsPerPage === +option.value;
      });

      if (!isCurrentInOptions) {
        options = [{value: undefined, label: ''}].concat(options);
        if (window.console) {
          window.console.log('[Warning][hitsPerPageSelector] No option in `options` with `value: hitsPerPage` (hitsPerPage: ' + state.hitsPerPage + ')');
        }
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

      let cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        item: cx(bem('item'), userCssClasses.item)
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
