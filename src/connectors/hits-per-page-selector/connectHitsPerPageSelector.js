import some from 'lodash/some';

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @function connectHitsPerPageSelector
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
})`;

const connectHitsPerPageSelector = renderHitsPerPageSelector => (widgetParams = {}) => {
  const {options: userOptions} = widgetParams;
  let options = userOptions;

  if (!options) {
    throw new Error(usage);
  }

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

      const currentValue = state.hitsPerPage;

      this.setHitsPerPage = value => helper
        .setQueryParameter('hitsPerPage', value)
        .search();

      renderHitsPerPageSelector({
        currentValue,
        options,
        setValue: this.setHitsPerPage,
        hasNoResults: true,
        widgetParams,
      }, true);
    },

    render({state, results}) {
      const currentValue = state.hitsPerPage;
      const hasNoResults = results.nbHits === 0;

      renderHitsPerPageSelector({
        currentValue,
        options,
        setValue: this.setHitsPerPage,
        hasNoResults,
        widgetParams,
      }, false);
    },
  };
};

export default connectHitsPerPageSelector;
