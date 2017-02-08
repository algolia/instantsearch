import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';
import cx from 'classnames';
import defaultTemplates from './defaultTemplates.js';

const bem = bemHelper('ais-stats');

/**
 * Display various stats about the current search state
 * @function stats
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.body] Body template, provided with `hasManyResults`,
 * `hasNoResults`, `hasOneResult`, `hitsPerPage`, `nbHits`, `nbPages`, `page`, `processingTimeMS`, `query`
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData.body] Function to change the object passed to the `body` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.time] CSS class to add to the element wrapping the time processingTimeMs
 * @return {Object}
 */
const usage = `Usage:
stats({
  container,
  [ templates.{header,body,footer} ],
  [ transformData.{body} ],
  [ autoHideContainer]
})`;
const connectStats = statsRendering => ({
    container,
    cssClasses: userCssClasses = {},
    autoHideContainer = true,
    templates = defaultTemplates,
    collapsible = false,
    transformData,
  } = {}) => {
  if (!container) throw new Error(usage);
  const containerNode = getContainerNode(container);

  if (!containerNode) {
    throw new Error(usage);
  }

  const cssClasses = {
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    header: cx(bem('header'), userCssClasses.header),
    root: cx(bem(null), userCssClasses.root),
    time: cx(bem('time'), userCssClasses.time),
  };

  return {
    init({templatesConfig, helper}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates,
      });

      statsRendering({
        collapsible,
        cssClasses,
        hitsPerPage: helper.state.hitsPerPage,
        nbHits: 0,
        nbPages: 0,
        page: helper.state.page,
        processingTimeMS: -1,
        query: '',
        shouldAutoHideContainer: autoHideContainer,
        templateProps: this._templateProps,
        containerNode,
      }, true);
    },

    render({results}) {
      statsRendering({
        collapsible,
        cssClasses,
        hitsPerPage: results.hitsPerPage,
        nbHits: results.nbHits,
        nbPages: results.nbPages,
        page: results.page,
        processingTimeMS: results.processingTimeMS,
        query: results.query,
        shouldAutoHideContainer: autoHideContainer && results.nbHits === 0,
        templateProps: this._templateProps,
        containerNode,
      }, false);
    },
  };
};

export default connectStats;
