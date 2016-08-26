import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  getContainerNode
} from '../../lib/utils.js';
import some from 'lodash/some';
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import SelectorComponent from '../../components/Selector.js';

const bem = bemHelper('ais-hits-per-page-selector');

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @function hitsPerPageSelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[0].value number of hits to display per page
 * @param  {string} options.options[0].label Label to display in the option
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<option>`
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
    options: userOptions,
    cssClasses: userCssClasses = {},
    autoHideContainer = false
  } = {}) {
  let options = userOptions;

  if (!container || !options) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  let Selector = SelectorComponent;
  if (autoHideContainer === true) {
    Selector = autoHideContainerHOC(Selector);
  }

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item)
  };

  return {
    init({helper, state}) {
      const isCurrentInOptions = some(
        options,
        option => Number(state.hitsPerPage) === Number(option.value)
      );

      if (!isCurrentInOptions) {
        if (state.hitsPerPage === undefined) {
          if (window.console) {
            window.console.log(
`[Warning][hitsPerPageSelector] hitsPerPage not defined.
You should probably use a \`hits\` widget or set the value \`hitsPerPage\`
using the searchParameters attribute of the instantsearch constructor.`
            );
          }
        } else if (window.console) {
          window.console.log(
`[Warning][hitsPerPageSelector] No option in \`options\`
with \`value: hitsPerPage\` (hitsPerPage: ${state.hitsPerPage})`
          );
        }

        options = [{value: undefined, label: ''}].concat(options);
      }

      this.setHitsPerPage = value => helper
        .setQueryParameter('hitsPerPage', Number(value))
        .search();
    },

    render({state, results}) {
      let currentValue = state.hitsPerPage;
      let hasNoResults = results.nbHits === 0;

      ReactDOM.render(
        <Selector
          cssClasses={cssClasses}
          currentValue={currentValue}
          options={options}
          setValue={this.setHitsPerPage}
          shouldAutoHideContainer={hasNoResults}
        />,
        containerNode
      );
    }
  };
}

export default hitsPerPageSelector;
