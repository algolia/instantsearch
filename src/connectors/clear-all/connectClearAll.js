import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
  getRefinements,
  clearRefinementsFromState,
  clearRefinementsAndSearch,
} from '../../lib/utils.js';
import cx from 'classnames';
import defaultTemplates from './defaultTemplates.js';

const bem = bemHelper('ais-clear-all');

const usage = `Usage:
clearAll({
  container,
  [ cssClasses.{root,header,body,footer,link}={} ],
  [ templates.{header,link,footer}={link: 'Clear all'} ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
  [ excludeAttributes=[] ]
})`;

const connectClearAll = renderClearAll => ({
    container,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
    collapsible = false,
    autoHideContainer = true,
    excludeAttributes = [],
  } = {}) => {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    link: cx(bem('link'), userCssClasses.link),
  };

  return {
    init({helper, templatesConfig, createURL}) {
      this.clearAll = this.clearAll.bind(this, helper);
      this._templateProps = prepareTemplateProps({defaultTemplates, templatesConfig, templates});

      renderClearAll({
        clearAll: this.clearAll,
        collapsible,
        cssClasses,
        hasRefinements: false,
        shouldAutoHideContainer: autoHideContainer,
        templateProps: this._templateProps,
        url: createURL(clearRefinementsFromState(helper.state)),
        containerNode,
      }, true);
    },

    render({results, state, createURL}) {
      this.clearAttributes = getRefinements(results, state)
        .map(one => one.attributeName)
        .filter(one => excludeAttributes.indexOf(one) === -1);
      const hasRefinements = this.clearAttributes.length !== 0;
      const url = createURL(clearRefinementsFromState(state));

      renderClearAll({
        clearAll: this.clearAll,
        collapsible,
        cssClasses,
        hasRefinements,
        shouldAutoHideContainer: autoHideContainer && !hasRefinements,
        templateProps: this._templateProps,
        url,
        containerNode,
      }, false);
    },

    clearAll(helper) {
      if (this.clearAttributes.length > 0) {
        clearRefinementsAndSearch(helper, this.clearAttributes);
      }
    },
  };
};

export default connectClearAll;
